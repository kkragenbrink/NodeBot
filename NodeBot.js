var config = {
    mud : {
        host                : 'localhost',  // The hostname of your MUSH; best if localhost
        port                : 2167,         // The port of your MUSH
        user                : 'NodeBot',    // The username of your bot.
        pass                : '!'           // The password of your bot.
    }
};

var NodeBot = function( config ) {
    var self                = this;
    var NB                  = self;
    self.modules            = {};
    self.config             = config;

    self.init = function() {

        self.setupLibraries();
        self.setupModules();

        self.log( 'Initialized with %d modules.', [self.modules.length] );
        self.log( self.modules );
        self.Net.connect();
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
    };

    /**
     * Runs through the list of core libraries and installs them.
     **/
    self.setupLibraries = function() {
        self.Net                            = require( './lib/Net.js' );
        self.Util                           = require( 'util' );
    }

    /**
     * Runs through the list of modules and installs them.
     **/
    self.setupModules = function() {
        self.loadModule( 'Finger' );
    }

    process.NodeBot         = self;
    self.init();
    return self;
}
new NodeBot( config );
