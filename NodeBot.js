var config = {
    mud : {
        host                : 'writh.net',  // The hostname of your MUSH; best if localhost
        port                : 2067,         // The port of your MUSH
        user                : 'NodeBot',    // The username of your bot.
        pass                : '!'           // The password of your bot.
    }
};


var NodeBot = function( config ) {
    var self                = this;
    self.config             = config;
    self.modules            = {};

    self.init = function() {

        self.Connection.connect();
    };

    /**
     * Instantiates a Library.
     * @param Library
     */
    self.loadLibrary = function( Library ) {

        self[Library]                   = require( './lib/' + Library );
        self[Library].init( self );
    };

    self.log = function( message, values ) {

        var args                        = [];

        if (typeof message !== 'object') {
            args.push( '[%d] ' + message + '\n' );
            args.push( (new Date).getTime() );
        } else {
            args.push( '[%d] %j\n' );
            args.push( (new Date).getTime() );
            args.push( message );
        }

        if ( typeof values !== 'undefined' ) {
            args                    = args.concat( values );
        }

        console.log.apply( console, args );
    };

    /**
     * Instantiates a Module.
     * @param Module
     */
    self.loadModule = function( Module ) {

        var modName = Module.toLowerCase();
        self.modules[modName]           = require( './modules/' + Module + '.js' );

        if ( typeof self.modules[modName].init === 'function' ) {
            self.modules[modName].init( self );
        }
    };

    /**
     * @include Libraries
     */
    self.loadLibrary( 'Log' );
    self.loadLibrary( 'Controller' );
    self.loadLibrary( 'Connection' );

    /**
     * @include Modules
     */
    self.loadModule( 'Finger' );

};

module.exports              = new NodeBot( config );
