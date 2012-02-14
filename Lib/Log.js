/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     19th January 2012
 * @edited      08th February 2012
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
 * A central class for logging.
 *
 * This class formats all log entries in a useful format, as well as handles
 * the formatting of logstrings using Util.format().
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.1.2
 * @subpackage  Lib
 * @singleton
 */
module.exports = (function() {
    function Log(type) {
        var name                        = type;

        if (!(name in console)) {
            type                        = 'log';
        }

        return function() {
            var Util                    = require('./Util');
            var args                    = Array.prototype.slice.call( arguments, 0 );
            var date                    = (new Date).getTime();
            var caller                  = args.shift();
            var message                 = Util.format.apply(Util, args);
//                message                 = Util.format('%s [%s:%s] %s', date, caller, name, message);
                message                 = Util.format('%s %s', date, message);

            console[type].call(console, message);
        }
    }

    this.debug                          = new Log('debug');
    this.error                          = new Log('error');
    this.log                            = new Log('log');
    this.warn                           = new Log('warn');
    this.trace                          = new Log('trace');

    return this;
})();