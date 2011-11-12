var Log = function() {

    var self                = this;
    var util                = require( 'util' );
    var NodeBot             = {};

    self.init = function( NB ) {

        NodeBot             = NB;
        NodeBot.log         = self.log;
    };

    self.log = function() {

        var args            = Array.prototype.slice.call( arguments, 0 );
        var date            = (new Date).getTime();
        var message         = util.format.apply( util, args );
        message             = util.format( '[%d] %s', date, message );
        console.log( message );
    };
};

module.exports              = new Log();