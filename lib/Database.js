/**
 * Bridges NodeBot and specific Database adapters.
 */
var Database = function() {
    var self                = this;
    var NodeBot             = {};
    var DB                  = {};

    /**
     * Initializes the Database library.
     * @param NB
     */
    self.init = function(NB) {
        NodeBot             = NB;

        if (typeof NodeBot.config.database == 'object' && NodeBot.config.database.adapter) {
            DB              = require('./Adapters/' + NodeBot.config.database.adapter + '.js');
        }
    };

    return self;
};

module.exports              = new Database();