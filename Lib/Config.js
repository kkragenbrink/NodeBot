/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     19th January 2012
 * @edited      9th July 2012
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
var ConfigError                         = use('/Lib/ConfigError');
var EventEmitter                        = use('/Lib/EventEmitter');
var FileSystem                          = use('fs');
var Log                                 = use('/Lib/Log');
var Util                                = use('/Lib/Util');
var Yaml                                = use('js-yaml');

/**
 * A YAML configuration file.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.3.0
 * @subpackage  Lib
 * @extends     EventEmitter
 */
var Config = EventEmitter.extend(function() {

    /**
     * Creates a new Config object.
     * @param   {String}    filename
     */
    this.constructor = function(filename) {
        file                            = Util.sprintf('Config/%s.yml', filename);

        this.parent.constructor();
    };

    /**
     * Instructs the Config object to load and prepare the Config file.
     */
    this.load = function() {
        Log.log('Lib/Config', 'Loading configuration file %s.', file);

        if (!loaded && file !== null) {
            FileSystem.readFile(file, 'utf-8', loader.bind(this));
        }
        else if (loaded) {
            this.emit('load', this.config);
        }
        else {
            var message                 = Util.sprintf(ConfigError.message, 'Invalid configuration file', null);
            this.emit('error', new ConfigError(message));
        }
    };

    /**
     * Used by the Load instruction to parse the loaded Config file.
     * @param   {Error}     error
     * @param   {Object}    data
     */
    var loader = function(error, data) {
        var message;                    // During an error, the message we intend to send.

        if (error) {
            switch (error.code) {
                case 'ENOENT':
                    message             = Util.sprintf(ConfigError.message, 'File not found', file);
                    break;
                default:
                    message             = Util.sprintf(ConfigError.message, 'Unknown error', file);
                    break;
            }
        }
        else {
            try {
                this.config             = Yaml.load(data);
            }
            catch (error) {
                message                 = Util.sprintf(ConfigError.message, 'Invalid YAML syntax', file);
            }
        }

        if (message && message.length > 0) {
            this.emit('error', new ConfigError(message));
        }
        else {
            this.emit('load', this.config);
        }
    };

    /**
     * The file to be loaded.
     * @type    {String}
     */
    var file;

    /**
     * Whether the file has been loaded.
     * @type    {Boolean}
     */
    var loaded                          = false;
});
module.exports                          = Config;