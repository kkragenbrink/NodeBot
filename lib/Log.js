var Log = function() {
    var self                = this;
    var NB                  = process.NodeBot;
    var util                = require( 'util' );

    self.log = function() {
        console.log.apply(console,arguments);
    };

    NB.log = self.log;
};

module.exports              = new Log();
