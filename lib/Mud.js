/**
 * Translates specific requests from NodeBot to MUD language.
 */
var Mud = function() {
    var self                    = this;
    var NodeBot                 = {};
    var util                    = require( 'util' );

    /**
     * Initializes the MUD trannslator.
     * @param NB
     */
    self.init = function( NB ) {
        NodeBot                 = NB;
    };

    /**
     * Constructs a alias() call for the MUD and assigns it to a pid, then calls send().
     * @param pid
     * @param target
     */
    self.alias = function( pid, target ) {

        var command                 = 'think <<<PID%d\n[alias( %s )]';

        NodeBot.Connection.send( command, pid, target );
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
     * @param data
     * @return bool
     */
    self.login = function( data ) {

        if ( /"connect <name> <password>"/.test( data ) ) {
            NodeBot.log( 'Mud', "Logging in to %s.", NodeBot.config.mud.user );
            NodeBot.Connection.send( "connect %s %s", NodeBot.config.mud.user, NodeBot.config.mud.pass );

            // Reset.
            NodeBot.Connection.send( "@set me=!SAFE" );
            NodeBot.Connection.send( "@wipe me" );
            NodeBot.Connection.send( "@set me=SAFE" );
            NodeBot.Connection.send( '&TOJSON me=%{[trim(trim([iter(lnum(0,9), ifelse(cand(strlen(v(itext(0))),strmatch(v(itext(0)),*:*)), "[before(v(itext(0)), :)]":"[edit(edit(after(v(itext(0)), :), ", %\\"), %r, %\\n)]"%,, ))]),r,%,)]%}' );
            NodeBot.Connection.send( '&COMMAND me=$\\+\\+([^\\s/]+)(/\\S*)?\\s?(.*)?:think u(TOJSON,type:command,requester:%#,command:%1,switches:%2,data:%3)' );
            NodeBot.Connection.send( '@set me/COMMAND=REGEX' );

            return true;
        }
        return false;
    };

    /**
     * Constructs a name() call for the MUD and assigns it to a pid, then calls send().
     * @param pid
     * @param target
     */
    self.name = function( pid, target ) {

        var command                 = 'think <<<PID%d\n[name( %s )]';

        NodeBot.Connection.send( command, pid, target );
    };

    /**
     * Sends an @pemit to a list of targets, then calls send().
     * @param recipients
     * @param prefix
     * @param message
     * @param args
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