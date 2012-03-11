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

var Class                           = use('/Lib/Class');

/**
 * A singleton to manage processes.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.1.1
 * @subpackage  Lib
 * @singleton
 */
var ProcessManager = Class.create(function() {
    var Log                             = use('/Lib/Log');
    var Process                         = use('/Lib/Process');

    var maxPid                          = Math.pow(2, 32);
    var pid                             = 1;
    var processes                       = {};

    /**
     * Creates a new process and returns the pid.
     *
     * @param   {Function}  callback
     * @param   {Object}    [data]
     * @return  {Process}
     */
    this.createProcess = function(callback, data) {
        var pid                         = getPid();
        processes[pid]                  = new Process(pid, callback, data);

        return processes[pid];
    };

    /**
     * Recycles a pid.
     * @param   {Integer}   pid
     */
    this.destroyProcess = function(pid) {
        if (processes[pid] instanceof Process) {
            processes[pid].destroy();
            delete processes[pid];
        }
    };

    /**
     * Returns a unique Process ID between 0 and maxPid.
     *
     * Process IDs will be recycled when processes are complete.
     * @return  {Integer}
     */
    function getPid() {
        if (pid === maxPid) {
            pid                         = 1;
        }

        var p                           = pid++;

        if (p in processes) {
            p                           = getPid();
        }

        return p;
    }

    /**
     * Gets a known process by its pid.
     * @param   {Integer}   pid
     * @return  {Process}
     */
    this.getProcess = function(pid) {
        if (processes[pid] instanceof Process) {
            return processes[pid];
        }

        Log.warn('Lib/ProcessManager', 'Attempted to get an invalid process:' + pid);
        return undefined;
    };
});
module.exports                          = new ProcessManager;