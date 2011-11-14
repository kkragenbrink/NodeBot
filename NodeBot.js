/**
 * NodeBot
 *
 * @author  Kevin "Loki" Kragenbrink <kevin@writh.net>
 * @updated 12 November 2011
 * @version 0.4.0
 */

// Update this configuration section with your information.
var config = {
    // The list of plugins you want to use.
    plugins                 : ['Finger'],

    // Output decorators.
    output : {
        header              : '[center( < %s >, 78, = )]\n',
        prefix              : '<%s>',
        tail                : '[repeat( =, 78 )]'
    },

    // Connection information.
    mud : {
        host                : 'writh.net',  // The hostname of your MUSH; best if localhost
        port                : 2016,         // The port of your MUSH
        user                : 'NodeBot',    // The username of your bot.
        pass                : '!'           // The password of your bot.
    },

    // The level of details you want to see in your logs. (debug, log, warn, or error)
    logLevel                : 'debug'
};
// *** STOP ***
// Do not edit below this line.
// *** STOP ***

/**
 * NodeBot Bootstrap Script
 *
 * Bootstraps the NodeBot and initializes its plugins for run.
 * @param config
 */
var NodeBot = function( config ) {
    var self                = this;
    var libraries = {
        Controller          : false,
        Connection          : false,
        Log                 : false,
        Mud                 : false,
        Process             : false,
        ProcessManager      : false
    };
    var plugins             = {};
    var version             = '0.4.0';
    self.config             = config;
    self.prelog             = [];

    /**
     * Creates a log store until the Log class is initialized.
     * @param type
     */
    function Prelog( type ) {
        return function() {
            var args = Array.prototype.slice.call( arguments, 0 );
            args.unshift( type );
            self.prelog.push( args );
        }
    }
    self.debug = new Prelog( 'debug' );
    self.error = new Prelog( 'error' );
    self.log = new Prelog( 'log' );
    self.warn = new Prelog( 'warn' );

    /**
     * Initializes NodeBot and instantiates all libraries and plugins.
     * @private
     */
    function init() {

        self.log( 'NodeBot', "NodeBot %s starting up.", version );
        loadLibraries();
        loadPlugins();
        self.Connection.connect();
    }

    /**
     * Iterates through the libraries and initializes them.
     * @private
     */
    function loadLibraries() {
        for ( var i in libraries ) {
            loadLibrary( i );
        }
        
    }

    /**
     * Iterates through the requested plugins and initializes them.
     * @private
     */
    function loadPlugins() {
        for ( var i in self.config.plugins ) {
            loadPlugin( self.config.plugins[i] );
        }
    }

    /**
     * Registers a Library.
     * @param Library
     * @private
     */
    function loadLibrary( Library ) {

        if ( !libraries[Library] ) {
            self[Library]                   = require( './lib/' + Library );

            if ( typeof self[Library].init === 'function' ) {
                self[Library].init( self );
            }

            libraries[Library]              = true;
        }
    }

    /**
     * Registers a Plugin.
     * @param Plugin
     * @private
     */
    function loadPlugin( Plugin ) {

        var pluginName                  = Plugin.toLowerCase();
        plugins[pluginName]             = require( './plugins/' + Plugin + '.js' );
        plugins[pluginName].init( self );
    }

    // Go!
    init();
    return self;
};

module.exports              = new NodeBot( config );