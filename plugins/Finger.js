/**
 * COMMAND: finger <target>
 *
 * Provides status and user-defined information about <target>.
 *
 * Config options:
 *   [finger]
 *       allow_afinger          : true
 *       debug                  : false
 */
var Finger = function() {
    var version                             = '0.5.0';
    var self                                = this;

    var NodeBot                             = {};
    var callbacks                           = {};
    callbacks.finger                        = {};
    var util                                = require('util');

    self.init = function( NB ) {

        NodeBot                             = NB;
        NodeBot.Controller.registerCommand('finger', self.finger);
        NodeBot.Mud.setup.push( '@switch hasattr(%!,ACONNECT)=1,{@edit me/ACONNECT=^,&LAST_CONNECT %%#=%[secs%(%)%];},{@ACONNECT me=&LAST_CONNECT %%#=%[secs%(%)%];}' );
        NodeBot.Mud.setup.push( '@switch hasattr(%!,ADISCONNECT)=1,{@edit me/ADISCONNECTA=^,&LAST_DISCONNECT %%#=%[secs%(%)%];},{@ADISCONNECT me=&LAST_DISCONNECT %%#=%[secs%(%)%];}' );
    };

    self.finger = function(requester, switches, args) {

        NodeBot.debug('Finger', "Handling request for %s.", requester);
        var data = {
            requester                       : requester,
            target                          : args == 'me' ? requester : args,
            values                          : {},
            message                         : [],
            _start                          : (new Date()).getTime(),
            _end                            : 0
        };

        var proc                            = NodeBot.ProcessManager.createProcess(data, callbacks.finger.complete);
        var matchTarget                     = proc.spawn({}, callbacks.finger.matchTarget);

        NodeBot.Mud.pmatch(matchTarget.pid, data.target);
    };

    /**
     * Called when +finger is completed.
     */
    callbacks.finger.complete = function() {
        var line,
            message                         = this.data.message.join('\r');

        for (var i in this.data.values) {
            NodeBot.audit('Finger', 'Replacing %s', i);
            message                         = message.replace('\{' + i + '\}', this.data.values[i].toString().replace(',','%,'));
        }

        var output                          = message.split('\r');
        while (line = output.shift()) {
            NodeBot.Mud.pemit(this.data.requester,line);
        }
        this.data._end                      = (new Date()).getTime();

        if (NodeBot.config.finger.debug === true) {
            NodeBot.Mud.pemit(this.data.requester,'Completed in ' + (this.data._end - this.data._start) + ' milliseconds.');
        }
    };

    /**
     * Validates that the pmatch response is a valid target.
     * @param target
     */
    callbacks.finger.matchTarget = function(target) {
        var proc                        = this.parent;

        // Valid target?
        if ( /^#\d+$/.test( target ) ) {
            proc.data.target                = target;
            proc.data.message.push(util.format(NodeBot.config.output.header, '{name}'));
            proc.data.message.push('[ljust(ansi(hw, Alias:) {alias}, 39 )][ljust( ansi(hw, {connected}:) {connectTime}, 39 )]');
            proc.data.message.push('[ljust(ansi(hw, Sex:) {sex}, 39 )][ljust( ansi(hw, {idle}:) {idleTime}, 39 )]');
            proc.data.message.push('[ljust(ansi(hw, Email:) {email}, 39 )][ljust( ansi(hw, Mail:) {mailUnread} unread/{mailTotal} total, 39 )]');
            proc.data.message.push(NodeBot.config.output.mid);
            proc.data.message.push(NodeBot.config.output.tail);

            NodeBot.Mud.name(proc.spawn({key:'name'}, callbacks.finger.variable), proc.data.target);
            NodeBot.Mud.alias(proc.spawn({key:'alias'}, callbacks.finger.variable), proc.data.target);
            NodeBot.Mud.get(proc.spawn({key:'sex'},callbacks.finger.variable), proc.data.target, 'sex');
            NodeBot.Mud.conn(proc.spawn({},callbacks.finger.connected), proc.data.target);
            NodeBot.Mud.idle(proc.spawn({},callbacks.finger.idle), proc.data.target);
            NodeBot.Mud.get(proc.spawn({},callbacks.finger.email), proc.data.target, 'email');
            NodeBot.Mud.mail(proc.spawn({},callbacks.finger.mail), proc.data.target);
        }
        // Not a player
        else {
            NodeBot.debug( 'Finger', 'matchTarget returned an invalid target.' );
            proc.data.message.push(util.format(NodeBot.config.output.prefix + " %s is not a valid character.", 'finger', proc.data.target));
        }
    };

    /**
     * Assigns a data variable for replacement.
     * @param value
     */
    callbacks.finger.variable = function(value) {
        NodeBot.audit('Finger', '  Key:', this.data.key);
        NodeBot.audit('Finger', '  Value:', value);
        var proc                            = this.parent;
        proc.data.values[this.data.key]     = value;
    };

    /**
     * Assigns the user's connected time.
     * @param value
     */
    callbacks.finger.connected = function(value) {
        var proc                            = this.parent;

        if (value > -1) {
            proc.data.values.connected      = 'On For';
            proc.data.values.connectTime    = value + 's';
        }
        else {
            proc.data.values.connected      = 'Last On';
            NodeBot.Mud.get(proc.spawn({key:'connectTime'},callbacks.finger.date), proc.data.target, 'LAST_CONNECT');
        }
    };

    /**
     * Assigns the user's idle time.
     * @param value
     */
    callbacks.finger.idle = function(value) {
        var proc                            = this.parent;

        if (value > -1) {
            proc.data.values.idle           = 'Idle';
            proc.data.values.idleTime       = value + 's';
        }
        else {
            proc.data.values.idle           = 'Last Off';
            NodeBot.Mud.get(proc.spawn({key:'idleTime'},callbacks.finger.date), proc.data.target, 'LAST_DISCONNECT');
        }
    };

    /**
     * Parses a date value.
     * @param value
     */
    callbacks.finger.date = function(value) {
        var proc                            = this.parent;

        var dt                              = new Date(value * 1000);
        var month                           = dt.getMonth().toString();
        var date                            = dt.getDate().toString();
        var year                            = dt.getFullYear().toString();

        switch (month) {
            case '0'    : month             = 'Jan'; break;
            case '1'    : month             = 'Feb'; break;
            case '2'    : month             = 'Mar'; break;
            case '3'    : month             = 'Apr'; break;
            case '4'    : month             = 'May'; break;
            case '5'    : month             = 'Jun'; break;
            case '6'    : month             = 'Jul'; break;
            case '7'    : month             = 'Aug'; break;
            case '8'    : month             = 'Sep'; break;
            case '9'    : month             = 'Oct'; break;
            case '10'   : month             = 'Nov'; break;
            case '11'   : month             = 'Dec'; break;
        }

        proc.data.values[this.data.key]     = month + ' ' + date + ', ' + year;
    };

    callbacks.finger.email = function(value) {
        var proc                            = this.parent;

        proc.data.values.email              = value.substr(0,1) == '>' ? 'Hidden' : value;
    };

    callbacks.finger.mail = function(value) {
        var proc                            = this.parent;

        var mail                            = value.split(' ');
        proc.data.values.mailUnread         = mail[1];
        proc.data.values.mailTotal          = parseInt(mail[0]) + parseInt(mail[1]) + parseInt(mail[2]);
    }
};

module.exports                              = new Finger();