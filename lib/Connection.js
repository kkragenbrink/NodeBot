/**
 * Handles all interactions with the MUD.
 */
var Connection = function() {

    var self                    = this;
    var events                  = require( 'events' );
    var net                     = require( 'net' );
    var util                    = require( 'util' );
    var NodeBot                 = {};
    var socket                  = null;
    var buffer                  = null;
    var bufferTime              = 0;

    /**
     * Initializes the Connection library.
     * Creates a socket and adds listeners to most socket events.
     * @param NB
     */
    self.init = function( NB ) {

        NodeBot                 = NB;
        socket                  = new net.Socket();

        socket.addListener( 'close', listeners.close );
        socket.addListener( 'connect', listeners.connect );
        socket.addListener( 'data', listeners.login );
        socket.addListener( 'drain', listeners.drain );
        socket.addListener( 'end', listeners.end );
        socket.addListener( 'error', listeners.error );
        socket.addListener( 'timeout', listeners.timeout );
    };

    /**
     * Connects the socket to the MUD.
     */
    self.connect = function() {

        NodeBot.log( 'Connection', 'Connecting to %s:%s', NodeBot.config.mud.host, NodeBot.config.mud.port );
        socket.connect( NodeBot.config.mud.port, NodeBot.config.mud.host );
    };

    /**
     * Sends a message to the MUD.
     * @param message
     * @param args
     */
    self.send = function() {

        var args                = Array.prototype.slice.call( arguments, 0 );
        var message             = util.format.apply( util.format, args );

        socket.write( message.replace( /\n/gm, '%r' ) + "\n" );
    };

    /**
     * Event Listeners
     */
    var listeners               = {};

    /**
     * @event close
     */
    listeners.close = function() {};

    /**
     * @event connect
     */
    listeners.connect = function() {

        NodeBot.log( 'Connection', 'Connected to %s:%s', NodeBot.config.mud.host, NodeBot.config.mud.port )
    };

    /**
     * @event drain
     */
    listeners.drain = function() {};

    /**
     * @event end
     */
    listeners.end = function() {};

    /**
     * @event error
     */
    listeners.error = function() {};

    /**
     * Called when first data is received, and replaces itself with listeners.receive
     * @event data
     * @param data
     */
    listeners.login = function( data ) {

        data                        = data.toString();

        if ( NodeBot.Mud.login( data ) ) {

            socket.removeListener( 'data', listeners.login );
            socket.addListener( 'data', listeners.receive );
        }
    };

    /**
     * Called when data is received and translates events to processes.
     * @event data
     * @param data
     */
    listeners.receive = function( data ) {

        data                        = data.toString();
        data                        = data.replace( /(\r\n|\r)/mg, '\n' );
        var lines                   = data.split( '\n' );
        var instructions            = new Array();

        var time                    = (new Date).getTime();
        if ((time - bufferTime) >= 100 ) {
            buffer                  = null
        }
        bufferTime                  = time;

        // Loop through the data and parse it into JSON objects, as much as possible.
        while ( lines.length > 0 ) {
            var json                = undefined;
            var line                = lines.shift();

            if ( buffer !== null ) {
                try {
                    json            = JSON.parse( buffer );
                    buffer          = null;
                }
                catch ( e ) {

                    try {
                        json        = JSON.parse( line );
                    }
                    catch ( e ) {
                        buffer     += line;
                    }
                }
            }
            else {
                try {
                    json            = JSON.parse( line );
                }
                catch ( e ) {
                    buffer          = line;
                }
            }

            if (typeof json === 'object') {
                instructions.push( json );
            }
        }

        NodeBot.debug( 'Connection', 'Recived %d instructions.', instructions.length );

        // Hand off to the controller.
        for ( var i in instructions ) {
            NodeBot.Controller.process( instructions[i] );
        }
    };

    /**
     * @event timeout
     */
    listeners.timeout = function() {

        NodeBot.warn( 'Connection', 'NodeBot socket timed out.' );

        // TODO:2011-11-24:Kevin Kragenbrink:Add support for automatically reconnecting to the MUSH.
        // Should probably include a config setting on page one; how often to retry, how many times to retry, etc.
    };
};

module.exports                      = new Connection();
