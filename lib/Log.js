var Log = function() {
    var self                = this;
    var util                = require( 'util' );

    self.parseArguments = function( arguments ) {
        var args = Array.prototype.slice.call( arguments, 0 );
        if ( typeof args[0] === 'string' ) {
            return {
                message     : args.shift(),
                values      : args
            }
        }
    };

    self.log = function() {
        console.log.apply(console,arguments);
    };

    NB.log = self.log;
};

module.exports              = new Log();
