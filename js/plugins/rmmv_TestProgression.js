//=============================================================================
// rmmv_MorzanProgression.js
//=============================================================================

/*:
 * @plugindesc Progression and stats.
 * @author Morzan
 *
 * @command getAdress
 * @text Get Adress
 * @desc Get the actor's adress.
 *
 * @arg actorId
 * @type number
 * @default 2
 * @text ID or name of the actor
 * @desc ID of the actor.
 *
 * @command setMet
 * @text Set Met
 * @desc The MC met the actor, he/she will be displayed in the phone, if the plugin is enabled.
 *
 * @arg actorId
 * @type number
 * @default 2
 * @text ID or name of the actor
 * @desc ID of the actor.
 * 
 * @help
 * This plugin adds to the actors the notions of:
 * - Progression
 * - Corruption, Purity
 * - If MC is blackmailing them or not
 * - If MC have met them or not
 * - If MC knows their adress
 * - Routes
 * 
 * Plugin Command:
 *   MProgression add corruption 2 3            # Add 3 corruption to the actor 2, works for corruption, purity and progress
 *   MProgression set corruption 2 3            # Set 3 corruption to the actor 2, works for corruption, purity and progress
 *   MProgression set route 2                   # Set the actor 2 on the route that fits its stats
 *   MProgression set route corruption 2        # Set the actor 2 on the corruption route, works for corruption, purity and blackmail
 *   MProgression set met 2                     # Trigger the flag that the MC has the met of the actor 2 (useful for the phone)
 *   MProgression get adress 2                  # Trigger the flag that the MC has the adress of the actor 2
 * 
 */
 
var MorzanPlugin = MorzanPlugin || {};
(function() {

    //---------------//
    //Plugin Commands//
    //---------------//
    const pluginname = "rmmv_MorzanProgression";
    //##DIFFERENT IN MV##//
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MProgression') {
            switch (args[0]) {

            case 'add':
                var actorId = MorzanPlugin.getValueFromVariable(args[2]);
                if ((typeof actorId) == 'string')
                    actorId = Number($gameActors.getActorByName(actorId));
                switch (args[1]){
                    case 'corruption':
                        $gameActors.actor(actorId).addCorruption(MorzanPlugin.getValueFromVariable(args[3]));
                        break;
                    case 'purity':
                        $gameActors.actor(actorId).addPurity(MorzanPlugin.getValueFromVariable(args[3]));
                        break;
                    case 'progress':
                        $gameActors.actor(actorId).addProgress(MorzanPlugin.getValueFromVariable(args[3]));
                        break;
                }
                break;

            case 'set':
                switch (args[1]){
                    case 'corruption':
                    case 'purity':
                    case 'progress':
                        var actorId = MorzanPlugin.getValueFromVariable(args[2]);
                        if ((typeof actorId) == 'string')
                            actorId = Number($gameActors.getActorByName(actorId));
                        if (args[1] == 'corruption')
                            $gameActors.actor(actorId).setCorruption(MorzanPlugin.getValueFromVariable(args[3]));
                        else if (args[1] == 'purity')
                            $gameActors.actor(actorId).setPurity(MorzanPlugin.getValueFromVariable(args[3]));
                        else if (args[1] == 'progress')
                            $gameActors.actor(actorId).setProgress(MorzanPlugin.getValueFromVariable(args[3]));
                        else if (args[1] == 'met')
                            $gameActors.actor(actorId)._MC_hasMet=true;
                    case 'route':
                        switch (args[2]){
                            case 'corruption':
                            case 'purity':
                            case 'blackmail':
                                var actorId = MorzanPlugin.getValueFromVariable(args[3]);
                                if ((typeof actorId) == 'string')
                                    actorId = Number($gameActors.getActorByName(actorId));
                                if (args[1] == 'corruption')
                                    $gameActors.actor(actorId).setCorruptionRoute();
                                else if (args[1] == 'purity')
                                    $gameActors.actor(actorId).setPurityRoute();
                                else if (args[1] == 'blackmail')
                                    $gameActors.actor(actorId).setBlackmailRoute();
                            default:
                                var actorId = MorzanPlugin.getValueFromVariable(args[2]);
                                if ((typeof actorId) == 'string')
                                    actorId = Number($gameActors.getActorByName(actorId));
                                $gameActors.actor(actorId).setRoute();
                                break;
                        }
                        break;
                }
                break;

            case 'get':
                switch (args[1]){
                    case 'adress':
                        var actorId = MorzanPlugin.getValueFromVariable(args[2]);
                        if ((typeof actorId) == 'string')
                            actorId = Number($gameActors.getActorByName(actorId));
                        $gameActors.actor(actorId).meets();
                        break;
                }
                break;
            }
        }
    };
    //##DIFFERENT IN MV##//

    //Used to display a modification in values 
    showStatModification = function (full_message, color) {
        $gameMessage.setPositionType(1);
        $gameMessage.add("\\C[" + color + "]" + full_message + "\\C");
    }

    //I-Actors Stats
    //I.1- Adding properties to Game_Actor
    //We will use the actor class to represent a character we just need to add a few properties ( = attributes, essentially)
    //Creation of Game_Actor properties
    Object.defineProperties(Game_Actor.prototype, {
        corruption: { get: function () { return this._corruption; }, configurable: true },
        purity: { get: function () { return this._purity; }, configurable: true },
        progress: { get: function () { return this._progress; }, configurable: true },
        corruptionRoute: { get: function () { return this._corruptionRoute; }, configurable: true },
        purityRoute: { get: function () { return this._purityRoute; }, configurable: true },
        MC_hasAdress: { get: function () { return this._MC_hasAdress; }, configurable: true },
        MC_hasMet: { get: function () { return this._MC_hasMet; }, configurable: true },
        is_blackmailed: { get: function () { return this._is_blackmailed; }, configurable: true }
    });

    //Instanciation of properties
    var oldActorInit = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function () {
        //Call old setup
        oldActorInit.call(this);
        //Custom Properties
        this._corruption = 0;
        this._purity = 0;
        this._progress = 0;
        this._corruptionRoute = false;
        this._purityRoute = false;
        this._MC_hasAdress = false;
        this._MC_hasMet = false;
        this._is_blackmailed = false;
    };

    //I.2- Modification functions
    Game_Actor.prototype.addCorruption = function (value) {
        this._corruption += value;
        if (this._corruption > 100)
            this._corruption = 100;
        showStatModification(this._name + ": +" + value + " Corruption", 2);
    };
    Game_Actor.prototype.setCorruption = function (value) {
        this._corruption = value;
        if (this._corruption > 100)
            this._corruption = 100;
        showStatModification(this._name + ":" + this._corruption + " Corruption", 2);
    };
    Game_Actor.prototype.addPurity = function (value) {
        this._purity += value;
        if (this._purity > 100)
            this._purity = 100;
        showStatModification(this._name + ": +" + value + " Purity", 1);
    };
    Game_Actor.prototype.setPurity = function (value) {
        this._purity = value;
        if (this._purity > 100)
            this._purity = 100;
        showStatModification(this._name + ":" + this._purity + " Purity", 1);
    };
    Game_Actor.prototype.addProgress = function (value) {
        this._progress += value;
        showStatModification(this._name + ": +" + value + " Progress", 1);
    };
    Game_Actor.prototype.setProgress = function (value) {
        this._progress = value;
        showStatModification(this._name + ":" + this._progress + " Progress", 3);
    };
    Game_Actor.prototype.setPurityRoute = function () {
        this._purityRoute = true;
        this._corruptionRoute = false;
        this.is_blackmailed = false;
    };
    Game_Actor.prototype.setCorruptionRoute = function () {
        this._corruptionRoute = true;
        this._purityRoute = false;
        this.is_blackmailed = false;
    };
    Game_Actor.prototype.setBlackmailRoute = function () {
        this._corruptionRoute = true;
        this._purityRoute = false;
        this.is_blackmailed = true;
    };
    Game_Actor.prototype.setRoute = function () {
        if (!this.is_blackmailed) {
            if (this._corruption > this._purity)
                this.setCorruptionRoute();
            else
                this.setPurityRoute();
        }
    };
    Game_Actor.prototype.meets = function () {
        this._MC_hasMet = true;
    };

    //MODIFS TO Game_Actors
    Game_Actors.prototype.countMets = function () {
        cpt = 0;
        for (var i=2; i<$dataActors.length; i++){//$dataActors.length; i++){
            if (this.actor(i)._MC_hasMet == true)
                cpt++;
        }
        return cpt;
    };
    Game_Actors.prototype.getMets = function () {
        res = [];
        for (var i=2; i<$dataActors.length; i++){//$dataActors.length; i++){
            if (this.actor(i)._MC_hasMet == true)
                res.push(this.actor(i));
        }
        return res;
    };
    Game_Actors.prototype.getActorByName = function (name) {
        for (var i=1; i<$dataActors.length; i++){//$dataActors.length; i++){
            if (this.actor(i).name == name)
                return i;
        }
        return 0;
    };
})();