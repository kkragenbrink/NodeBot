/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     24th January 2012
 * @edited      25th January 2012
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
 * @version     0.1.0
 * @subpackage  Lib
 * @singleton
 * @lends       Dispatcher
 * @requires    Route
 */
module.exports = (function() {
    var Util                            = require('./Util');
    var Route                           = require('./Route');
    var Log                             = require('./Log');

    /**
     * Registers a route with an appropriate handler method.
     *
     * @param   {Route}     args[0]     The Route to be registered
     * @throws TypeError
     * @example
     *  var Dispatcher = require('./lib/Dispatcher');
     *  Dispatcher.register( /job\/create/, {
     *      mud : / (\w+)\/(\w+)=(\w+)/,
     *      web : {
     *          bucket : /(\w+)/,
     *          title : /(\w+)/,
     *          body : /(\w+)/
     *      }
     *   }, self.create );
     */
    var routes                          = [];
    this.register = function() {
        var args                        = Array.prototype.slice.call(arguments, 0);

        if (args[0] !== undefined && args[0] instanceof Route) {
            Log.log('Lib/Dispatcher', 'Registering predefined Route.');
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
    return this;
})();