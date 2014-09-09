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

var Parser                              = use('/Lib/Parser');

/**
 * A standard Dice parser.
 *
 * @todo Document
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.3.0
 * @subpackage  Plugin
 * @plugin      Dice
 * @lends       fate
 */
var fate = Parser.extend(function() {
    var Log                             = use('/Lib/Log');
    var Token                           = use('/Lib/Token');
    var Tokenizer                       = use('/Lib/Tokenizer');
    var Util                            = use('/Lib/Util');

    /**
     * Sets up the tokenizer and prepare the results.
     * @param   {Object}    configuration
     * @param   {Object}    ctx
     */
    this.constructor = function(configuration, ctx) {
        config                          = Util.extend(config, configuration);
        context                         = ctx;

        results = {
            emitToUser                  : Util.format(messages.emit, config.prefix),
            emitAroundUser              : Util.format(messages.oemit, config.prefix, config.name)
        };

        discarded                       = [];
        rolls                           = [];
        stack                           = [];
        stream                          = [];
        tokenizer                       = new Tokenizer(types);
    };

    /**
     * Returns the configuration variables for output.
     * @return  {String}
     */
    function formatConfig() {
        var message                     = '';
        if (config.verbose) {
            var configs                 = [];

            if (configs.length > 0) {
                message                += ' (';
                message                += configs.join(', ');
                message                += ')';
            }
        }

        return message;
    }

    /**
     * Returns the rolls and discarded rolls for output.
     * @return  {String}
     */
    function formatVerbose() {
        var message                     = [];
        
        message.push(sum);

        if (target > 0) {
            switch(comparison) {
                case '>':
                    message.push(sum > target ? 'Success' : 'Failure');
                    break;
                case '<':
                    message.push(sum < target ? 'Success' : 'Failure');
                    break;
                case '>=':
                    message.push(sum >= target ? 'Success' : 'Failure');
                    break;
                case '<=':
                    message.push(sum <= target ? 'Success' : 'Failure');
                    break;
                case '=':
                    message.push(sum == target ? 'Success' : 'Failure');
                    break;
            }
        }

        if (config.verbose) {
            message.push(Util.format('Rolls: %s', rolls.join(', ')));
        }

        if (message.length > 0) {
            message                 = Util.format('(%s)', message.join(', '));
        }

        return message;
    }

    /**
     * Parses an individual token.
     * @param token
     */
    function parse(token) {
        var method              = Util.format('parse%s', token.type);
        try {
            this[method].call(this, token.value);
        }
        catch (e) {
            Log.warn('Plugin/Dice/Parsers/fate', method, e.message);
        }
    }

    /**
     * Parses the incoming stream and returns the results.
     *
     * @param   {String}    roll        The string to parse.
     * @return  {Object}
     */
    this.parse = function(r, cb) {
        var method;
        var token;
        roll                            = r;
        callback                        = cb;
        
        tokenizer.prepare(roll);
        token                           = tokenizer.getNextToken();

        while (token instanceof Token && token.type !== 'EOF') {
            parse.call(this, token);
            token                       = tokenizer.getNextToken();
        }
        total                           = reduce();

        // Finalize the results.
        for(method in results) {
            if (results.hasOwnProperty(method)) {
                results[method]         = Util.format(results[method], roll, formatConfig(), context.instructions.hilight(total, true), formatVerbose());
            }
        }

        // Handle the silent flag.
        if (config.silent) {
            delete results.oemit;
        }

        // And return.
        callback(results);
    };

    /**
     * Add tokens do nothing, since addition is handled by reduction in the end.
     */
    this.parseAdd = function() {};

    /**
     * Comment strings do nothing, since they are just emitted as part of the results.
     */
    this.parseComment = function(string) {};

    /**
     * @todo Document
     *
     * @param string
     */
    this.parseLadder = function(string) {
        string                          = string.toLowerCase();

        if (typeof ladder[string] === 'number') {
            stack.push(ladder[string]);
        }
        else {
            throw new TypeError('Invalid ladder string.');
        }
    };

    /**
     * Number tokens get pushed onto the stack.
     */
    this.parseNumber = function(number) {
        stack.push(parseInt(number));
    };

    /**
     * Runs the parser an additional number of times and appends the results in place.
     * @param   {Integer}   amount
     */
    this.parseRepeat = function(amount) {
        amount                          = parseInt(amount) - 1;

        var configuration               = Util.extend({}, config);
            configuration.prefix        = configuration.repeatPrefix;

        for (var i = 0; i < amount; i++) {
            var tc                      = configuration;
            tc.prefix                   = configuration.repeatPrefix;
            var parser                  = new fate(tc);
            var stream                  = tokenizer.getStream();
            var repeat                  = parser.parse(stream);
            results.emitToUser         += Util.format('\n%s', repeat.emitToUser);
            results.emitAroundUser     += Util.format('\n%s', repeat.emitAroundUser);
        }
    };

    /**
     * Subtract tokens multiply the next token by -1.
     */
    this.parseSubtract = function() {
        var token                       = tokenizer.getNextToken();
        parse.call(this, token);
        var operand                     = stack.pop();
        stack.push(operand * -1);
    };

    this.parseTarget = function(operator) {
        stack.push(operator);
    };

    /**
     * Reduces the remaining symbols by addition.
     * @return  {Number}
     */
    function reduce() {
        var reduced;

        for (var i = 0; i < 4; i++) {
            var rand                    = Math.floor(Math.random() * die.length);
            rolls.push(Util.format('%[%s%]', die[rand]));

            if (die[rand] === '+') {
                stack.unshift(1);
            }
            else if (die[rand] === '-') {
                stack.unshift(-1);
            }
        }

        sum                                 = stack.pop();
        var n;

        while (n = stack.pop()) {

            if (false && types.Target.test(n)) {
                target                      = sum;
                sum                         = stack.pop();
                comparison                  = n;
            }
            else {
                sum                        += n;
            }
        }

        for (var height in ladder) {
            if (ladder.hasOwnProperty(height)) {
                if (sum > ladder[height]) {
                    reduced             = Util.format('%s + %d', Util.capitalize(height), sum - ladder[height]);
                    break;
                }
                else if (sum == ladder[height]) {
                    reduced             = Util.capitalize(height);
                    break;
                }
            }
        }

        if (reduced === null) {
            reduced                     = Util.format('%s - %d', Util.capitalize(height), Math.abs(ladder[height] + sum));
        }

        return reduced;
    }

    var comparison                      = '>';
    /**
     * The configuration object for the parser.
     * @var     {Object}
     */
    var config = {
        lowest                          : -1,
        highest                         : -1,
        silent                          : false,
        verbose                         : false
    };

    var context;

    /**
     * @todo Document
     */
    var die                             = ['-', '-', ' ', ' ', '+', '+'];

    /**
     * Discarded rolls.
     * @var     {Integer[]}
     */
    var discarded;

    /**
     * @todo Document
     * @todo Allow override in config?
     */
    var ladder = {
        legendary                       : 8,
        epic                            : 7,
        fantastic                       : 6,
        superb                          : 5,
        great                           : 4,
        good                            : 3,
        fair                            : 2,
        average                         : 1,
        mediocre                        : 0,
        poor                            : -1,
        terrible                        : -2
    };

    /**
     * The messages to be used in the results object.
     * @var     {Object}
     */
    var messages = {
        emit                            : '%s You roll %s%s: %s %s',
        oemit                           : '%s %s rolls %s%s: %s %s'
    };

    /**
     * Final results.
     * @var     {Object}
     */
    var results;

    /**
     * Kept rolls.
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

    var target                          = 0;

    var tokenizer;

    var total;
    var sum;

    /**
     * The types of tokens which might exist.
     * @var     {Object}    A list of named regular expressions.
     *
     * @todo Build ladder regex dynamically from ladder variable.;
     */
    var types = {
        'Ladder'                        : /^\s*(Legendary|Epic|Fantastic|Superb|Great|Good|Fair|Average|Mediocre|Poor|Terrible)/i,
        'Repeat'                        : /^\s*(\d+x)/i,
        'Subtract'                      : /^\s*(-)/,
        'Add'                           : /^\s*(\+)/,
        'Number'                        : /^\s*(\d+)/,
        'Comment'                       : /^\s*(\(.+?\))//*,
        'Target'                        : /^\s*(>=|<=|<|>|=)/*/
    };
});
module.exports                          = fate;
