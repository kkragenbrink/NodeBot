/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     15th May 2012
 * @edited      15th May 2012
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

var Cache                               = use('/Lib/Cache');
var Class                               = use('/Lib/Class');
var Log                                 = use('/Lib/Log');
var Util                                = use('/Lib/Util');

/**
 * A common interface for accessing command-line arguments.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.1.0
 * @subpackage  Lib
 * @singleton
 */
var Arguments = Class.create(function() {

    /**
     * Processes the command line arguments and stores them.
     */
    this.constructor = function() {
        Log.log('Lib/Arguments', 'Processing arguments.');

        var arguments                   = process.argv.slice(2, process.argv.length);
        var key;
        var value;
        var args                        = {};
        for (var a = 0; a < arguments.length; a++) {
            if (arguments[a].indexOf('=') > 0) {
                key                     = arguments[a].substr(0, arguments[a].indexOf('='));
                value                   = arguments[a].substr(arguments[a].indexOf('=') + 1);

                if (value.toLowerCase() === 'true') {
                    value               = true;
                }
                else if (value.toLowerCase() === 'false') {
                    value               = false;
                }
            }
            else {
                key                     = arguments[a];
                value                   = true;
            }

            if (key.indexOf('--') == 0) {
                key                     = key.substr(2);
            }

            args[key]                   = value;
        }

        Log.debug('Lib/Arguments', 'Setting arguments:', args);
        Cache.set('Arguments', args);
    };

    /**
     * Gets the value of an argument.
     * @param   {String}    key
     * @return  {String|Boolean}
     */
    this.getArgument = function(key) {
        return Cache.get(Util.sprintf('Arguments.%s', key));
    };

    /**
     * Expresses whether an argument has been set.
     * @param   {String}    key
     * @return  {Boolean}
     */
    this.hasArgument = function(key) {
        return Cache.has(Util.sprintf('Arguments.%s', key));
    };
});

module.exports                         = new Arguments;