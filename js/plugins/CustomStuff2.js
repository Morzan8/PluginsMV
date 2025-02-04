//=============================================================================
// CustomStuff2.js
//=============================================================================

/*:
 * @plugindesc TestPlugin.
 * @author Bobz
 *
 * @help This plugin does not provide plugin commands.
 */

(function() {

    Object.defineProperties(Game_Actor.prototype, {
        messages: { get: function () { return this._messages; }, configurable: true }
    });

})();
