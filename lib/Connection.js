/**
 * Handles all interactions with the MUD.
 */
var Connection = function() {

    var self                = this;
    var events              = require( 'events' );
    var net                 = require( 'net' );
    var util                = require( 'util' );
    var NodeBot             = {};
    var socket              = null;

    /**
     * Initializes the Connection library.
     * Creates a socket and adds listeners to most socket events.
     * @param NB
     */
    self.init = function( NB ) {

        NodeBot             = NB;
        socket              = new net.Socket();

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

        var args                    = Array.prototype.slice.call( arguments, 0 );
        var message                 = util.format.apply( util.format, args );

        socket.write( message.replace( /\n/gm, '%r' ) + "\n" );
    };

    /**
     * Translates a command event and forwards it to the controller.
     * @param data
     * @private
     */
    function command( data ) {

        data                    = data.replace( /(\r\n|\n|\r)/gm, '' );

        var requester           = data.substring( 6, data.indexOf( ':' ) );
        data                    = data.substring( data.indexOf( ':' ) + 1 );
        var command             = data;

        if ( command.indexOf( ' ' ) > 0 ) {
            command             = data.substr( 0, data.indexOf( ' ' ) );
        }

        if ( command.indexOf( '/' ) > 0 ) {
            command             = data.substr( 0, data.indexOf( '/' ) );
        }

        data                    = data.substr( command.length );

        var switches            = data.substring( data.indexOf( '/' ) + 1, data.indexOf( ' ' ) ).split( '/' );
        var args                = data.substring( data.indexOf( ' ' ) + 1 );

        NodeBot.Controller.command( command.toLowerCase(), requester, switches, args );
    }
    /**
     * Translates a process event and forwards it to the controller.
     * @param data
     * @private
     */
    function process( data ) {


        data                    = data.replace( /(\r\n|\r)/gm, '\n' );
        var pid                 = data.substring( 6, data.indexOf( '\n' ) );

        data                    = data.substr( data.indexOf( '\n' ) + 1 );
        NodeBot.Controller.process( pid, data );
    }

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

//        var packet                  = null;
//        var lines                   = data.split( /\n/ );

        // @todo This needs to parse the incoming data to break it down into proper packets, each of which gets passed to command or process.
        /*while ( lines.length > 0 ) {
            var line                = lines.shift();
        }*/

        // First login check.
        if ( /^Last connect was from.*/.test( data ) ) {
            return;
        }

        // Data matches a +all command.
        if ( /^<<<CMD(\r\n|\n|\r)#\d+:.*/m.test( data ) ) {
            return command( data );
        }

        // Data matches PIDDOC.
        if ( /^<<<PID\d+(\r\n|\r|\n)/m.test( data ) ) {
            return process( data );
        }

        NodeBot.debug( 'Connection', "Failed to match %s", data );
    };

    /**
     * @event timeout
     */
    listeners.timeout = function() {
        NodeBot.warn( 'Connection', 'NodeBot socket timed out.' );
    };
};

module.exports                      = new Connection();
