var Net = function() {
    var self                = this;
    var net                 = require( 'net' );

    self.connect = function() {
        self.net.createConnection( NB.config.mud.port, NB.config.mud.host, function() {
            process.NodeBot.Log.log( 'Connected to %s:%s', NB.config.mud.host, NB.config.mud.port );
        } );
    };
};

module.exports              = new Net();
