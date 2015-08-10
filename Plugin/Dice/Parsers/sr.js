/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     31st March 2012
 * @edited      14th June 2012
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

var Parser = use('/Lib/Parser');

/**
 * A Shadowrun Dice parser.
 *
 * @todo Document
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.1.0
 * @subpackage  Plugin
 * @plugin      Dice
 * @lends       sr
 */
var sr = Parser.extend(function() {
    var Log                             = use('/Lib/Log');
    var Token                           = use('/Lib/Token');
    var Tokenizer                       = use('/Lib/Tokenizer');
    var Util                            = use('/Lib/Util');


    this.constructor = function (configuration) {
        config = Util.extend(config, configuration);

        results = {
            emitToUser : Util.format(messages.emit, config.prefix),
            emitAroundUser : Util.format(messages.oemit, config.prefix, config.name)
        };

        rolls = [];
        stack = [];
        hits = 0;
        glitches = 0;
        stream = [];
        tokenizer = new Tokenizer(types);
    };

    /**
     * Returns the configuration variables for output.
     * @return {String}
     */
    function formatConfig() {
        var message = '';

        if (config.verbose) {
            var configs = [];

            configs.push(Util.format('Target: %d', config.target));

            message = Util.format(' (%s)', configs.join(', '));
        }

        return message;
    }

    /**
     * Returns the rolls and discarded rolls for output.
     * @return {String}
     */
    function formatVerbose() {
        var message = [];

        if (config.verbose) {
            colorize(rolls);
            message.push(Util.format('Rolls: %s', rolls.join(', ')));
        }

        if (message.length > 0) {
            message = Util.format(' (%s)', message.join('; '));
        }

        return message;
    }

    var colorize = function (set) {
        for (var i in set) {
            if (set[i] >= config.target) {
                set[i] = '%ch%cg' + set[i] + '%cn';
            }
            else if (set[i] <= config.glitch) {
                set[i] = '%ch%cr' + set[i] + '%cn';
            }
        }
    };

    /**
     * Parses an individual token.
     * @param token
     * @param callback
     */
    var parse = function (token, callback) {
        var method = Util.format('parse%s', token.type);
        try {
            this[method].call(this, token.value, callback);
        }
        catch (e) {
            Log.warn('sr parser', method, e.message);
        }
    };

    var getFromRandom = function (dice) {
        var results = [];
        for (var i = 0; i < dice; i++) {
            results.push(1 + Math.floor(Math.random() * 6));
        }
        return results;
    };

    this.parseNextToken = function () {
        var token = tokenizer.getNextToken();

        if (token instanceof Token && token.type !== 'EOF') {
            parse.call(this, token, this.parseNextToken.bind(this));
        }
        else {
            var dice = stack.reduce(function (a, b) { return a + b; }, 0);
            var results = getFromRandom(dice);
            parseFromRandom.call(this, results, rolls, respond);
        }
    };

    var respond = function () {
        var glitch = '';
        for (var method in results) {
            if (glitches >= (rolls.length/2)) {
                glitch = ' %ch%crGlitch%cn.';

                if (!hits) {
                    glitch = ' %ch%crCritical Glitch%cn.';
                }
            }

            results[method] = Util.format(results[method], roll, formatConfig(), hits, glitch, formatVerbose());
        }

        if (config.silent) {
            delete results.emitAroundUser;
        }
        else if (config.gm) {
            results.emitAroundUser = Util.format('%s %s rolls some dice behind the GM screen.', config.prefix, config.name);
        }

        callback(results);
    };

    /**
     * Parses the incoming stream and returns the results.
     *
     * @param   {String}    roll        The string to parse.
     * @return  {Object}
     */
    this.parse = function(r, cb) {
        roll = r;
        callback = cb;
        tokenizer.prepare(roll);
        this.parseNextToken();
    };

    /**
     * Runs the parser an additional number of times and appends the results in place.
     */
    this.parseRepeat = function(amount, callback) {
        amount = parseInt(amount) - 1;
        var total = amount;
        var complete = 0;

        while (amount--) {
            var tc = config;
            tc.prefix = config.repeatPrefix;
            var parser = new wod(tc);
            parser.parse(tokenizer.getStream(), function (repeat) {
                results.emitToUser     += Util.format('\n%s', repeat.emitToUser);
                results.emitAroundUser += Util.format('\n%s', repeat.emitAroundUser);

                if (++complete === total) {
                    callback();
                }
            }.bind(this));
        }
    };

    /**
     * Add tokens do nothing, since addition is handled by reduction in the end.
     */
    this.parseAdd = function (empty, callback) { callback(); };

    /**
     * Subtract tokens multiply the next token by -1.
     */
    this.parseSubtract = function(empty, callback) {
        var token = tokenizer.getNextToken();
        parse.call(this, token, function (results) {
            var operand = stack.pop();
            stack.push(operand * -1);
            callback();
        }.bind(this));
    };

    /**
     * Comment strings do nothing, since they are just emitted as part of the results.
     */
    this.parseComment = function(string, callback) { callback(); };

    /**
     * Number tokens get pushed onto the stack.
     */
    this.parseNumber = function(number, callback) {
        stack.push(+number);
        callback();
    };

    var parseFromRandom = function (results, output, callback) {
        var re = 0;

        results.forEach(function (roll) {
            output.push(roll);

            if (roll >= config.target) {
                hits++;
            }

            if (roll <= config.glitch) {
                glitches++;
            }
        });
        callback();
    };

    var callback                        = function () {};

    /**
     * The configuration object for the parser.
     * @var     {Object}
     */
    var config = {
        glitch: 1,
        target : 5,
        silent : false,
        verbose : false
    };

    /**
     * The messages to be used in the results object.
     * @var     {Object}
     */
    var messages = {
        emit : '%s You roll %s%s: %ch%d%cn hits.%s%s',
        oemit : '%s %s rolls %s%s: %ch%d%cn hits.%s%s'
    };

    /**
     * Number of glitches
     * @var     {Integer}
     */
    var glitches;

    /**
     * Final results.
     * @var     {Object}
     */
    var results;

    /**
     * User input
     * @var     {String}
     */
    var roll;

    /**
     * Initial rolls
     * @var     {Integer[]}
     */
    var rolls;

    /**
     * The current stack.
     * @var     (String[]);
     */
    var stack;

    /**
     * The incoming token stream.
     * @var     {Token[]}
     */
    var stream;

    /**
     * The total successes achieved.
     * @var     {Integer}
     */
    var hits;

    var tokenizer;

    /**
     * The types of tokens which might exist.
     * @var     {Object}    A list of named regular expressions.
     */
    var types = {
        'Repeat'                        : /^\s*(\d+x)/i,
        'Subtract'                      : /^\s*(-)/,
        'Add'                           : /^\s*(\+)/,
        'Number'                        : /^\s*(\d+)/,
        'Comment'                       : /^\s*(\(.+?\))/
    };
});

module.exports = sr;