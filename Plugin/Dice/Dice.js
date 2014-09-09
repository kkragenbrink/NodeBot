/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     14th March 2012
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

var Class                               = use('/Lib/Class');

/**
 * A generic dice-rolling plugin.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.5.0
 * @subpackage  Plugin
 * @plugin      Dice
 * @singleton
 */
var Dice = Class.create(function() {
    var Dispatcher                      = use('/Lib/Dispatcher');
    var FileSystem                      = use('fs');
    var Log                             = use('/Lib/Log');
    var Route                           = use('/Lib/Route');
    var Token                           = use('/Lib/Token');
    var Tokenizer                       = use('/Lib/Tokenizer');
    var Util                            = use('/Lib/Util');

    /**
     * Sets up the Roll path and determines the list of available parsers.
     */
    this.constructor = function() {
        var Roll                        = new Route();
            Roll.path                   = /(dice|roll)([/:A-z0-9-])*/i;
            Roll.contexts = {
                Mud                     : /(.*)/i
            };
            Roll.handler                = roll;
        Dispatcher.addRoute(Roll);

        parsers                         = FileSystem.readdirSync(process.cwd() + '/Plugin/Dice/Parsers');
        for (var i = 0; i < parsers.length; i++) {
            parsers[i]                  = parsers[i].substr(0, parsers[i].lastIndexOf('.'));

            var pRoll = new Route();
                pRoll.command = parsers[i];
                pRoll.path = new RegExp(Util.format('(%s)([/:A-z0-9-])*', parsers[i]), 'i');
                pRoll.contexts = {
                    Mud : /(.*)/i
                };
                pRoll.handler = roll;
            Dispatcher.addRoute(pRoll);
        };

        Log.log('Plugin/Dice', 'Registered parsers:', parsers.join(', '), '; Default:', DEFAULT_PARSER);
    };

    /**
     * Translates a series of switches into key:value pairs.
     *
     * @param   {String[]}  switches
     * @return  {Object}
     */
    function processSwitches(switches) {
        var output                      = {};
        var name;
        var value;

        for (var i = 0; i < switches.length; i++) {
            var cpos                    = switches[i].indexOf(':');

            if (cpos > 0) {
                name                    = switches[i].substring(0, cpos);
                value                   = switches[i].substring(cpos + 1);
            }
            else {
                name                    = switches[i];
                value                   = true;
            }

            output[name]                = value;
        }

        return output;
    };

    /**
     * Determines the correct parser, calls tokenizer, and sends to parser.
     *
     * The roll function keeps track of the overall process of a roll request from
     * start to finish.  It first parses the instruction path into switches and
     * determines which Parser to use based on the incoming switches. Then, it
     * instantiates the parser with the switches as configuration options, creates
     * a new tokenizer based on the parser's lex, and passes the data to the
     * tokenizer.  Once the string has been tokenized, the tokens are passed into
     * the parser for handling.  Finally, the parsers results are returned to the
     * requester and, if appropriate, those near the requester.
     *
     * @param   {Object}    instruction
     */
    function roll(instruction) {
        var start                       = (new Date).getTime();
        var parserType;
        var Parser;
        var context                     = instruction.context;
        var roll                        = instruction.data;
        var path                        = instruction.path;
        var requester                   = instruction.requester;

        // Determine the switches.
        var switches                    = path.split('/');
        var parser = switches.shift();

        // Determine the parser.
        if (Util.inArray(parser, parsers)) {
            parserType = parser;
        }
        else if (switches.length > 0 && Util.inArray(switches[0], parsers)) {
            parserType                  = switches.shift();
        }
        else {
            parserType                  = DEFAULT_PARSER
        }
        Parser                          = use('/Plugin/Dice/Parsers/' + parserType);

        // Process the switches into configuration variables.
        var config                      = processSwitches(switches);
        config.name                     = context.instructions.getNameByIdentity(requester, true);
        config.prefix                   = context.prefix('roll');
        config.repeatPrefix             = context.instructions.whitespace(context.instructions.length(config.prefix, true), true);
        config.roll                     = instruction.data;

        // Initialize parser and tokenizer.
        var parser                      = new Parser(config, context, requester);

        // Parse the roll.
        try {
            parser.parse(roll, respond.bind(this, start, context, requester));
        }
        catch (e) {
            Log.warn('Plugin/Dice', 'Parse error in [%s %s]: %s', path, roll, e.message);
            context.send(context.instructions.emitToUser(requester, 'Parse error.'));
        }
    };
    
    var respond = function (start, context, requester, results) {
        // Send away.
        for (var method in results) {
            if (results.hasOwnProperty(method)) {
                context.send(context.instructions[method](requester, results[method]));
            }
        }

        Log.log('Plugin/Dice', 'Handled request in %d seconds.', ((new Date).getTime() - start)/1000);
    };

    var DEFAULT_PARSER                  = 'dd';
    var parsers;
});
module.exports                          = new Dice;
