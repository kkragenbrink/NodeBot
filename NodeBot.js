/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     19th January 2012
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
require('./Lib/Use');

/**
 * This class instantiates NodeBot as a Singleton.
 *
 * Once NodeBot is established, it will load the requested user Plugins.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.5.0
 * @subpackage  Core
 * @singleton
 */

(function() {
    process.versions.nodebot            = '0.4.0';
    process.database                    = false;

    var Log                             = use('/Lib/Log');
    Log.log('NodeBot', 'NodeBot %s starting up.', process.versions.nodebot);
    var Arguments                       = use('/Lib/Arguments');
    var Config                          = use('/Lib/Config');
    var Util                            = use('/Lib/Util');

    // Handle various process-specific events.
    process.on('exit', shutdown);
    process.on('uncaughtException', exception);

    // Handle configuration file loading.
    Config.on('load', registerContexts);
    Config.on('load', registerPlugins);
    Config.on('error', exception);
    Config.load(getConfigurationName());

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

    function getConfigurationName() {
        if (Arguments.hasArgument('config')) {
            return Arguments.getArgument('config');
        }
        else {
            Log.warn('NodeBot', 'No configuration file specified. Please use --config=<filename>');
            return 'NodeBot';
        }
    }

    /**
     *
     * @param {String}  context     The name of the context to register.
     * @param {Object}  config      The configuration for the context.
     */
    function registerContext(context, config) {
        Log.log('NodeBot', 'Registering %s context.', context);
        var ctx                         = use(Util.format('/Lib/Context/%s', context));
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
    function registerPlugin(name, config) {
        Log.log('NodeBot', 'Registering %s plugin.', name);
        var plugin                      = use(Util.format('/Plugin/%s/%s', name, name));

        if (typeof plugin.configure === 'function') {
            Log.log('NodeBot', 'Configuring %s plugin.', name);
            plugin.configure(config);
        }
    }

    /**
     * Registers all plugins noted in the NodeBot configuration object.
     *
     * @param {Object}  config      The NodeBot configuration object.
     * @private
     */
    function registerPlugins(config) {
        Log.log('NodeBot', 'Registering plugins.');
        var plugins                     = config.plugins;

        for (var i in plugins) {
            if (plugins.hasOwnProperty(i)) {
                registerPlugin(i, plugins[i]);
            }
        }

        if (process.database) {
            use('/Lib/Database' ).sync();
        }
    }

    /**
     * Logs the shutdown event before the process completes.
     * @private
     */
    function shutdown() {
        Log.log('NodeBot', 'NodeBot shutting down.');
    }
})();