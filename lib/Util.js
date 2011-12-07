var Util = function() {

    var self                            = this;
    var util                            = require('util');

    for (var i in util) {

        if (util.hasOwnProperty(i)) {
            self[i]                     = util[i];
        }
    }

    self.inArray = function(needle, haystack) {

        var o = {};
        for (var i = 0; i < haystack.length; i++) {
            o[haystack[i]]              = i;
        }

        return (needle in o);
    };

    return self;
};

module.exports                          = new Util();