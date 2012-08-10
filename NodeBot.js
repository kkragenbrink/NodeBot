/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     19th January 2012
 * @edited      10th August 2012
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
var version                             = '1.0.0';
var use                                 = require('./Lib/Use');

var Arguments;
var Class                               = use('/Lib/Class');
var Config                              = use('/Lib/Config');
var Log                                 = use('/Lib/Log');
var Util                                = use('/Lib/Util');

/**
 * This class instantiates NodeBot as a Singleton.
 *
 * Once NodeBot is established, it will load the requested user Plugins.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     1.0.0
 * @singleton
 */
var NodeBot = Class.create(function() {

    /**
     * Constructs NodeBot and runs its setup procedures.
     */
    this.constructor = function() {
        Log.log('NodeBot', 'NodeBot %s starting up.', version);
        Arguments                       = use('/Lib/Arguments');

        self                            = this;

        this.config                     = {};
        this.contexts                   = {};
        this.plugins                    = {};

        setupProcess();
        setupConfiguration();
    };

    // ***** SETUP ***** //
    /**
     * Sets up the global Configuration object.
     */
    var setupConfiguration = function() {
        var configFile                  = Arguments.getArgument('config');
        var config                      = new Config(configFile);

        config.on('error', handleException);
        config.once('load', handleConfigLoaded);

        config.load();
    };

    /**
     * Registers all contexts noted in the NodeBot configuration object.
     */
    var setupContexts = function() {
        for (var i in self.config.contexts) {
            if (self.config.contexts.hasOwnProperty(i)) {
                Log.log('NodeBot', 'Registering %s context.', i);

                self.contexts[i]        = use(Util.sprintf('/Lib/Context/%s', i));
                self.contexts[i].register(self.config.contexts[i]);
            }
        }
    };

    /**
     * Registers all plugins noted in the NodeBot configuration object.
     */
    var setupPlugins = function() {
        for (var i in self.config.plugins) {
            if (self.config.plugins.hasOwnProperty(i)) {
                Log.log('NodeBot', 'Registering %s plugin.', i);

                self.plugins[i]         = use(Util.sprintf('/Plugin/%s/%s', i, i));

                if (typeof self.plugins[i].configure === 'function') {
                    self.plugins[i].configure(self.config.plugins[i]);
                }
            }
        }
    };

    /**
     * Sets triggers on the global process object.
     */
    var setupProcess = function() {
        process.on('exit', handleShutdown);
        process.on('uncaughtException', handleException);
    };

    // ***** Triggers ***** //
    /**
     * Stores the configuration object in NodeBot.config and calls configuration-based setup.
     * @param   {Object}    config
     */
    var handleConfigLoaded = function(config) {
        self.config                     = config;
        setupContexts();
        setupPlugins();
        process.emit('config.loaded');
    };

    /**
     * Handles uncaught exceptions.
     * @param   {Error}     err         The exception to be handled.
     * @private
     */
    var handleException = function(err) {
        if (Log && typeof Log.error === 'function') {
            Log.trace('NodeBot', err);
        }
    };

    /**
     * Logs the shutdown event before the process completes.
     */
    var handleShutdown = function() {
        Log.log('NodeBot', 'NodeBot shutting down.');
    };

    // ***** Attributes ***** //
    /**
     * The global NodeBot configuration.
     * @type    {Config}
     */
    this.config                         = null;

    /**
     * The global Context registry.
     * @type    {Object}
     */
    this.contexts                       = null;

    /**
     * The global Plugin registry.
     * @type    {Object}
     */
    this.plugins                        = null;

    /**
     * The NodeBot process, internal to itself.
     */
    var self;
});

module.exports                          = new NodeBot;