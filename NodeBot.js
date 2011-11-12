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
    libraries               = [];
    modules                 = {};

    self.init = function() {

        for ( var i in libraries ) {
            var library = self[libraries[i]];

            if ( typeof library.init === 'function' ) {
                library.init( self );
            }
        }

        for ( var i in modules ) {
            if ( typeof modules[i].init === 'function' ) {
                modules[i].init( self );
            }
        }

        self.Connection.connect();
    };

    /**
     * Instantiates a Library.
     * @param Library
     */
    self.loadLibrary = function( Library ) {

        libraries.push( Library );
        self[Library]                   = require( './lib/' + Library );
    };

    /**
     * Instantiates a Module.
     * @param Module
     */
    self.loadModule = function( Module ) {

        var modName                     = Module.toLowerCase();
        modules[modName]                = require( './modules/' + Module + '.js' );
    };

    /**
     * @include Libraries
     */
    self.loadLibrary( 'Controller' );
    self.loadLibrary( 'Connection' );
    self.loadLibrary( 'Log' );
    self.loadLibrary( 'Process' );
    self.loadLibrary( 'ProcessManager' );

    /**
     * @include Modules
     */
    self.loadModule( 'Finger' );
    
    self.init();
    return self;
};

module.exports              = new NodeBot( config );