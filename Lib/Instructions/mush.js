/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     13th June 2012
 * @edited      13th June 2012
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
var Util                                = use('/Lib/Util');

/**
 * The MUSH Instructions.
 *
 * This instruction set translates Javascript to MUSHcode.
 *
 * @author      Kevin Kragenbrink <kevin@writh.net>
 * @version     0.1.0
 * @subpackage  Lib/Instructions
 * @singleton
 * @lends       MUSH
 */
var MUSH = Class.create(function() {

    /**
     * Creates a new user account.
     * @param   {String}    name
     * @param   {String}    password
     * @return  {String}
     */
    this.createUser = function(name, password) {
        return Util.format('@pcreate %s=%s', name, password);
    };

    /**
     * Sends a message to a specific user.
     * @param   {String}    dbref
     * @param   {String}    message
     * @return  {String}
     */
    this.emitToUser = function(dbref, message) {
        return Util.format('@pemit %s=%s', dbref, message.replace(/  /g, '%b%b'));
    };

    /**
     * Sends a message to all who are near a specific user.
     * @param   {String}    dbref
     * @param   {String}    message
     * @return  {String}
     */
    this.emitAroundUser = function(dbref, message) {
        return Util.format('@oemit %s=%s', dbref, message.replace(/  /g, '%b%b'));
    };

    /**
     * Returns the identity of the room where an object is located.
     * @param   {String}    dbref
     * @param   {Boolean}   inline
     * @return  {String}
     */
    this.getLocationByIdentity = function(dbref, inline) {
        inline                          = (inline === true);
        return Util.format('%s[loc(%s)]', (inline ? '' : 'loc:'), dbref);
    };

    /**
     * Returns the user-friendly name of an object.
     * @param   {String}    dbref
     * @param   {Boolean}   [inline]
     * @return  {String}
     */
    this.getNameByIdentity = function(dbref, inline) {
        inline                          = (inline === true);
        return Util.format('%s[name(%s)]', (inline ? '' : 'name:'), dbref);
    };

    /**
     * Returns the dbref of a player object.
     *
     * @param   {String}    user
     * @param   {Boolean}   [inline]
     * @return  {String}
     */
    this.getUserIdentity = function(user, inline) {
        inline                          = (inline === true);
        return Util.format('%s[pmatch(%s)]', (inline ? '' : 'user:'), user);
    };

    /**
     * Hilights a string.
     * @param   {String}    string
     * @param   {Boolean}   [inline]
     * @return  {String}
     */
    this.hilight = function(string, inline) {
        inline                          = (inline === true);
        return Util.format('%s[ansi(h,%s)]', (inline ? '' : 'hilight:'), string);
    };

    /**
     * Determines whether an identity is a guest.
     * @param   {String}    identity
     * @param   {Boolean}   [inline]
     * @return  {String}
     */
    this.isGuest = function(identity, inline) {
        inline                          = (inline === true);
        return Util.format('%s[haspower(%s, GUEST)]', (inline ? '' : 'isGuest:'), identity);
    };

    /**
     * Determines the length of a string as counted by the MUSH.
     * @param   {String}    string
     * @param   {Boolean}   [inline]
     * @return  {String}
     */
    this.length = function(string, inline) {
        inline                          = (inline === true);
        return Util.format('%s[strlen(%s)]', (inline ? '' : 'length:'), string);
    };

    /**
     * Teleports a user to a different location.
     * @param   {String}    dbref
     * @param   {String}    destination
     * @return  {String}
     */
    this.teleportUser = function(dbref, destination) {
        return Util.format('@teleport %s=%s', dbref, destination);
    };

    /**
     * Validates that a string is a valid name for the specified object type.
     *
     * @param   {String}    type
     * @param   {String}    string
     * @param   {Boolean}   [inline]
     * @return  {String}
     */
    this.validate = function(type, string, inline) {
        inline                          = (inline === true);

        switch (type) {
            case this.EXIT_TYPE:
                type                    = 'exitname';
                break;
            case this.USER_TYPE:
                type                    = 'playername';
                break;
            case this.ROOM_TYPE:
                type                    = 'roomname';
                break;
            case this.OBJECT_TYPE:
                type                    = 'thingname';
                break;
        }

        return Util.format('%s[valid(%s,%s)]', (inline ? '' : 'valid:'), type, string);
    };

    /**
     * Becomes non-breaking whitespace.
     *
     * @param   {Integer}       amount
     * @param   {Boolean}       [inline]
     * @return  {String}
     */
    this.whitespace = function(amount, inline) {
        inline                          = (inline === true);
        return Util.format('%s[space(%s)]', (inline ? '' : 'space:'), amount);
    };

    this.BAD_USER                       = '#-1 NO MATCH';
    this.EXIT_TYPE                      = 'exit';
    this.OBJECT_TYPE                    = 'thing';
    this.ROOM_TYPE                      = 'room';
    this.USER_TYPE                      = 'player';
});

module.exports                          = new MUSH;