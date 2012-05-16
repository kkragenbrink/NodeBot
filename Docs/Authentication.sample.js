var AuthPlugin = function() {
    this.constructor = function() {
        Dispatcher.addAuthenticationProvider(this.authenticate);
    };

    this.authenticate = function(authentication, callback) {
        if (Route.AuthPlugin && Route.AuthPlugin.test() === true) {
            return true;
        }
        return false;
    };
};

var CommandPlugin = function() {
    this.constructor = function() {
        var foo = new Route();
        foo.AuthPlugin = /test/;
    };
};