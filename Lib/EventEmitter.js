/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     9th July 2012
 * @edited      9th July 2012
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
var Events                              = use('events');

/**
 * A wrapper for the EventEmitter.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.1.0
 * @subpackage  Lib
 */
var EventEmitter = Class.create(function() {
    this.constructor = function() { emitter = new Events.EventEmitter; };

    this.addListener = function(event, listener) { return emitter.addListener(event, listener); };
    this.emit = function() { return emitter.emit.apply(emitter, Array.prototype.slice.call(arguments)); };
    this.listeners = function(event) { return emitter.listeners(event); };
    this.on = function(event, listener) { return emitter.on(event, listener); };
    this.once = function(event, listener) { return emitter.once(event, listener); };
    this.removeListener = function(event, listener) { return emitter.removeListener(event, listener); };
    this.removeAllListeners = function(event) { return emitter.removeAllListeners(event); };
    this.setMaxListeners = function(n) { return emitter.setMaxListeners(n); };

    var emitter;
});

module.exports                          = EventEmitter;