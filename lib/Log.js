/**
 * Handles logging events.
 * Wraps around console.log, console.warn, and console.error to create a
 * more feature-rich logging set.
 */
var Log = function() {

    var self                = this;
    var util                = require( 'util' );
    var LOG_LEVELS = {
        debug               : 1000,
        log                 : 100,
        warn                : 10,
        error               : 1
    };
    var NodeBot             = {};

    /**
     * Initializes the Log library.
     * Overrides NodeBot.log, NodeBot.warn, and NodeBot.error.
     * @param NodeBot NB
     */
    self.init = function( NB ) {

        NodeBot             = NB;

        NodeBot.debug       = new Log( 'debug' );
        NodeBot.error       = new Log( 'error' );
        NodeBot.log         = new Log( 'log' );
        NodeBot.warn        = new Log( 'warn' );

        // Send the prelog to the right place.
        while ( args = NodeBot.prelog.shift() ) {
            var log     = args.shift();
            NodeBot[log].apply( NodeBot[log], args );
        }
    };

    function Log( type ) {
        var name            = type;
        if ( !( name in console ) ) {
            type            = 'log';
        }

        return function() {

            if ( LOG_LEVELS[name] <= LOG_LEVELS[NodeBot.config.logLevel] ) {

                var args            = Array.prototype.slice.call( arguments, 0 );
                var date            = (new Date).getTime();
                var file            = args.shift();
                var message         = util.format.apply( util, args );
                message             = util.format( '[%d:%s] %s', date, file, message );

                console[type].apply( console, [message] );
            }
        }
    }
};

module.exports              = new Log();