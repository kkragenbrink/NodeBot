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

        self.Net.connect();
    }

    /**
     * Instantiates a Module.
     * @param Module
     */
    self.loadModule = function( Module ) {

        var modName = Module.toLowerCase();
        self.modules[modName]           = require( './modules/' + Module + '.js' );
    }

    /**
     * @include Libraries
     */
    self.Log                            = require( './lib/Log.js' );
    self.Net                            = require( './lib/Net.js' );

    /**
     * @include Modules
     */
    self.loadModule( 'Finger' );
    
    self.init();
    return self;
};

process.NodeBot             = new NodeBot( config );
