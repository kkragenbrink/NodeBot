/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     19th January 2012
 * @edited      21st January 2012
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
 *
 * @changelog 0.2.0
 *   - Used util.inherits() to properly extend EventEmitter, replacing the hack which was there before.
 */

/**
 * The NodeBot configuration object.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.2.0
 * @subpackage  Lib
 * @extends     EventEmitter
 * @singleton
 */
module.exports = (function() {
    var Cache                           = require('../lib/Cache');
    var CacheSubject                    = 'Config.%s';
    var Config                          = function() {}; // the Configuration object.
    var Events                          = require('events');
    var fs                              = require('fs');
    var jsyaml                          = require('js-yaml');
    var Log                             = require('../lib/Log');
    var Util                            = require('../lib/Util');

    Util.inherits(Config, Events.EventEmitter);

    /**
     * ConfigurationError type.
     */
    var ConfigurationError              = function() {};
        Util.inherits(ConfigurationError, Error);
        ConfigurationError.code         = null;
        ConfigurationError.file         = null;
        ConfigurationError.message      = "%s while attempting to load %s.";

    /**
     * Uses FileSystem to load the requested configuration file.
     *
     * @param   file        String      The name of the configuration file to load.
     * @param   force       Bool        If true, bypass the cache and reload from disk.
     * @emits   load([Object yaml]
     */
    Config.prototype.load = function(file, force) {
        var cache                       = Util.format(CacheSubject, file);
        var self                        = this;
        force                           = (force === true);

        if (Cache.has(cache)) {
            // No need to reload it. We've already got it.
            this.emit('load', Cache.get(cache))
        }
        else {
            Log.log('lib/Config', 'Loading %s configuration.', file);
            fs.readFile(Util.format('config/%s.yml', file), 'utf-8', function(error, data) {
                self.loaded(error, data, file);
            });
        }
    };

    /**
     * Parses the data from a configuration file into a yaml object.
     *
     * @param   error       Error       An error from the FileSystem module.
     * @param   data        String      The contents of the configuration file.
     * @param   file        String      The file we're attempting to load.
     * @emits   load([Object yaml])
     * @emits   error([Error error])
     */
    Config.prototype.loaded = function(error, data, file) {
        var yaml;                       // The parsed configuration object.
        var matches;                    // During an error, a regexp match towards the file name.
        var message;                    // During an error, the message we intend to send.

        // Handle various error states.
        if (error) {
            switch (error.code) {
                case 'ENOENT':
                    message             = Util.format(ConfigurationError.message, 'File not found', file);
                    break;
                default:
                    message             = Util.format(ConfigurationError.message, 'Unknown error', file);
                    break;
            }
        }
        // No error; try parsing the YAML.
        else {
            try {
                yaml                    = jsyaml.load(data);
                Cache.set(Util.format(CacheSubject, file), yaml);
            }
            catch (error) {
                message                 = Util.format(ConfigurationError.message, 'Invalid YAML syntax', file);
            }
        }

        if (message && message.length > 0) {
            this.emit('error', new ConfigurationError(message));
        }
        else {
            this.emit('load', yaml);
        }
    };

    return new Config();
})();