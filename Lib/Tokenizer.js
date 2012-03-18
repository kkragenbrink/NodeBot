/**
* __          __   _ _   _                  _
* \ \        / /  (_) | | |                | |
*  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
*   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
*    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
*     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
*
* @created     14th March 2012
* @edited      14th March 2012
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
var Class                               = use('/Lib/Class');

/**
* Converts a string to a series of tokens and types.
*
* @author      Kevin Kragenbrink <kevin@writh.net>
* @version     0.1.0
* @subpackage  Lib
* @lends       Tokenizer
*/
var Tokenizer = Class.create(function() {
    this.EOFTOKEN = {
        value                           : null,
        type                            : 'EOF'
    };

    var expression;
    var tokenTypes;
    var stream;

    /**
     * Constructs up the tokenizer.
     * @param   {RegExp}    expr
     * @param   {RegExp}    oper
     * @param   {RegExp}    symb
     */
    this.constructor = function(expr, type) {
        expression                      = expr;
        tokenTypes                      = type;
    };

    this.prepare = function(input) {
        if (!expression.test(input)) {
            throw new TypeError('Invalid stream.');
        }
        stream                          = input;
    };

    /**
     * Finds the next token and converts it to a token objects.
     * @param   {String}    stream
     * @return  {Object}
     */
    this.getNextToken = function() {
        if (stream.length === 0 || stream === null) {
            return this.EOFTOKEN;
        }

        var matches                     = expression.exec(stream);
        if (matches) {
            var match                   = matches[1];
            stream                      = stream.substring(stream.indexOf(match) + match.length);
            return {
                value                   : match,
                type                    : this.getTokenType(match)
            }
        }
        else {
            return new Error('Parse error.');
        }
    };

    /**
     * Determines the token type by its value.
     *
     * @param   {String}  value
     * @return  {String}
     */
    this.getTokenType = function(value) {
        for (var i in tokenTypes) {
            if (tokenTypes.hasOwnProperty(i)) {
                if (tokenTypes[i].test(value)) {
                    return i;
                }
            }
        }
        return 'unknown';
    };
});
module.exports                          = Tokenizer;