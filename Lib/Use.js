/**
 * Sets up global 'use' function.
 *
 * This function wraps around require() so that modules do not have to be aware
 * of their own depth when requiring other features.
 *
 * @param   {String}    node        The name or path to the required node.
 * @return  {Object}
 */
//var Path                                = require('path');
var path                                = process.cwd();
var cache                               = {};
module.exports = global.use = function(node) {
    if (typeof cache[node] === 'string') {
        return require(cache[node]);
    }
    else if (node.match(/^\//)) {
        cache[node]                     = path + node;
        return require(cache[node]);
    }
    else {
        cache[node]                     = node;
        return require(node);
    }
};