/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     24th January 2012
 * @edited      9th March 2012
 * @package     NodeBot
 *
 * Copyright (C) 2012 Kevin Kragenbrink <kevin@writh.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/**
 * A dispatcher to manage routes.
 *
 * The Dispatcher allows modules to register routes for various contexts,
 * along with access groups for those contexts.  Once registered, Users may
 * access those routes through the available contexts, which will in turn be
 * matched against their individual dispatch cache.
 *
 * For example, a Werewolf Admin might be given access to the "Werewolf" and
 * "Staff" access groups.  Meanwhile, a command might be added to the Mud
 * context to match locus/adddefender <player>, which is only available to
 * users who have both the Werewolf and Staff access groups.
 *
 * When the Werewolf Admin attempts to run a command, the Dispatcher
 * builds a list of potentially available commands by comparing their
 * access groups to the list of access groups with commands, and finds the
 * Werewolf AND Staff access group, which gets added to the Admin's dispatch
 * options.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.2.0
 * @subpackage  Lib
 * @singleton
 * @lends       Dispatcher
 * @requires    Route
 */
module.exports = (function() {
    var Context                         = use('/Lib/Context');
    var FileSystem                      = use('fs');
    var Log                             = use('/Lib/Log');
    var Path                            = use('path');
    var Route                           = use('/Lib/Route');
    var Util                            = use('/Lib/Util');
    var Synchronizer                    = use('/Lib/Synchronizer');

    var authentication                  = new Synchronizer();
    var contexts                        = [];
    var routes                          = [];

    this.addAuthenticationProvider = function() {};

    this.addContext = function(context) {
        if (context instanceof Context) {
            contexts.push(context);
        }
        else {
            throw new TypeError('Attempt to register invalid context.');
        }
    };

    /**
     * Registers a route with an appropriate handler method.
     *
     * @param   {Route}     args[0]     The Route to be registered
     * @throws TypeError
     * @example
     *  var Dispatcher = use('/Lib/Dispatcher');
     *  Dispatcher.register( /job\/create/, {
     *      mud : / (\w+)\/(\w+)=(\w+)/,
     *      web : {
     *          bucket : /(\w+)/,
     *          title : /(\w+)/,
     *          body : /(\w+)/
     *      }
     *   }, self.create );
     */
    this.addRoute = function() {
        var args                        = Array.prototype.slice.call(arguments, 0);

        if (args[0] !== undefined && args[0] instanceof Route) {
            Log.log('Lib/Dispatcher', 'Discovered route:', args[0].toString());
            routes.push(args[0]);
        }
        else if (args[0] !== undefined) {
            Log.log('Lib/Dispatcher', 'Creating new Route to register.');
            routes.push(new Route(args));
        }
        else {
            throw new TypeError("Attempted to register an invalid Route.");
        }
    };

    /**
     * Finds routes in a directory and registers them.
     *
     * Attempts to require every file in the passed in directory. If that
     * file's modules.exports contains a valid Route, it will be included;
     * otherwise the file will be ignored.
     *
     * @param   {String}    path
     */
    this.addRoutes = function(path) {
        path                            = Path.join(process.cwd(), path);
        var files                       = FileSystem.readdirSync(path);
        for (var i = 0; i < files.length; i++) {
            var route                   = use(path + '/' + files[i]);
            if (route instanceof Route) {
                this.addRoute(route);
            }
        }
    };

    /**
     * Matches an instruction to a route and calls the route's handler.
     *
     * If a route cannot be found, it forwards the instruction to the
     * onRouteFail method.
     *
     * @param   {Object}    instruction
     */
    // TODO: Add authentication. See Docs/Sequences/CommandFlow.png.
    this.dispatch = function(instruction) {
        if (instruction.type === 'command') {
            var route                   = this.findRoute(instruction.path);
            if (route instanceof Route) {
                route.handler.call(route,instruction);
            }
            else {
                instruction.context.handleRouteFail(instruction);
            }
        }
    };

    /**
     * Attempts to match a path to a registered route.
     *
     * @param   {String}    path
     * @return  {Route|Null}
     */
    this.findRoute = function(path) {
        var route                       = null;
        for (var i = 0; i < routes.length; i++) {
            if (routes[i].path.test(path)) {
                route                   = routes[i];
            }
        }

        return route;
    };

    return this;
})();