//=============================================================================
// TestPlugin.js
//=============================================================================

/*:
 * @plugindesc plugin test.
 * @author Bobz
 *
 * @help This plugin does not provide plugin commands.
 */

(function () {

    Scene_Choice.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Choice.prototype.constructor = Scene_Choice;
    function Scene_Choice() { this.initialize.apply(this, arguments); }
    /*Scene_Choice.prototype.prepare = function () {

    };*/
    Scene_Choice.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_Choice.prototype.start = function () {
        Scene_MenuBase.prototype.start.call(this);
    };

    Scene_Choice.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.create_window();
    };

    Scene_Choice.prototype.update = function () {
        Scene_MenuBase.prototype.update.call(this);
    };

    Scene_Choice.prototype.terminate = function () {
        Scene_MenuBase.prototype.terminate.call(this);
    };

    Scene_Choice.prototype.create_window = function () {
        //var choice_msg = new Game_Message();
        /*var choices = ["See hint", "See messages"];
        choice_msg.setChoices(choices, 0, -1);
        choice_msg.setChoiceCallback(function (responseIndex) {
            if (responseIndex === 0) {
                // Player chose "See hint"

            } else if (responseIndex === 1) {
                // Player chose "See messages"
            } else if (responseIndex === 2) {
                // Player chose "Send message"
            }
        });*/
        //choice_msg.add('blabla');
        $gameMessage.add('blabla');
        this.choice_window = new Window_ChoiceList($gameMessage);
        this.addWindow(this.choice_window);
    };
})();