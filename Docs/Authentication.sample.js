/*
METHOD I -- KNOWN AUTHPLUGINS

Advantages:
    Because CommandPlugins are aware of what AuthPlugin can do, they can
    rely on a unified means of authorizing incoming command requests.  For
    example, if AuthPlugin exposes a "staff" lock, then plugins can rely
    on using this AuthPlugin to lock some commands to staff.

Disadvantages:
    This method relies on CommandPlugin knowing about AuthPlugin.
    Also, if AuthPlugin changes how it tests, CommandPlugin must
    also change to match.
*/

var StaffProvider1 = Class.create(function() {
    var Dispatcher                      = use('/Lib/Dispatcher');

    this.constructor = function() {
        Dispatcher.addAuthenticationProvider(authenticate);
    };

    var authenticate = function(packet, callback) {
        if (packet.route.StaffProvider1 === true) {
            callback(isStaff(packet.requester));
        }
        else {
            callback();
        }
    };
});

var CommandPlugin1 = Class.create(function() {
    var Dispatcher                      = use('/Lib/Dispatcher');

    this.constructor = function() {
        var foo = new Route();
        foo.StaffProvider1              = true;     // Must be staff to use this route.
        Dispatcher.addRoute(foo);
    };
});

/*
METHOD II -- ADD AUTHORIZATION BY MESSAGE

Advantages:
    CommandPlugins do not need to be aware of which plugin is performing
    their Authorization; only that they are being authorized.

Disadvantages:
    This method still relies on CommandPlugins being aware of what types 
    of authentication might be available, and how they will be named (or 
    alternatively: it requires AuthPlugins to be aware of which types of 
    authentication CommandPlugins will rely on to ensure those requests 
    will be authenticated properly).
*/

var StaffProvider2 = Class.create(function() {
    var Dispatcher                      = use('/Lib/Dispatcher');
    var Messenger                       = use('/Lib/Messenger');
    var routes;

    this.constructor = function() {
        routes                          = {};
        Dispatcher.addAuthenticationProvider(authenticate);
        Messenger.on('authenticate.staff', addRoute);
    };

    var addRoute = function(route) {
        routes[route.path]              = route;
    };

    var authenticate = function(packet) {
        if (typeof routes[packet.route.path] !== 'undefined') {
            callback(isStaff(packet.requester));
        }
        else {
            callback();
        }
    };
});

var CommandPlugin2 = Class.create(function() {
    var Dispatcher                      = use('/Lib/Dispatcher');
    var Messenger                       = use('/Lib/Messenger');

    this.constructor = function() {
        var foo = new Route();
        Messenger.emit('authenticate.staff', foo); // Must be staff to use this route.
        Dispatcher.addRoute(foo);
    };
});