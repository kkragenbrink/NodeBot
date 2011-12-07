/**
 * Handles logging events.
 * Wraps around console.log, console.warn, and console.error to create a
 * more feature-rich logging set.
 */
var Log = function() {

    var self                = this;
    var LOG_LEVEL           = 0;
    var LOG_LEVELS = {
        audit               : 64,
        trace               : 32,
        debug               : 16,
        log                 : 8,
        warn                : 4,
        error               : 2
    };
    var NodeBot             = {};

    /**
     * Initializes the Log library.
     * Overrides NodeBot.log, NodeBot.warn, and NodeBot.error.
     * @param NB
     */
    self.init = function(NB) {

        NodeBot             = NB;

        LOG_LEVEL           = LOG_LEVELS[NodeBot.config.log_level];

        NodeBot.audit       = new Log('audit');
        NodeBot.trace       = new Log('trace');
        NodeBot.debug       = new Log('debug');
        NodeBot.error       = new Log('error');
        NodeBot.log         = new Log('log');
        NodeBot.warn        = new Log('warn');

        // Send the prelog to the right place.
        var args;
        while (args = NodeBot.prelog.shift()) {
            var log     = args.shift();
            NodeBot[log].apply(NodeBot[log], args);
        }
    };

    /**
     * Creates a logging function.
     * @param type
     */
    function Log(type) {
        var name            = type;
        if (!(name in console)) {
            type            = 'log';
        }

        return function() {

            if (LOG_LEVELS[name] <= LOG_LEVEL) {

                var args            = Array.prototype.slice.call( arguments, 0 );
                var date            = (new Date).getTime();
                var file            = args.shift();
                var message         = NodeBot.Util.format.apply(NodeBot.Util, args);
                message             = NodeBot.Util.format('%s [%s:%s] %s', date, file, name, message);

                if (LOG_LEVEL >= LOG_LEVELS['debug'] && (type === 'warn' || type === 'error')) {
                    console.trace();
                }

                console[type].apply(console, [message]);
            }
        }
    }
};

module.exports              = new Log();