/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     25th January 2012
 * @edited      13th June 2012
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

// TODO: Message queuing.

/**
 * The MUD connection context.
 *
 * This context handles routes connecting to MUD endpoints.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.6.2
 * @subpackage  Lib/Context
 * @singleton
 * @lends       Mud
 */
var Mud = use('/Lib/Context').extend(function() {
    var Config;                         // The context configuration object.
    var Dispatcher                      = use('/Lib/Dispatcher');
    var Log                             = use('/Lib/Log');
    var Net                             = use('net');
    var Socket;                         // The connection to the MUD.
    var Util                            = use('/Lib/Util');

    var buffer                          = null;
    var bufferTime                      = 0;
    var connected                       = false;
    var self                            = this;

    this.__defineGetter__('config', function() { return Config; });
    this.__defineGetter__('instructions', function() { return use('/Lib/Instructions/' + Config.client.type); });

    /**
     * Sets up event handlers, then connects to the MUD.
     */
    function connect() {
        Socket                          = new Net.Socket;

        // Setup Event handlers.
        Socket.on('close', handleClose);
        Socket.on('connect', handleConnect);
        Socket.on('data', handleData);
        Socket.on('end', handleEnd);
        Socket.on('error', handleError);

        // Connect.
        Log.log('Lib/Context/Mud', 'Connecting to %s', Config.client.name);
        Socket.connect(Config.client.port, Config.client.hostname);
    }

    function dispatch(instruction) {
        instruction.context             = self;
        instruction.contextName         = 'Mud';

        Dispatcher.dispatch(instruction);
    }

    function handleClose(event) {

    }

    /**
     * Reports that the MUD has connected.
     * @param {Event}   event
     */
    function handleConnect(event) {
        Log.log('Lib/Context/Mud', 'Connected to %s', Config.client.name);
    }

    function handleData(event) {
        if (connected) {
            handleRequest(event.toString());
        }
        else {
            login();
        }
    }

    function handleEnd(event) {
        connected                       = false;
        // TODO: Reconnect on timeout here.
    }

    /**
     * @param {Event}   event
     */
    function handleError(event) {
        Log.error('Lib/Context/Mud', event);
    }

    /**
     * Translates incoming data into a valid packet and forwards it to the Dispatcher.\
     * @param {String}      data    Incoming data from the MUD.
     */
    function handleRequest(data) {
        data                            = data.replace(/(\r\n|\r)/mg, '\n');
        var lines                       = data.split('\n');
        var instructions                = [];

        var time                    = (new Date).getTime();
        if ((time - bufferTime) >= 100) {
            buffer                  = null;
        }
        bufferTime                  = time;

        while (lines.length > 0) {
            var json                    = undefined;
            var line                    = lines.shift();

            if (buffer !== null) {
                try {
                    json                = JSON.parse(buffer);
                    buffer              = null;
                } catch(e) {
                    try {
                        json            = JSON.parse(line);
                    } catch(e) {
                        buffer         += line;
                    }
                }
            }
            else {
                try {
                    json                = JSON.parse(line);
                }
                catch (e) {
                    buffer              = line;
                }
            }

            if (typeof json !== 'undefined') {
                instructions.push(json);
            }
        }

        for (var i in instructions) {
            if (instructions.hasOwnProperty(i)) {
                dispatch(instructions[i]);
            }
        }
    }

    /**
     * Logs the Bot into the MUD.
     */
    function login() {
        switch (Config.client.type.toUpperCase()) {
            case 'MUSH': {
                send(Util.format('connect "%s" %s', Config.client.username, Config.client.password));
                connected               = true;

                // Reset
                // TODO: Move these to an instruction set somewhere.
                send("@set me=!SAFE");
                send("@wipe me");
                send("@set me=SAFE");
                send('&TOJSON me=%{[trim(trim([iter(lnum(0,9), ifelse(cand(strlen(v(itext(0))),strmatch(v(itext(0)),*:*)), "[before(v(itext(0)), :)]":"[edit(edit(after(v(itext(0)), :), ", %\\"), %r, %\\n)]"%,, ))]),r,%,)]%}');
                send('&COMMAND me=$^' + Config.input.prefix + '([^\\s]+)\\s?(.*)?:think ifelse(gt(conn(%!),-1),u(TOJSON,type:command,requester:%#,path:%1,data:%2),pemit(%#,NodeBot is offline.))');
                send('@set me/COMMAND=REGEX');
                send('@lock/page me==me');

                break;
            }
        }
    }

    this.isTrue = function(string) {
        var re                          = false;
        switch (true) {
            case /^\d+$/.test(string):
                re                      = (string !== '0');
                break;
            case /^#\d+/.test(string):
                re                      = true;
                break;
        }

        return re;
    };

    this.handleRouteFail = function(instruction) {
        send(this.instructions.emitToUser(instruction.requester, this.prefix(instruction.path) + ' Command not found.'));
    };

    this.prefix = function(data) {
        return Util.format(Config.output.prefix, Config.input.prefix + data);
    };

    this.processInstructionSet = function(pid, instructions) {
        this.request(pid, instructions.join(','));
    };

    /**
     * Registers the context with the dispatcher, then connects to the MUD.
     * @param {Object}  config      The configuration for this context.
     */
    this.register = function(config) {
        // Store the config
        Config                          = config;

        // Register the context
        this.parent.register.apply(this, arguments);

        // Connect!
        connect();
    };

    this.request = function(pid, string) {
        send(Util.format('think u(TOJSON,type:process,pid:%d,%s)', pid, string));
    };

    var send = this.send = function(data) {
        if (!Util.isArray(data)) {
            data                        = [data];
        }
        
        for (var i = 0; i < data.length; i++) {
            if (typeof data[i] === 'string') {
                data[i]                 = data[i].replace(/\n/g, '%r').replace(/\t/g, '%t') + '\n';
            }
            else {
                Log.error('Lib/Context/Mud', 'Attempted to send invalid data:', data[i]);
                data[i]                 = '';
            }
        }

        Socket.write(data.join(''));
    };

    /**
     * Ensures that the context-specific data variables are valid for the context.
     * @param {Object}  dataPoints  The data points to be validated.
     * @return {Boolean}
     */
    this.validateDataPoints = function(dataPoints) {
        return (dataPoints instanceof RegExp);
    };
});

module.exports                          = (new Mud);
// TODO: Tweak NodeBot to store the instance so that multiple MUDs could be connected to at once by a single NodeBot.
// TODO: Reorganize the methods so that they are sorted by classification.
