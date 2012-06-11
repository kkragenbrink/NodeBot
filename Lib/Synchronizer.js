 /**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     6th March 2012
 * @edited      7th March 2012
 * @package     NodeBot
 *
 * Copyright (C) 2012 Kevin Kragenbrink <kevin@writh.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
var Class                               = use('/Lib/Class');

/**
 * Ensures all operations are complete before allowing a process to continue.
 *
 * Synchronizers are used to run multiple asynchronous operations in parallel,
 * while ensuring that all of those operations are complete before processing
 * can continue.
 *
 * This synchronizer is an implementation of the Structured Synchronizing Merge,
 * and also encapsulates the Multi-Choice pattern with it.
 *
 * @see http://workflowpatterns.com/patterns/control/advanced_branching/wcp7.php
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @credit      Warren Benedetto <warren@gaikai.com>
 * @version     0.1.0
 * @subpackage  Lib
 * @lends       Synchronizer
 */
var Synchronizer = Class.create(function() {
    var self                            = this;

    /**
     * Constructs the Synchronizer.
     */
    this.constructor = function() {
        // Instantiate functions as an array.
        functions                       = [];
    };

    /**
     * Adds a function to be managed by the synchronizer.
     *
     * Functions will be run in the context of the Synchronizer. If additional
     * context is needed, it should be given to the function as a
     * preset variable.
     *
     * Functions added to the Synchronizer must throw an error if they fail,
     * or else pass an error as a parameter into the Callback.
     *
     * Functions should expect to receive a callback as a parameter, which
     * must be called when the function is complete.  The callback accepts one
     * parameter: the function results, which will be stored in the
     * synchronizer for merging and validation.
     *
     * While running, functions can check the halted variable to determine
     * whether the synchronizer has been halted by some other action.
     *
     * @param   {Function}  fn
     * @param   {Integer}   [timeout]
     * @return  {Object}    The synchronizer instance.
     */
    this.addFunction = function(fn, timeout) {
        if (running || halted) {
            throw new Error("Synchronizer must be reset before adding a new function.");
        }

        functions.push({
            fn                          : fn,
            complete                    : null,
            result                      : null,
            timer                       : null,
            timeout                     : timeout || defaultTimeout
        });

        return this;
    };

    /**
     * Returns the number of completed functions in the last run.
     * @return  {Integer}
     */
    this.countCompleted = function() {
        return completed;
    };

    /**
     * Get sthe functions in the synchronizer.
     *
     * This function also returns their metadata.
     *
     * @return  {Array}
     */
    this.getFunctions = function() {
        return functions;
    };

    /**
     * Removes a function from the synchronizer.
     *
     * @param   {Integer}   i   The function index to be removed.
     */
    this.removeFunction = function(i) {
        if (running || halted) {
            throw new Error("Synchronizer must be reset before removing a function.");
        }

        var newArray                    = [];
        for (var f = 0; f < functions.length; f++) {
            if (f !== i) {
                newArray.push(functions[f]);
            }
        }
        functions                       = newArray;

        return this;
    };

    /**
     * Halts execution of the synchronizer.
     *
     * WARNING: Individual functions in the synchronizer may still be processing;
     * functions may check for the halted variable to watch for a synchronizer halt
     * request, but are not required to do so.
     *
     * All timeouts are cancelled, and the onHalt method is called.
     *
     * @return  {Object}    The synchronizer instance
     */
    this.halt = function() {
        // If we're not running, there's no need to halt.
        if (!running) {
            return this;
        }

        halted                          = true;
        running                         = false;

        for (var i = 0; i < functions.length; i++) {
            clearTimeout(functions[i].timer);
        }

        return this;
    };

    /**
     * Resets the synchronizer so it can be run again.
     *
     * This function should only be called once all functions have completed, or
     * when the Synchronizer has timed out, failed, or been halted.
     */
    this.reset = function() {
        if (!halted || completed < functions.length) {
            throw new Error("Synchronizer must be halted or complete before resetting.");
        }

        // Reset the functions.
        for (var i = 0; i < functions.length; i++) {
            functions[i].complete       = null;
            functions[i].result         = null;
            functions[i].timer          = null;
        }

        // Nothing has been completed in a reset!
        completed                       = 0;

        // Reset the running condition last.
        running                         = false;
    };

    /**
     * Executes all functions added to the Synchronizer.
     * @param   {*[]}    parameters
     */
    this.run = function(parameters) {
        // Make sure we don't try to call the Synchronizer before its last run was complete.
        if (running || halted) {
            throw new Error("Synchronizer must be reset before running again.");
        }

        // Mark the synchronizer as running.
        running                         = true;

        for (var i = 0; i < functions.length; i++) {
            functions[i].timer          = setTimer(i);

            try {
                functions[i].fn.call(this, getCallback(i), parameters);
            }
            catch (e) {
                clearTimeout(functions[i].timer);
                functions[i].complete   = false;
                this.onFail(functions[i], e);
            }
        }
    };

    /**
     * This function is called when all operations are complete.
     *
     * It is intended to be replaced in specific instances.
     *
     * @example
     *  var Foo = new Synchronizer();
     *  Foo.onComplete = function() {
     *      console.log("Synchronizer complete.");
     *  };
     *  Foo.run();
     */
    this.onComplete = function() {};

    /**
     * This function is called when a function has failed.
     *
     * It is intended to be replaced in specific instances.
     *
     * @param   {Integer}   functionNumber      The index of the failed function
     * @param errorObject
     */
    this.onFail = function(functionNumber, errorObject) {};

    /**
     * This function is called when the synchronizer is artificially halted.
     *
     * It is intended to be replaced in specific instances.
     *
     * @example
     *  var Foo = new Synchronizer();
     *  Foo.onHalt = function() {
     *      console.error("Synchronizer halted.");
     *  };
     *  Foo.run();
     */
    this.onHalt = function() {};

    /**
     * This function is called when a function times out.
     *
     * It is intended to be replaced in specific instances.
     *
     * @param   {Integer}   functionNumber      The index of the failed function
     * @example
     *  var Foo = new Synchronizer();
     *  Foo.onTimeout = function(functionNumber) {
     *      console.error("Function " + functionNumber + " failed.");
     *  };
     *  Foo.run();
     */
    this.onTimeout = function(functionNumber) {};

    function getCallback(i) {
        return function(result) {
            if (!halted) {
                // Clear the timer.
                clearTimeout(functions[i].timer);

                // Mark the function as complete.
                functions[i].complete   = true;
                completed++;

                // Set the reuslts.
                if(typeof result !== 'undefined') {
                    functions[i].result = result;
                }

                // Catch failed functions.
                if (result instanceof Error) {
                    self.onFail(functions[i], result);
                }

                // If all functions are complete, fire the onComplete function.
                if (running && completed === functions.length) {
                    self.onComplete();
                    self.reset();
                }
            }
        };
    }

    /**
     * Creates a timer
     * @param   {Integer}   i   The index of the function to set a timer for.
     * @return  {Number}
     */
    function setTimer(i) {
        return setTimeout(function() {
            if (functions[i].complete === null) {
                functions[i].complete   = false;
                self.onTimeout(i);
            }
        }, functions[i].timeout);
    }

    /**
     * All functions in the synchronizer.
     * @var     {Object[]}
     */
    var functions;

    /**
     * Functions which have completed during the current run.
     * @var     {Integer}
     */
    var completed                       = 0;

    /**
     * Whether the last run was killed prematurely.
     * @var     {Boolean}
     */
    var halted                          = false;

    /**
     * Whether the synchronizer is currently running.
     * @var     {Boolean}
     */
    var running                         = false;

    /**
     * The default time to wait for a funtion to complete before timing out.
     * @param   {Integer}   Time in milliseconds.
     */
    var defaultTimeout                  = 60000;
});
module.exports                          = Synchronizer;