/**
 * NodeBot
 *
 * @author  Kevin "Loki" Kragenbrink <kevin@writh.net>
 * @updated 7th December 2011
 * @version 0.8.0
 */

/**
 * NodeBot Bootstrap Script
 *
 * Bootstraps the NodeBot and initializes its plugins for run.
 */
var NodeBot = function() {
    var version             = '0.7.0';

    var self                = this;
    var libraries = {
        Util                : false,
        Controller          : false,
        Connection          : false,
        Database            : false,
        Log                 : false,
        Mud                 : false,
        Process             : false,
        ProcessManager      : false
    };
    var plugins             = {};
    self.config             = {};
    self.prelog             = [];

    /**
     * Creates a log store until the Log class is initialized.
     * @param type
     */
    function Prelog(type) {
        return function() {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(type);
            self.prelog.push(args);
        }
    }
    self.debug              = new Prelog('debug');
    self.error              = new Prelog('error');
    self.log                = new Prelog('log');
    self.warn               = new Prelog('warn');

    /**
     * Initializes NodeBot and instantiates all libraries and plugins.
     * @private
     */
    function init() {

        self.log('NodeBot', "NodeBot %s starting up.", version);

        loadConfig(function() {
            loadLibraries();
            loadPlugins();
            self.Connection.connect();
        });
    }

    /**
     * Loads the configuration file.
     * @private
     */
    function loadConfig(callback) {
        var fs                          = require('fs');
        var yaml                        = require('js-yaml');

        fs.readFile('./config/config.yml', 'utf8', function(err, data) {

            if (err) {
                throw new Error("Could not load configuration.");
            }

            try {
                self.config             = yaml.load(data);
            }
            catch (e) {
                throw new Error("Could not parse configuration. " + e.message);
            }

            callback();
        });
    }

    /**
     * Iterates through the libraries and initializes them.
     * @private
     */
    function loadLibraries() {
        for (var i in libraries) {
            loadLibrary(i);
        }
        
    }

    /**
     * Iterates through the requested plugins and initializes them.
     * @private
     */
    function loadPlugins() {
        for (var i in self.config.plugins) {
            loadPlugin(self.config.plugins[i]);
        }
    }

    /**
     * Registers a Library.
     * @param Library
     * @private
     */
    function loadLibrary(Library) {

        if (!libraries[Library]) {
            self[Library]                   = require('./lib/' + Library);

            if (typeof self[Library].init === 'function') {
                self[Library].init(self);
            }

            libraries[Library]              = true;
        }
    }

    /**
     * Registers a Plugin.
     * @param Plugin
     * @private
     */
    function loadPlugin(Plugin) {

        var pluginName                  = Plugin.toLowerCase();
        try {
            plugins[pluginName]             = require('./plugins/' + Plugin + '.js');
            plugins[pluginName].init(self);
        }
        catch (e) {
            throw new Error("Failed to load plugin '" + pluginName + "': " + e.message);
        }
    }

    // Go!
    init();
    return self;
};

module.exports              = new NodeBot();