/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     16th January 2012
 * @edited      9th July 2012
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

var Arguments                           = use('/Lib/Arguments');
var Class                               = use('/Lib/Class');
var Config                              = use('/NodeBot' ).config;
var FileSystem                          = use('fs');
var Log                                 = use('/Lib/Log');
var Sequelize                           = use('sequelize');
var Util                                = use('/Lib/Util');

/**
 * A Database ORM Adapter.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.4.0
 * @subpackage  Lib
 * @singleton
 */
var Database = new Sequelize(Config.database.name, Config.database.user, Config.database.pass, {
    port                        : (Config.database.port || 3306),
    host                        : (Config.database.host || 'localhost'),
    logging                     : false,//function(message) { Log.debug('Lib/Database', message); },
    define : {
        freezeTableName         : true
    }
});
module.exports                  = Database;
module.exports.addModels = function(path) {
    var models                  = FileSystem.readdirSync(process.cwd() + '/' + path);

    for (var i = 0; i <  models.length; i++) {
        models[i]               = models[i].substr(0, models[i].lastIndexOf('.'));
        Log.log('Lib/Database', 'Discovered model: %s.', models[i]);
        use(path + '/' + models[i]);
    }

    Database.sync();
};
module.exports.type             = Sequelize;