var Finger = function() {
    var self                                = this;
    var NodeBot                             = {};
    var util                                = require( 'util' );

    self.init = function( NB ) {

        NodeBot                             = NB;
        NodeBot.Controller.registerCommand( 'finger', self.finger );
    };

    self.finger = function( requester, switches, args ) {

        NodeBot.log( 'Finger', "Handling request for %s.", requester );

        var data = {
            requester                       : requester,
            target                          : args,
            values                          : {}
        };

        var proc                            = NodeBot.ProcessManager.createProcess( data, complete );
        var pmatch                          = proc.spawn( {}, matchName );

        NodeBot.Connection.pmatch( pmatch.pid, data.target );
    };

    var complete = function() {
        for ( var i in this.data.values ) {
            this.data.message               = this.data.message.replace( '%' + i + '%', this.data.values[i] );
        }
        NodeBot.Connection.pemit( this.data.requester, this.data.message );
    };

    var matchName = function( target ) {
        target                              = target.replace( '\n', '' );

        // Valid target?
        if ( /^#\d+$/.test( target ) ) {

            NodeBot.log( 'Finger', "matchName returned a valid target." );

            this.parent.data.matchedTarget  = target;

            this.parent.data.message        = util.format( NodeBot.config.output.header, 'Finger for %name%' );
            this.parent.data.message       += NodeBot.config.output.tail;

            var name                        = this.parent.spawn( { key : 'name' }, getVar );
            NodeBot.Connection.name( name.pid, this.parent.data.matchedTarget );
        }
        // Not a player
        else {
            NodeBot.log( 'Finger', "matchName returned an invalid target." );
            NodeBot.Connection.pemit( this.parent.data.requester, NodeBot.config.output.prefix + " %s is not a valid character.", '+finger', this.parent.data.target );
        }
    };

    var getVar = function( val ) {
        val                                 = val.replace( '\n', '' );

        this.parent.data.values[this.data.key] = val;
    }
};

module.exports                              = new Finger();