/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     9th March 2012
 * @edited      18th March 2012
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
 * Manages data across an asynchronous, disconnected process.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.2.1
 * @subpackage  Lib
 */
var Process = Class.create(function() {
    var Log                                 = use('/Lib/Log');
    var ProcessManager                      = use('/Lib/ProcessManager');
    var Util                                = use('/Lib/Util');

    var ancestor                            = null;
    var callback                            = null;
    var children                            = null;
    var data                                = null;
    var pid                                 = null;

    /**
     * Creates the process and assigns its values..
     * @param   {Integer}   pid
     * @param   {Function}  callback
     * @param   {Mixed}     [data]
     */
    this.constructor = function(pid, callback, data) {
        this.callback                   = callback;
        this.children                   = [];
        this.data                       = data;
        this.pid                        = pid;
    };

    /**
     * Getter for the process callback.
     *
     */
    this.__defineGetter__('callback', function() { return callback; });

    /**
     * Setter for the process callback.
     * @param   {Function}  c
     */
    this.__defineSetter__('callback', function(c) {
        if (!(c instanceof Function)) {
            throw new TypeError('Callback is not a function.');
        }
        callback                        = c;
    });

    /**
     * Getter for process ancestor.
     */
    this.__defineGetter__('ancestor', function() { return ancestor; });

    /**
     * Setter for process ancestor.
     * @param   {Number}    p
     */
    this.__defineSetter__('ancestor', function(a) {
        if (typeof a !== 'number') {
            throw new TypeError('Ancestor is not a valid process.');
        }
        ancestor                        = a;
    });

    /**
     * Getter for the process children;
     */
    this.__defineGetter__('children', function() { return children; });

    /**
     * Setter for the process children.
     * @param   {Integer[]} c
     */
    this.__defineSetter__('children', function(c) {
        if (!Util.isArray(c)) {
            throw new TypeError('Children is not an array.');
        }
        children                        = c;
    });

    /**
     * Getter for the process data.
     */
    this.__defineGetter__('data', function() { return data; });

    /**
     * Setter for the process data.
     * @param   {Mixed}     d
     */
    this.__defineSetter__('data', function(d) {
        data                            = d;
    });

    /**
     * Getter for the process pid.
     */
    this.__defineGetter__('pid', function() { return pid; });

    /**
     * Setter for the process pid.
     * @param   {Integer}   p
     */
    this.__defineSetter__('pid', function(p) {
        if (typeof p !== 'number') {
            throw new TypeError('PID is not a number.');
        }
        pid                             = p;
    });

    /**
     * Adds a child process to this process.
     * @param   {Process}   process
     * @return  {Process}
     */
    this.addChild = function(process) {
        if (process instanceof Process) {
            this.children.push(process.pid);
        }
        else {
            throw new TypeError('Attempted to add a non-process as a child.');
        }
    };

    /**
     * Destroys this process and all of its children.
     *
     * Also deregisters the process from its ancestor, if needed.
     */
    this.destroy = function() {
        if (this.ancestor !== null) {
            ProcessManager.getProcess(this.ancestor).removeChild(pid);
        }

        for (var i = 0; i < this.children.length; i++) {
            var child                   = this.children[i];
            ProcessManager.destroyProcess(child);
        }
    };

    /**
     * Removes a specific child from the process.
     * @param   {Integer}   pid
     * @return  {Process}
     */
    this.removeChild = function(pid) {
        var idx                         = this.children.indexOf(pid);
        if (ProcessManager.getProcess(pid) instanceof Process && idx > -1) {
            this.children.splice(idx, 1);
        }
    };

    /**
     * Calls the process manager to spawn a child process.
     * @param   {Function}  callback
     * @param   {Object}    [data]
     * @return  {Integer}
     */
    this.spawn = function(callback, data) {
        var proc                        = ProcessManager.createProcess(callback, data);

        this.addChild(proc);
        proc.ancestor                   = this.pid;

        return proc;
    };

    /**
     * Triggers the process callback, then destroys the process.
     *
     * If the process has a parent and all other child processes have
     * completed, the parent will be triggered.
     *
     * @param   {Object}    [instruction]
     */
    this.trigger = function(instruction) {
        this.callback.call(this, instruction);
        this.destroy();

        if (this.ancestor !== null) {
            var proc                        = ProcessManager.getProcess(this.ancestor);
            if (proc.children.length === 0) {
                proc.trigger();
            }
        }
    };
});
module.exports                          = Process;