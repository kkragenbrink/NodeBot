/**
 * Processes requests from Connection and Plugins.
 */
var Controller = function() {
    var self                            = this;
    var events                          = require( 'events' );
    var commands                        = {};
    var NodeBot                         = {};

    self.messages = {
        commandFailure                  : "Invalid command."
    };

    /**
     * Initializes the Controller.
     * @param NB
     */
    self.init = function( NB ) {

        NodeBot                         = NB;
    };

    /**
     * Passes Commands from Connection to the appropriate plugin.
     * If the Command has not been registered, sends a generic failure message.
     */
    self.command = function() {

        var args                        = Array.prototype.slice.call( arguments, 0 );
        var command                     = args.shift();
        var requester                   = args.shift();

        if ( command in commands ) {

            NodeBot.log( 'Controller', "%s called command: +%s.", requester, command );
            args.unshift( requester );
            commands[command].apply( commands[command], args );
        }
        else {

            NodeBot.warn( 'Controller', "%s requested bad command: +%s.", requester, command );
            NodeBot.Connection.pemit( requester, self.messages.commandFailure );
        }
    };

    /**
     * Triggers a process callback from Connection.
     * @param pid
     * @param data
     */
    self.process = function( pid, data ) {

        NodeBot.log( 'Controller', "Process %d triggered.", pid );
        var proc                        = NodeBot.ProcessManager.getProcess( pid );
        if( proc instanceof NodeBot.Process ) {
            proc.trigger( data );
        }
        else {
            NodeBot.warn( 'Controller', "Could not find process %d.", pid );
        }
    };

    /**
     * Registers a new Command with the Controller.
     * @param command
     * @param handler
     */
    self.registerCommand = function( command, handler ) {

        NodeBot.log( 'Controller', 'Registering +%s command.', command );
        commands[command]               = handler;
    };
};

module.exports                          = new Controller();