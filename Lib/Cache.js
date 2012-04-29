/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     20th January 2012
 * @edited      28th April 2012
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
 * A singleton to cache reusable data.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.2.0
 * @subpackage  Lib
 * @singleton
 */
module.exports = (function() {
    var data                            = {};

    /**
     * Deletes a key from the cache.
     * @param   {String}    key
     */
    this.delete = function(key) {
        delete data[key];
    };

    /**
     * Gets a key from the cache.
     * @param   {String}    key
     * @return  {*}
     * TODO:2012-01-20:Provide a mechanism for recursively reading through objects.
     *                  e.g.: Cache.get('foo.bar');
     */
    this.get = function(key) {
        return data[key];
    };

    /**
     * Determines whether a key exists in the cache.
     * @param   {String}    key
     * @return  {Boolean}
     */
    this.has = function(key) {
        return (typeof data[key] !== 'undefined');
    };

    /**
     * Sets a key in the cache.
     * @param   {String}    key
     * @param   {*}         value
     */
    this.set = function(key, value) {
        if (typeof value !== 'undefined') {
            data[key]                       = value;
        }
    };

    return this;
})();
