/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     20th January 2012
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

var Class                               = use('/Lib/Class');

/**
 * A singleton to cache reusable data.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.3.0
 * @subpackage  Lib
 * @singleton
 */
var Cache = Class.create(function() {

    /**
     * Instantiates the data object.
     */
    this.constructor = function() {
        data                            = {};
    };

    /**
     * Deletes a key from the cache.
     * @param   {String}    key
     */
    this.delete = function(key) {
        delete data[key];
    };

    /**
     * Gets a key from the cache.
     *
     * If the key is specified in object notation (e.g. foo.bar), NodeBot attempts
     * to retrieve the specific value requested from a cached object.
     *
     * @param   {String}    key
     * @return  {*}
     */
    this.get = function(key) {
        return getObjectKey(key, data);
    };

    /**
     * Recursively loops through the data to find a very specific key.
     * @param   {String}    key
     * @param   {Object}    data
     * @private
     */
    var getObjectKey = function(key, data) {
        if (typeof data === 'object') {
            if (key.indexOf('.') > -1) {
                var container           = key.substr(0, key.indexOf('.'));
                key                     = key.substr(key.indexOf('.') + 1);

                return getObjectKey(key, data[container]);
            }
            else {
                return data[key];
            }
        }
        else {
            return null;
        }
    };

    /**
     * Determines whether a key exists in the cache.
     * @param   {String}    key
     * @return  {Boolean}
     */
    // TODO: This is incredibly slow.  It needs to be made miles faster.
    this.has = function(key) {
        return (typeof getObjectKey(key, data) !== 'undefined');
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

    /**
     * All cached data, stored as an object.
     * @var    {Object}
     * @private
     */
    var data;
});

module.exports                              = new Cache;