/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     7th March 2012
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
var use                                 = require('../Use.js');
var assert                              = use('assert');
var Synchronizer                        = use('/Lib/Synchronizer');
var Util                                = use('util');
var synch;

exports.setUp = function(setUp) {
    synch                               = new Synchronizer();
    setUp.done();
};

/**
 * Asserts that the function list in two separate synchronizers are distinct.
 * @param   {Object}    test
 */
exports.testSynchronizerSeparation = function(test) {
    var extra                           = new Synchronizer();
    synch.addFunction(function() {});
    synch.addFunction(function() {});
    synch.addFunction(function() {});
    extra.addFunction(function() {});
    extra.addFunction(function() {});

    assert.strictEqual(synch.getFunctions().length, 3);
    assert.strictEqual(extra.getFunctions().length, 2);

    test.done();
};

/**
 * Asserts that a function can be removed safely from the list.
 * @param   {Object}    test
 */
exports.testRemoveFunction = function(test) {
    synch.addFunction(function One() {});
    synch.addFunction(function Two() {});
    synch.addFunction(function Three() {});
    synch.removeFunction(1);

    assert.strictEqual(synch.getFunctions().length, 2);
    assert.strictEqual(synch.getFunctions()[0].fn.name, "One");
    assert.strictEqual(synch.getFunctions()[1].fn.name, "Three");

    test.done();
};

/**
 * Asserts that the synchronizer will call all functions before completing.
 * @param   {Object}    test
 */
exports.testRun = function(test) {
    synch.addFunction(function(cb) { cb(); });
    synch.addFunction(function(cb) { cb(); });

    Util.inherits(test, assert);

    synch.onComplete = function() {
        test.strictEqual(synch.countCompleted(), 2);
        test.done();
    };

    synch.run();
};