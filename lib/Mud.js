/**
 * Translates specific requests from NodeBot to MUD language.
 */
var Mud = function() {
    var self                    = this;
    var NodeBot                 = {};

    /**
     * Initializes the MUD trannslator.
     * @param NB
     */
    self.init = function( NB ) {
        NodeBot                 = NB;
    };


    /**
     * Constructs a get() call for the MUD and assigns it to a pid, then calls send().
     * @param pid
     * @param object
     * @param attribute
     */
    self.get = function( pid, object, attribute ) {

        var command                 = 'think <<<PID%d[xget( %s, %s )]';

        NodeBot.Connection.send( command, pid, object, attribute );
    };

    /**
     * Tests for a login string and logs NodeBot into the MUD.
     * @param string data
     * @return bool
     */
    self.login = function( data ) {

        if ( /"connect <name> <password>"/.test( data ) ) {
            NodeBot.log( 'Mud', "Logging in to %s.", NodeBot.config.mud.user );
            NodeBot.Connection.send( "connect %s %s", NodeBot.config.mud.user, NodeBot.config.mud.pass );

            return true;
        }
        return false;
    };

    /**
     * Constructs a name() call for the MUD and assigns it to a pid, then calls send().
     * @param pid
     * @param name
     */
    self.name = function( pid, name ) {

        var command                 = 'think <<<PID%d\n[name( %s )]';

        NodeBot.Connection.send( command, pid, name );
    };

    /**
     * Sends an @pemit to a list of targets, then calls send().
     * @param <dbref list> recipients
     * @param string prefix
     * @param string message
     * @param <collection> args
     */
    self.pemit = function() {

        var args                    = Array.prototype.slice.call( arguments, 0 );
        var recipients              = args.shift();
        var message                 = util.format.apply( util, args );
        var command                 = '@pemit/list %s = %s';

        NodeBot.Connection.send( command, recipients, message );
    };

    /**
     * Constructs a pmatch() call for the MUD and assigns it to a pid, then calls send().
     * @param pid
     * @param name
     */
    self.pmatch = function( pid, name ) {

        var command                 = 'think <<<PID%d\n[pmatch( %s )]';

        NodeBot.Connection.send( command, pid, name );
    };
};

module.exports                  = new Mud();