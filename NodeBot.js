/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     19th January 2012
 * @edited      08th February 2012
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
 * This class instantiates NodeBot as a Singleton.
 *
 * Once NodeBot is established, it will load the requested user Plugins.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.2.0
 * @subpackage  Core
 * @singleton
 */
(function() {
    process.versions.nodebot            = '0.1.2';
    var COMPONENT                       = 'NodeBot';
    var Config                          = require('./Lib/Config');
    var Log                             = require('./Lib/Log');
    var Util                            = require('./Lib/Util');

    Log.log(COMPONENT, 'NodeBot %s starting up.', process.versions.nodebot);

    // Handle various process-specific events.
    process.on('exit', shutdown);
//    process.on('uncaughtException', exception);

    // Handle configuration file loading.
    Config.on('load', registerContexts);
    Config.on('load', registerPlugins);
    Config.load('NodeBot');

    /**
     * Handles uncaught exceptions.
     * @param   err     Error       The exception to handle.
     * @private
     */
    function exception(err) {
        if (Log && typeof Log.error === 'function') {
            Log.trace('NodeBot', err);
        }
    }

    /**
     *
     * @param {String}  context     The name of the context to register.
     * @param {Object}  config      The configuration for the context.
     */
    function registerContext(context, config) {
        Log.log('NodeBot', 'Registering %s context.', context);
        var ctx                         = require(Util.format('./Lib/Context/%s', context));
        ctx.register(config);
    }

    /**
     * Registers all contexts noted in the NodeBot configuration object.
     *
     * @param {Object}  config      The NodeBot configuration object.
     * @private
     */
    function registerContexts(config) {
        var contexts                    = config.contexts;

        for (var i in contexts) {
            if (contexts.hasOwnProperty(i)) {
                registerContext(i, contexts[i]);
            }
        }
    }

    /**
     * Registers a new plugin with NodeBot.
     * @param   name    String      The plugin to register.
     * @private
     */
    function registerPlugin(name) {
        Log.log('NodeBot', 'Registering %s plugin.', name);
        require(Util.format('./Plugin/%s/%s', name, name));
    }

    /**
     * Registers all plugins noted in the NodeBot configuration object.
     *
     * @param {Object}  config      The NodeBot configuration object.
     * @private
     */
    function registerPlugins(config) {
        var plugins                     = config.plugins;

        if (plugins.length > 0) {
            for (var i in plugins) {
                if (plugins.hasOwnProperty(i)) {
                    registerPlugin(plugins[i]);
                }
            }
        }
    }

    /**
     * Logs the shutdown event before the process completes.
     * @private
     */
    function shutdown() {
        Log.log(COMPONENT, 'NodeBot shutting down.');
    }
})();