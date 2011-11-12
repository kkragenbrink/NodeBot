var Finger = function() {
    var self                                = this;
    var NodeBot                             = {};

    self.init = function( NB ) {

        NodeBot                             = NB;
        NodeBot.Controller.registerCommand( 'finger', self.finger );
    };

    self.finger = function( requester, switches, args ) {

        var data = {
            requester                       : requester,
            target                          : args
        };

        var proc                            = NodeBot.ProcessManager.createProcess( data, complete );
        var pmatch                          = proc.spawn( {}, matchName );

        NodeBot.Connection.pmatch( pmatch.pid, data.target );
    };

    var complete = function( pid ) {

        NodeBot.Connection.pemit( this.data.requester, "You +finger %s", this.data.matchedTarget );
    };

    var matchName = function( target ) {
        target                              = target.replace( '\n', '' );
        
        // Valid target?
        if ( /^#\d+$/.test( target ) ) {

            this.parent.data.matchedTarget  = target;
            this.parent.trigger()
        }

        // Not a player
        else {
            NodeBot.Connection.pemit( this.parent.data.requester, "%s is not a valid character.", this.parent.data.target );
        }
    };
};

module.exports                              = new Finger();