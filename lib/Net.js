var Net = function() {
    var self                = this;
    var net                 = require( 'net' );
    var NB                  = process.NodeBot;

    self.connect = function() {
        net.createConnection( NB.config.mud.port, NB.config.mud.host, function() {
            NB.log( 'Connected to %s:%s', NB.config.mud.host, NB.config.mud.port );
        } );
    };
};

module.exports              = new Net();
