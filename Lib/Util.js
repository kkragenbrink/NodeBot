/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     21st January 2012
 * @edited      6th July 2012
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
 * A class for convenient utilities.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.6.0
 * @subpackage  Lib
 * @singleton
 */
module.exports = (function() {
    var Util                            = use('util');
    var Log                             = use('/Lib/Log');

    /**
     * Capitalizes the first letter of a string.
     * @param   {String}        string
     * @return  {String}
     */
    Util.capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    /**
     * Extends an object with any other objects, overwriting variables along the way.
     *
     * The first argument becomes the 'base'; additional arguments will be used to
     * overwrite or extend the base object.  This is very basic inheritence.
     *
     * @param   {Object...}     arguments   The objects to extend.
     * @return  {Object}
     */
    Util.extend = function() {
        var args                        = Array.prototype.slice.call(arguments, 0);

        var object                      = args.shift();

        if (typeof object !== 'object') {
            throw new TypeError('Cannot extend a non-object.');
        }

        var extension;

        while (extension = args.shift()) {
            if (typeof extension !== 'object') {
                Log.warn('Lib/Util', 'Attempted to extend an object with a non-object.');
                continue;
            }

            var properties              = Object.getOwnPropertyNames(extension);
            properties.forEach(function (name) {
                object[name]            = extension[name];
            });
        }

        return object;
    };

    /**
     * Returns the specified time as a SQL DateTime string.
     * @param   {Date}  date
     * @return  {String}
     */
    Util.getSqlTime = function(date) {
        return this.sprintf(
            '%-04d-%-02d-%-02d %-02d:%-02d:%-02d',
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
        );
    };

    /**
     * Determines whether a given needle can be found in a haystack.
     * @param   {*}     needle
     * @param   {*[]}   haystack
     * @return  {Boolean}
     */
    Util.inArray = function(needle, haystack) {
        var found                       = false; // Whether the needle has been found.

        if (!this.isArray(haystack)) {
            Log.warn('Lib/Util', 'Attempted to call inArray on non-array haystack.')
            return false;
        }

        for (var i in haystack) {
            if(haystack.hasOwnProperty(i)) {
                if (haystack[i] === needle) {
                    found                   = true;
                    break;
                }
            }
        }

        return found;
    };

    /**
     * Repeats a string a number of times.
     * @param   {String}    string
     * @param   {Integer}   count
     * @return  {String}
     */
    Util.repeat = function(string, count) {
        var results                     = [];
        for (var i = 0; i < count; i++) {
            results.push(string);
        }
        return results.join('');
    };

    /**
     * Formats data as a string.
     *
     * This function is based on the C++ function of the same name.  It is mostly an
     * extended form of Util.format, which does not handle a number of advanced
     * features of sprintf, such as flags, widths, and precision.
     *
     * TODO: This would probably be better served as a C++ Addon, to be honest.
     */
    Util.sprintf = function() {
        var args                        = Array.prototype.slice.call(arguments, 0);

        if (args.length < 1) {
            return null;
        }

        if (typeof args[0] !== 'string') {
            throw new TypeError('Cannot format non-string value.');
        }

        var format                      = args.shift();
        var expression                  = /%([0-9+-.]+)?([sdj%])/g;

        format                          = format.replace(expression, function(match) {
            return sprintfReplace(match, args);
        });

        return format;
    };

    /**
     * Used by sprintf to replace tokens.
     *
     * @param   {String}    match
     * @param   {*[]}       args
     * @return  {String}
     */
    function sprintfReplace(match, args) {
        var replace;
        var arg                         = args.shift();
        var matches;
        var pad                         = false;
        var padding;
        var precision                   = false;
        var rtl                         = false;
        var signed                      = false;
        var zerofill                    = false;

        switch (true) {
            // Strings
            case /%([0-9-]+)?s/.test(match):

                if (typeof arg === 'string' || typeof arg === 'number') {
                    rtl                 = /^%-/.test(match);
                    pad                 = /(\d+)s/.test(match);
                    if (pad) {
                        matches         = /(\d+)s/.exec(match);
                        padding         = matches[1];

                        if (arg.length > padding) {
                            arg         = arg.substring(0, padding);
                        }
                        else if (arg.length < padding && rtl) {
                            arg         = Util.repeat(' ', padding - arg.length) + arg;
                        }
                        else if (arg.length < padding) {
                            arg        += Util.repeat(' ', padding - arg.length);
                        }
                    }
                    replace             = arg;
                }
                else {
                    replace             = match;
                }
                break;
            // Number
            case /%([0-9+-.]+)?d/.test(match):
                if (typeof arg === 'number') {
                    rtl                 = /\-/.test(match);
                    pad                 = /[^.](\d+)/.test(match);
                    precision           = /(?:[.])(\d+)/.test(match);
                    zerofill            = /[^.](?:0)(\d+)/.test(match);
                    signed              = /\+/.test(match);

                    arg                 = parseFloat(arg);

                    if (precision) {
                        matches         = /(?:[.])(\d+)/.exec(match);
                        arg             = arg.toFixed(matches[1]);
                    }

                    if (pad) {
                        matches         = /[^.](\d+)/.exec(match);
                        padding         = matches[1];

                        if (arg.toString().length > padding) {
                            arg         = arg.toString().substring(0, padding);
                        }
                        else if (arg.toString().length < padding && rtl) {
                            arg         = Util.repeat(zerofill ? '0' : ' ', padding - arg.toString().length) + arg.toString();
                        }
                        else if (arg.toString().length < padding) {
                            arg         = arg.toString() + Util.repeat(zerofill ? '0' : ' ', padding - arg.toString().length);
                        }
                    }

                    if (signed) {
                        arg             = (arg > 0) ? '+' + arg : arg;
                    }
                    replace             = arg;
                }
                break;
            // Json
            case '%j' === match:
                if (typeof arg === 'object') {
                    replace             = Util.format('%j', arg);
                }
                else {
                    replace             = match;
                }
                break;
            // Number
            case '%%' === match:
                replace                 = '%';
                args.unshift(arg);
                break;
            default:
                console.log('default');
                break;
        }

        return replace;
    }

    return Util;
})();