/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     23rd March 2012
 * @edited      23rd March 2012
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
var http                                = use('http');

/**
 * A standard Dice parser.
 *
 * The standard dice parser does not perform any impressive dice modifications
 * or explosions.  It accepts input in the form of a possible repeater ('x'),
 * addition, subtraction, dice, sides, and modifiers.  For example, if you wish
 * to roll 3 8-sided dice, you would roll 3d8.  If you wish to roll 3 8-sided
 * dice and 2 6-sided dice, you would roll 3d8+2d6.  You can also add (or
 * subtract) straight modifiers (e.g. 2d6+4).  If a repeater is used, the
 * dice will be rolled multiple times, and emitted once for each roll.
 *
 * The dd parser is also known as the D&D parser, since it is the most likely
 * parser to be used in a D&D game.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.3.0
 * @subpackage  Plugin
 * @plugin      Dice
 * @lends       dd
 */
var dd = Parser.extend(function() {
    var Log                             = use('/Lib/Log');
    var Token                           = use('/Lib/Token');
    var Tokenizer                       = use('/Lib/Tokenizer');
    var Util                            = use('/Lib/Util');

    /**
     * Sets up the tokenizer and prepare the results.
     * @param   {Object}    configuration
     */
    this.constructor = function(configuration) {
        config                          = Util.extend(config, configuration);

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
            var configs             = [];

            if (config.lowest > 0) {
                configs.push(Util.format('Lowest: %d', config.lowest));
            }

            if (config.highest > 0) {
                configs.push(Util.format('Highest: %d', config.highest));
            }

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
        if (target > 0) {
            switch(comparison) {
                case '>':
                    message.push(total > target ? 'Success' : 'Failure');
                    break;
                case '<':
                    message.push(total < target ? 'Success' : 'Failure');
                    break;
                case '>=':
                    message.push(total >= target ? 'Success' : 'Failure');
                    break;
                case '<=':
                    message.push(total <= target ? 'Success' : 'Failure');
                    break;
                case '=':
                    message.push(total == target ? 'Success' : 'Failure');
                    break;
            }
        }

        if (config.verbose) {
            message.push(Util.format('Rolls: %s', rolls.join(', ')));

            if (discarded.length > 0) {
                message.push(Util.format('Discarded: %s', discarded.join(', ')));
            }
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
    var parse = function (token, callback) {
        var method              = Util.format('parse%s', token.type);
        try {
            this[method].call(this, token.value, callback);
        }
        catch (e) {
            Log.warn('dd parser', method, e.message);
        }
    }
    
    this.parseNextToken = function () {
        var token                       = tokenizer.getNextToken();
        if (token instanceof Token && token.type !== 'EOF') {
            parse.call(this, token, this.parseNextToken.bind(this));
        }
        else {
            total                       = reduce();

            // Finalize the results.
            for(var method in results) {
                if (results.hasOwnProperty(method)) {
                    results[method]     = Util.format(results[method], roll, formatConfig(), total, formatVerbose());
                }
            }
    
            // Handle the silent flag.
            if (config.silent) {
                delete results.emitAroundUser;
            }
            else if(config.dm) {
                // TODO: Verify that this person is the DM.
                results.emitAroundUser  = Util.format('%s %s rolls some dice behind the DM screen.', config.prefix, config.name);
            }
    
            // And return.
            callback(results);
        }
    };

    /**
     * Parses the incoming stream and returns the results.
     *
     * @param   {String}    roll        The string to parse.
     * @return  {Object}
     */
    this.parse = function(r, cb) {
        roll                            = r;
        callback                        = cb;
        tokenizer.prepare(roll);
        this.parseNextToken();
    };

    /**
     * Add tokens do nothing, since addition is handled by reduction in the end.
     */
    this.parseAdd = function(empty, callback) { callback(); };

    /**
     * Comment strings do nothing, since they are just emitted as part of the results.
     */
    this.parseComment = function(string, callback) { callback(); };

    /**
     * Number tokens get pushed onto the stack.
     */
    this.parseNumber = function(number, callback) {
        stack.push(parseInt(number));
        callback();
    };

    /**
     * Runs the parser an additional number of times and appends the results in place.
     */
    this.parseRepeat = function(amount, callback) {
        amount                          = parseInt(amount) - 1;
        var total                       = amount;
        var complete                    = 0;

        while (amount--) {
            var tc                      = config;
            tc.prefix                   = config.repeatPrefix;
            var parser                  = new dd(tc);
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
     * Parses a roll token into a number token.
     */
    this.parseRoll = function(roll, callback) {
        var results                     = [];
        var index                       = roll.indexOf('d');
        var dice                        = roll.substring(0, index);
        var sides                       = roll.substring(index + 1);
        
        getFromRandom(dice, sides, results, callback);
    };
    
    var getFromRandom = function (dice, sides, results, callback) {
        var url                         = Util.format('http://www.random.org/integers/?num=%s&min=1&max=%s&col=1&base=10&format=plain&rnd=new', dice, sides);
        http.get(url, rollFromRandom.bind(this, dice, results, callback));
    };
    
    var allFromRandom = function (dice, callback, results) {
        if (results.length == dice) {
            if (config.lowest > 0) {
                results.sort();
                var lowest                      = [];
                for (i = 0; i < results.length; i++) {
                    if (i < parseInt(config.lowest)) {
                        lowest.push(results[i]);
                    }
                    else {
                        discarded.push(results[i]);
                    }
                }
                
                results                         = lowest;
            }
    
            if (config.highest > 0) {
                var highest                     = [];
                results.sort();
                results.reverse();
                for (i = 0; i < results.length; i++) {
                    if (i < parseInt(config.highest)) {
                        highest.push(lowest[i]);
                    }
                    else  {
                        discarded.push(lowest[i]);
                    }
                }
                results                     = highest;
                results.reverse();
            }
    
            var total                       = 0;
            results.forEach(function(amount) {
                rolls.push(amount);
                total                      += amount;
            });
            stack.push(total);
            callback();
        };
    };
    
    var rollFromRandom = function (dice, results, callback, response) {
        response.setEncoding('utf8');
        
        response.on('data', function (chunk) {
            var f                       = chunk.split('\n');
            for (var i in f) {
                if (f[i].length > 0) {
                    results.push(parseInt(f[i]));
                }
            }
        });
        response.on('end', function (data) {
            allFromRandom(dice, callback, results);
        }.bind(this));
    };


    /**
     * Subtract tokens multiply the next token by -1.
     */
    this.parseSubtract = function(empty, callback) {
        var token                       = tokenizer.getNextToken();
        parse.call(this, token, function (results) {
            var operand                     = stack.pop();
            stack.push(operand * -1); 
            callback();
        }.bind(this));
    };

    /**
     * @todo Document
     * @param operator
     */
    this.parseTarget = function(operator, callback) {
        stack.push(operator);

        callback();
    };

    /**
     * Reduces the remaining symbols by addition.
     * @return  {Number}
     */
    function reduce() {
        var sum                         = stack.pop();
        var n;

        while (n = stack.pop()) {

            if (types.Target.test(n)) {
                target                      = sum;
                sum                         = stack.pop();
                comparison                  = n;
            }
            else {
                sum                        += n;
            }
        }

        return sum;
    }

    var callback                        = function () {};

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

    /**
     * Discarded rolls.
     * @var     {integer[]}
     */
    var discarded;

    /**
     * The messages to be used in the results object.
     * @var     {Object}
     */
    var messages = {
        emit                            : '%s You roll %s%s: %d %s',
        oemit                           : '%s %s rolls %s%s: %d %s'
    };

    /**
     * Final results.
     * @var     {Object}
     */
    var results;

    var roll;

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

    /**
     * The types of tokens which might exist.
     * @var     {Object}    A list of named regular expressions.
     */
    var types = {
        'Repeat'                        : /^\s*(\d+x)/i,
        'Roll'                          : /^\s*(\d+d\d+)/i,
        'Subtract'                      : /^\s*(-)/i,
        'Add'                           : /^\s*(\+)/,
        'Number'                        : /^\s*(\d+)/i,
        'Comment'                       : /^\s*(\(.+?\))/,
        'Target'                        : /^\s*(>=|<=|<|>|=)/
    };
});
module.exports                          = dd;
