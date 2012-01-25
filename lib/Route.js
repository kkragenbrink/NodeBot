/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     25th January 2012
 * @edited      25th January 2012
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

/**
 * A Route class to track individual routes.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.1.0
 * @subpackage  Lib
 * @todo
 *  - Access Groups are only nebulously defined.  They are extremely important
 *      to Route creation, however, and need to be better defined before this
 *      class can be used to its full potential.
 * @lends       Route.prototype
 */
module.exports = function() {
    var Util                            = require('./Util');

    // TODO:2012-01-25:Document this feature.
    var access                          = null;

    // An Object containing various Contexts with additional datapoints to collect.
    var contexts                        = null;

    // A function to be called when the Route is matched.
    var handler                         = null;

    // A Regular Expression detailing the base path to access the route.
    var path                            = null;

    /**
     * Getter for the Access parameter.
     * @return
     */
    this.__defineGetter__('access', function() { return access; });

    /**
     * Setter for the Access parameter.
     * @param               access      The access to set.
     */
    this.__defineSetter__('access', function(a) {
        if (validateAccess(a)) {
            access                      = a;
        }
    });

    /**
     * Getter for the Contexts parameter.
     * @return
     */
    this.__defineGetter__('contexts', function() { return contexts; });

    /**
     * Setter for the Contexts parameter.
     * @param {Object}      contexts        The contexts to set.
     */
    this.__defineSetter__('contexts', function(c) {
        if (validateContexts(c)) {
            contexts                    = c;
        }
    });

    /**
     * Getter for the handler parameter.
     * @return
     */
    this.__defineGetter__('handler', function() { return handler; });

    /**
     * Setter for the Handler parameter.
     * @param {Function}    h     The handler to set.
     */
    this.__defineSetter__('handler', function(h) {
        if (validateHandler(h)) {
            handler                     = h;
        }
    });

    /**
     * Getter for the Path parameter.
     * @return
     */
    this.__defineGetter__('path', function() { return path; });

    /**
     * Setter for the Path parameter.
     * @param {RegExp}      Path        The path to set.
     */
    this.__defineSetter__('path', function(p) {
        if (validatePath(p)) {
            path                        = p;
        }
    });

    /**
     * Ensures that the given access path is valid.
     * @param               access      The access path to validate.
     * @throws  {TypeError}
     * @private
     * @stub
     */
    function validateAccess(access) {
        // STUB
        return false;
    }

    /**
     * Ensures that the given Context object contains valid contexts
     * @param   {Object}    contexts    The contexts to validate.
     * @return  {boolean}
     * @throws  {TypeError}
     * @private
     */
    function validateContexts(contexts) {
        if (typeof contexts !== 'object') {
            throw new Error("Invalid contexts.");
        }

        for (var i in contexts) {
            if (contexts.hasOwnProperty(i)) {
                var ContextName         = i.charAt(0).toUpperCase() + i.substring(1,i.length).toLowerCase();
                var ContextPath         = Util.format('./Context/%s', ContextName);
                var Context             = require(ContextPath);

                if (typeof Context === undefined || !Context.validateDataPoints(contexts[i])) {
                    throw new TypeError("Invalid contexts.");
                }
            }
        }

        return true;
    }

    /**
     * Ensures that the given Handler is valid
     * @param   {Function}  handler     The handler to validate.
     * @return  {boolean}
     * @throws  {TypeError}
     * @private
     */
    function validateHandler(handler) {
        var valid                       = (typeof handler === 'function');
        if (!valid) {
            throw new TypeError("Invalid handler.");
        }
        return valid;
    }

    /**
     * Ensures that the given Path is valid
     * @param   {RegExp}    path        The path to validate.
     * @return  {boolean}
     * @throws  {TypeError}
     * @private
     */
    function validatePath(path) {
        var valid                       = (path instanceof RegExp);
        if (!valid) {
            throw new TypeError("Invalid path.");
        }
        return valid;
    }

    /**
     * The following constructs the instance.
     * @param   path
     * @param   handler
     * @param   contexts
     * @param   access
     * @example
     *      var Route       = require('./Route');
     *
     *      // With route and handler after construction.
     *      var a           = new Route();
     *      a.path          = /a/;
     *      a.handler       = this.handleA;
     *
     *      // With route and handler in constructor.
     *      var b           = new Route(/b/, this.handleB);
     * @constructs
     */
    {
        // If we got arguments during construction, set the appropriate variables
        var args                        = Array.prototype.slice.call(arguments, 0);

        if (args[0] !== undefined && Util.isArray(args[0])) {
            args                        = args[0];
        }

        if (args[0] !== undefined) { this.path = args[0]; }
        if (args[1] !== undefined) { this.handler = args[1]; }
        if (args[2] !== undefined) { this.contexts = args[2]; }
        if (args[3] !== undefined) { this.access = args[3]; }
    }

    return this;
};