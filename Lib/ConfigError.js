var Util = use('/Lib/Util');

var ConfigError              = function() {};
    Util.inherits(ConfigError, Error);
    ConfigError.code         = null;
    ConfigError.file         = null;
    ConfigError.message      = "%s while attempting to load %s.";
module.exports = ConfigError;