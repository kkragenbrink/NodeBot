/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     9th March 2012
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

var ProcessManager                      = use('/Lib/ProcessManager');
var Route                               = use('/Lib/Route');

/**
 * Manages the +meetme route.
 *
 * Usage:
 *   +meetme <player>
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.1.0
 * @subpackage  Plugin
 * @plugin      Meetme
 * @singleton
 */
var Meetme = Route.extend(function() {

    /**
     * Sets up the route.
     */
    this.constructor = function() {
        this.path                       = /meetme/i;
        this.contexts = {
            Mud                         : /([A-z0-9\-_]{20})/i
        };
        this.handler                    = this.run;
    };

    /**
     * Handles initial meetme request.
     * @param   {Object}    instruction
     */
    this.run = function(instruction) {
        var data = {
            requester                   : instruction.requester,
            target                      : instruction.arguments[1],
            mud                         : instruction.context,
            _start                      : (new Date()).getTime(),
            _end                        : null
        };

        var proc                        = ProcessManager.createProcess(data, handleComplete);
        var validate                    = proc.spawn({}, handleValidation);

        data.mud.validateUser(validate.pid, data.target);
    };
});
module.exports                          = new Meetme;
