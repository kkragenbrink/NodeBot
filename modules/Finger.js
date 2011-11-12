var Finger = function() {
    var self                = this;
    var NodeBot             = {};

    self.init = function( NB ) {

        NodeBot             = NB;
        NodeBot.Controller.registerCommand( 'finger', self.finger );
    };

    self.finger = function( requester, switches, args ) {

        NodeBot.log( 'Finger.js: Received (requester: %s, switches: %s, args: %s).', requester, switches, args );
    }
};

module.exports              = new Finger();