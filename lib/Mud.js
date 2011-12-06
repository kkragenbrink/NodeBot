/**
 * Translates specific requests from NodeBot to MUD language.
 */
var Mud = function() {
    var self                    = this;
    var NodeBot                 = {};
    var util                    = require( 'util' );
    var loop                    = null;
    var LOOP_SPEED              = 1;
    var QUEUE_MAX               = 100;
    self.setup                  = [];
    self.queue                  = [];

    /**
     * Initializes the MUD trannslator.
     * @param NB
     */
    self.init = function( NB ) {
        NodeBot                 = NB;
    };

    /**
     * @param pid
     * @param target
     */
    self.alias = function( pid, target ) {

        var process                 = makeProcess( pid, 'xget(%s,alias)' );
        queue( process, target );
    };

    /**
     * @param pid
     * @param target
     */
    self.conn = function( pid, target ) {
        var process                 = makeProcess( pid, 'conn(%s)' );
        queue( process, target );
    };

    /**
     * @param pid
     * @param object
     * @param attribute
     */
    self.get = function( pid, object, attribute ) {

        var process                 = makeProcess( pid, 'xget(%s,%s)' );
        queue( process, object, attribute );
    };

    /**
     * @param pid
     * @param target
     */
    self.idle = function( pid, target ) {
        var process                 = makeProcess( pid, 'idle(%s)' );
        queue( process, target );
    };

    /**
     * Tests for a login string and logs NodeBot into the MUD.
     * @param data
     * @return bool
     */
    self.login = function( data ) {

        if ( /"connect <name> <password>"/.test( data ) ) {
            NodeBot.log( 'Mud', "Logging in to %s.", NodeBot.config.mud.user );
            send( "connect %s %s", NodeBot.config.mud.user, NodeBot.config.mud.pass );
            // Flush the Queue immediately.

            // Reset.
            send( "@set me=!SAFE" );
            send( "@wipe me" );
            send( "@set me=SAFE" );
            send( '&TOJSON me=%{[trim(trim([iter(lnum(0,9), ifelse(cand(strlen(v(itext(0))),strmatch(v(itext(0)),*:*)), "[before(v(itext(0)), :)]":"[edit(edit(after(v(itext(0)), :), ", %\\"), %r, %\\n)]"%,, ))]),r,%,)]%}' );
            send( '&COMMAND me=$' + NodeBot.config.command_prefix + '([^\\s/]+)(/\\S*)?\\s?(.*)?:think ifelse(gt(conn(%!),-1),u(TOJSON,type:command,requester:%#,command:%1,switches:%2,args:%3),pemit(%#,NodeBot is offline.))' );
            send( '@set me/COMMAND=REGEX' );

            var instruction;
            while (instruction = self.setup.shift()) {
                send( instruction );
            }

            this.loop               = setInterval(flush,LOOP_SPEED);

            return true;
        }
        return false;
    };

    self.mail = function( pid, target ) {

        var process                 = makeProcess( pid, 'mail(%s)' );
        queue( process, target );
    };

    /**
     * @param pid
     * @param target
     */
    self.name = function( pid, target ) {

        var process                 = makeProcess( pid, 'name(%s)' );
        queue( process, target );
    };

    /**
     * Sends an @pemit to a list of targets.
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

        send( command, recipients, message );
    };

    /**
     * @param pid
     * @param name
     */
    self.pmatch = function( pid, name ) {

        var process                 = makeProcess( pid, 'pmatch(%s)' );
        queue( process, name );
    };

    /**
     * Flushes the queue.
     * This is called periodically by a setInterval created after login.
     */
    function flush() {
        if (self.queue.length > 0) {
            NodeBot.debug('Mud', 'Flushing queue.');
            var message         = '@wait 0=';

            var i               = 0;
            while (i++ < QUEUE_MAX && (command = self.queue.shift())) {
                message        += command + ';';
            }

            send(message);
        }
    }

    /**
     * Wraps a process function into a JSON-translating callback.
     * @param pid
     * @param data
     */
    function makeProcess( pid, data ) {
        if (pid instanceof NodeBot.Process) {
            pid                     = pid.pid;
        }
        return util.format( 'think u(TOJSON,type:process,pid:%d,data:[%s])', pid, data );
    }

    /**
     * Queues a message for later sending.
     * @param message
     * @param args
     */
    function queue() {
        NodeBot.audit('Mud', 'Queuing new command.');
        var args                = Array.prototype.slice.call( arguments, 0 );
        var message             = util.format.apply( util, args );

        self.queue.push(message);
    }
    /**
     * Formats data then calls Connection.send()
     * @param message
     * @param args
     */
    function send() {
        NodeBot.audit('Mud', 'Sending command(s).');
        var args                = Array.prototype.slice.call( arguments, 0 );
        var message             = util.format.apply( util, args );

        NodeBot.Connection.send( message );
    }
};

module.exports                  = new Mud();