/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     9th March 2012
 * @edited      10th March 2012
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

var Route                               = use('/Lib/Route');

/**
 * Manages the meetme route.
 *
 * Usage:
 *   meetme <player>
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.1.2
 * @subpackage  Plugin
 * @plugin      Meetme
 * @singleton
 */
var Meetme = Route.extend(function() {
    var Cache                           = use('/Lib/Cache');
    var Log                             = use('/Lib/Log');
    var ProcessManager                  = use('/Lib/ProcessManager');
    var Util                            = use('/Lib/Util');

    /**
     * Sets up the route.
     */
    this.constructor = function() {
        this.path                       = /meetme/i;
        this.contexts = {
            Mud                         : /([A-z0-9\-_]{1,64})/i
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
            context                     : instruction.context,
            _start                      : (new Date()).getTime(),
            _end                        : null
        };

        var proc                        = ProcessManager.createProcess(handleComplete, data);
        var validate                    = proc.spawn(handleValidation);

        data.context.processInstructionSet(validate.pid, [
            data.context.getInstruction_validateUser(data.target),
            data.context.getInstruction_name(data.requester)
        ]);
    };

    function handleComplete() {
        this.data._end                  = (new Date()).getTime();
        Log.log('Plugin/Meetme/meetme', 'Handled request in %s seconds.', (this.data._end - this.data._start)/1000);
    }

    function handleValidation(instruction) {
        var ancestor                    = ProcessManager.getProcess(this.ancestor);
        var uid                         = instruction.user;
        var name                        = instruction.name;
        var requester                   = ancestor.data.requester;

        if (ancestor.data.context.isTrue(uid)) {
            // Valid target

            var pending                 = Cache.get('Meetme.pending.' + uid) || {};

            if (typeof pending[requester] === 'undefined') {
                // Requestor doesn't have an outstanding request.
                pending[requester]      = (new Date()).getTime();// TODO: This should be a timer.
                Cache.set('Meetme.pending.' + uid, pending);
                ancestor.data.context.emit(requester, ancestor.data.context.prefix('meetme') + ' You send your request to meet.');
                var notice              = Util.format(ancestor.data.context.prefix('meetme') + ' %s would like to meet.', name);
                    notice             += Util.format('\n\tTo join them, type %smjoin %s.', ancestor.data.context.config.input.prefix, name);
                    notice             += Util.format('\n\tTo summon them, type %smsummon %s.', ancestor.data.context.config.input.prefix, name);
                    notice             += Util.format('\n\tTo decline, type %smdecline %s.', ancestor.data.context.config.input.prefix, name);
                    notice             += Util.format('\n\tTo ignore them, type %smignore %s.', ancestor.data.context.config.input.prefix, name);
                ancestor.data.context.emit(uid, notice);
            }
            else {
                ancestor.data.context.emit(requester, ancestor.data.context.prefix('meetme') + ' You have an outstanding request to meet that person.');
            }
        }
        else {
            ancestor.data.context.emit(requester, Util.format(ancestor.data.context.prefix('meetme') + ' %s is not a valid target.', ancestor.data.target));
        }
    }
});
module.exports                          = new Meetme;
