/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     25th January 2012
 * @edited      9th January 2012
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
 * The MUD connection context.
 *
 * This context handles routes connecting to MUD endpoints.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.2.0
 * @subpackage  Lib/Context
 * @singleton
 * @lends       Mud
 */
var Mud = require('../Context').extend(function() {
    var Config;                         // The context configuration object.
    var Log                             = require('../Log');
    var Net                             = require('net');
    var Socket;                         // The connection to the MUD.

    /**
     * Sets up event handlers, then connects to the MUD.
     */
    function connect() {
        Socket                          = new Net.Socket();

        // Setup Event handlers.
        Socket.on('connect', handleConnect);
        Socket.on('error', handleError);

        // Connect.
        Log.log('Lib/Context/Mud', 'Connecting to %s:%s', Config.client.hostname, Config.client.port);
        Socket.connect(Config.client.hostname, Config.client.port);
    }

    /**
     * Reports that the MUD has connected.
     * @param {Event}   event
     */
    function handleConnect(event) {
        Log.log('Lib/Context/Mud', 'Connected to %s:%s', Config.client.host, Config.client.port);
    }

    /**
     * @param {Event}   event
     */
    function handleError(event) {

    }

    /**
     *
     * @param config
     */

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