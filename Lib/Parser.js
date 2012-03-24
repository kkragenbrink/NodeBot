/**
* __          __   _ _   _                  _
* \ \        / /  (_) | | |                | |
*  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
*   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
*    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
*     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
*
* @created     23rd March 2012
* @edited      23rd March 2012
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
* Generic Parser for parsing tokens.
*
* @author      Kevin Kragenbrink <kevin@writh.net>
* @version     0.1.0
* @subpackage  Lib
* @lends       Parser
*/
var Parser = Class.create(function() {
    var Token                           = use('/Lib/Token');

    /**
     * Constructs the Parser.
     *
     * During construction, the regexp for the Lexicon and the Token Types must
     * be configured. These should not be stored in the parser's declaration.
     */
    this.constructor = function() {};

    /**
     * Returns the token types for the parser.
     * @return  {Object}
     */
    this.getTypes = function() {
        return this.types;
    };

    /**
     * Parses tokens.
     * @param   {Token[]}   tokens
     */
    this.parse = function(tokens) {};

    /**
     * The token types for the parser.
     * @var     {Object}    A series of named regexps to identify a token type.
     */
    this.types;
});
module.exports                          = Parser;