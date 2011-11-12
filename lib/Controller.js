var Controller = function() {
    var self                            = this;
    var events                          = require( 'events' );
    var commands                        = {};
    var emitter                         = new events.EventEmitter;
    var NodeBot                         = {};

    self.init = function( NB ) {

        NodeBot                         = NB;
    };

    self.command = function() {

        var args                        = Array.prototype.slice.call( arguments, 0 );
        var command                     = args.shift();

        if ( command in commands ) {

            commands[command].apply( commands[command], args );
        }
        else {

            var requester               = args.shift();
            NodeBot.log( "%s requested bad command: +%s.", requester, command );
            NodeBot.Connection.pemit( requester, "Invalid command. Type '+help' for help." );
        }
    };

    self.registerCommand = function( command, handler ) {

        NodeBot.log( 'Registering +%s command.', command );
        commands[command]               = handler;
    };

    self.triggerProcess = function( pid, data ) {

        NodeBot.ProcessManager.getProcess( pid ).trigger( data );
    }
};

module.exports                          = new Controller();