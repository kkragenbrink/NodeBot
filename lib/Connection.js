var Connection = function() {
    var self                = this;
    var events              = require( 'events' );
    var net                 = require( 'net' );
    var util                = require( 'util' );
    var emitter             = new events.EventEmitter();
    var NodeBot             = {};
    var socket              = null;

    var state = {
        loggedIn            : false
    };

    /** PUBLIC METHODS **/
    self.init = function( NB ) {

        NodeBot             = NB;
        socket              = new net.Socket();
        socket.addListener( 'data', login );
    };

    self.connect = function() {

        NodeBot.log( 'Connecting to %s:%s', NodeBot.config.mud.host, NodeBot.config.mud.port );

        socket.connect( NodeBot.config.mud.port, NodeBot.config.mud.host, function() {
            NodeBot.log( 'Connected to %s:%s', NodeBot.config.mud.host, NodeBot.config.mud.port );
        } );
    };

    self.pemit = function() {

        var args                    = Array.prototype.slice.call( arguments, 0 );
        var recipients              = args.shift();
        var message                 = util.format.apply( util.format, args );
        var command                 = '@pemit/list %s = \\[NodeBot\\] %s';

        send( command, recipients, message );
    };

    self.get = function( pid, object, attribute ) {

        var command                 = 'think <<<PID%d%r[xget( %s, %s )]';

        send( command, pid, object, attribute );
    };

    self.pmatch = function( pid, name ) {

        var command                 = 'think <<<PID%d%r[pmatch( %s )]';

        send( command, pid, name );
    };

    /** PRIVATE METHODS **/
    var login = function( data ) {
        data                        = data.toString();

        if ( !state.loggedIn && /"connect <name> <password>"/.test( data ) ) {
            NodeBot.log( "Logging in to %s.", NodeBot.config.mud.user );

            state.loggedIn          = true;
            send( "connect %s %s", NodeBot.config.mud.user, NodeBot.config.mud.pass );

            // No need to listen for this event anymore.
            socket.removeListener( 'data', login );
            socket.addListener( 'data', receive );
        }
    };

    var receive = function(data) {
        data                        = data.toString();

        // Data matches a +all command.
        if ( /^<<<CMD(\r\n|\n|\r)#\d+:.*/m.test( data ) ) {
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
            return;
        }

        // Data matches PIDDOC.
        if ( /^<<<PID\d+(\r\n|\r|\n)/m.test( data ) ) {
            data                    = data.replace( /(\r\n|\r)/gm, '\n' );

            var pid                 = data.substring( 6, data.indexOf( '\n' ) );
            var data                = data.substr( data.indexOf( '\n' ) + 1 );

            NodeBot.Controller.triggerProcess( pid, data );
            return;
        }

        NodeBot.log( "Failed to match %s", data );
    };

    var send = function() {

        var args                    = Array.prototype.slice.call( arguments, 0 );
        var message                 = util.format.apply( util.format, args );

        socket.write( message + "\n" );
    };
};

module.exports                      = new Connection();
