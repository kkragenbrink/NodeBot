var config = {
    mud : {
        host                : 'writh.net',  // The hostname of your MUSH; best if localhost
        port                : 2016,         // The port of your MUSH
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
    
    self.init();
    return self;
};

module.exports              = new NodeBot( config );