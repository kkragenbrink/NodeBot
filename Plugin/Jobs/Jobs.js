/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     24th January 2012
 * @edited      8th February 2012
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
 * A plugin to allow players to meet other players with ease.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.3.0
 * @subpackage  Plugin
 * @plugin      Jobs
 * @singleton
 */
module.exports = (function() {
    var Database                        = use('/Lib/Database');
    var Dispatcher                      = use('/Lib/Dispatcher');
    var Route                           = use('/Lib/Route');
    var Util                            = use('/Lib/Util');
    var routes                          = {};
    var tables                          = {};

    // Route Definitions
    routes.create                       = new Route;
    routes.create.path                  = /jobs\/create/i;
    routes.create.contexts = {
        Mud                             : / ([a-z0-9\-_]{16})=([a-z0-9\-_ ]{64})\/(\w\W)+/igm
    };
    routes.create.handler               = use('/Plugin/Jobs/Routes/Create').run;

    routes.comment                      = new Route;
    routes.comment.path                 = /jobs\/comment/i;
    routes.comment.contexts = {
        Mud                             : / (\d+)=(\w\W)+/igm
    };
    routes.comment.handler              = use('/Plugin/Jobs/Routes/Comment').run;

    // Setup Routes
    for (var route in routes) {
        if (routes.hasOwnProperty(route)) {
            Dispatcher.addRoute(routes[route]);
        }
    }

    // SQLite Table Definitions
    tables.tag                         = [];
    tables.tag.push("id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT");
    tables.tag.push("name VARCHAR(32)");

    tables.job                         = [];
    tables.job.push("id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT");
    tables.job.push("title VARCHAR(255)");
    tables.job.push("created_at INTEGER NOT NULL");
    tables.job.push("due_at INTEGER NOT NULL");
    tables.job.push("status VARCHAR(32)");

    tables.job_tag                      = [];
    tables.job_tag.push("job_id INTEGER NOT NULL");
    tables.job_tag.push("tag_id INTEGER NOT NULL");

    tables.comment                      = [];
    tables.comment.push("id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT");
    tables.comment.push("job_id INTEGER NOT NULL");
    tables.comment.push("created_at INTEGER NOT NULL");
    tables.comment.push("author INTEGER NOT NULL");
    tables.comment.push("message TEXT");

    // Setup Tables
    for (var table in tables) {
        if (tables.hasOwnProperty(table)) {
            Database.run(Util.format("CREATE TABLE IF NOT EXISTS jobs_%s (%s)", table, tables[table].join(",")));
        }
    }
})();