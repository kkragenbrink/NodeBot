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
     * Processes incoming data from the MUD and hands it to an appropriate processor.
     * @param instruction
     */
    self.process = function( instruction ) {

        if ( typeof processors[instruction.type] === 'function' ) {
            processors[instruction.type]( instruction );
        }
        else {
            NodeBot.warn( 'Controller', "Received invalid instruction type '%s'", instruction.type );
        }
    };

    var processors              = {};

    /**
     * Triggers a command callback from Connection.
     * @param instruction
     */
    processors.command = function( instruction ) {
        var command             = instruction.command.toLowerCase();
        var switches            = instruction.switches.split( '/' ).shift();
        var args                = instruction.args;
        var requester           = instruction.requester;

        if ( command in commands ) {

            NodeBot.log( 'Controller', "%s called command: %s.", requester, command );
            NodeBot.audit( 'Controller', '  requester: %s', requester );
            NodeBot.audit( 'Controller', '  switches: %s', switches );
            NodeBot.audit( 'Controller', '  args: %s', args );
            commands[command]( requester, switches, args  );
        }
        else {

            NodeBot.warn( 'Controller', "%s requested bad command: %s.", requester, command );
            NodeBot.Mud.pemit( requester, self.messages.commandFailure );
        }
    };

    /**
     * Triggers a process callback from Connection.
     * @param instruction
     */
    processors.process = function( instruction ) {
        var pid                 = instruction.pid;
        var data                = instruction.data;

        NodeBot.debug( 'Controller', "Process %d triggered.", pid );

        var proc                        = NodeBot.ProcessManager.getProcess( pid );
        if ( proc instanceof NodeBot.Process ) {
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

        NodeBot.log( 'Controller', 'Registering %s command.', command );
        commands[command]               = handler;
    };
};

module.exports                          = new Controller();