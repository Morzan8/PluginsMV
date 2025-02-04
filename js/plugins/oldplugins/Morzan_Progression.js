//=============================================================================
// Progression_System.js
//=============================================================================

/*:
 * @plugindesc Base Plugin.
 * @author Bobz
 *
 * @param Periods
 * @desc Ordered periods of the day
 *
 * @help This plugin does not provide plugin commands.
 */

(function() {



    //---------------//
    //Plugin Commands//
    //---------------//
    //updateDayTime variableNumberDay variableNumberPeriod -> set the global variables Day and Period to the value of the variables passed as parameters
    //addCorruption actorId valueToAdd -> add valueToAdd corruption to the actor matching the actorId
    //addPurity actorId valueToAdd -> add valueToAdd purity to the actor matching the actorId
    //addProgress actorId valueToAdd -> add valueToAdd progress to the actor matching the actorId
    //setCorruption actorId value -> set value as the corruption of the actor matching the actorId
    //setPurity actorId value -> set value as the purity of the actor matching the actorId
    //setProgress actorId value -> set value as the progress of the actor matching the actorId
    //setPurityRoute actorId -> set the actor matching the actorId on the purity route
    //setCorruptionRoute actorId -> set the actor matching the actorId on the corruption route
    //setBlackmailRoute actorId -> set the actor matching the actorId on the blackmail route
    //setRoute actorId -> set the actor matching the actorId on the route corresponding to the higher value between its corruption/purity
    //getPhoneNumber actorId -> Mc knows the phone number of the actor
    //getAdress actorId -> Mc knows the adress of the actor
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        var returned_args = [];
        var arrayVar
        for (i = 0; i < args.length; i++) {
            switch (args[i].substring(0, 2)) {
                case 'V[':
                    arrayVar = args[i].split((/\[|\]/));
                    returned_args.push($gameVariables.value(arrayVar[1]));
                    break;
                case 'S[':
                    arrayVar = args[i].split((/\[|\]/));
                    returned_args.push($gameSwitches.value(arrayVar[1]));
                    break;
                default:
                    returned_args.push(args[i]);
            }
        }
        if (command === 'updateDayTime' && args.length>=2) {
            updateDayTime($gameVariables.value(returned_args[0]), $gameVariables.value(returned_args[1]));
        }
        else if (command === 'addCorruption' && args.length == 2) {
            $gameActors.actor(returned_args[0]).addCorruption(returned_args[1]);
        }
        else if (command === 'addPurity' && args.length == 2) {
            $gameActors.actor(returned_args[0]).addPurity(returned_args[1]);
        }
        else if (command === 'addProgress' && args.length == 2) {
            $gameActors.actor(returned_args[0]).addProgress(returned_args[1]);
        }
        else if (command === 'setCorruption' && args.length == 2) {
            $gameActors.actor(returned_args[0]).setCorruption(returned_args[1]);
        }
        else if (command === 'setPurity' && args.length == 2) {
            $gameActors.actor(returned_args[0]).setPurity(returned_args[1]);
        }
        else if (command === 'setProgress' && args.length == 2) {
            $gameActors.actor(returned_args[0]).setProgress(returned_args[1]);
        }
        else if (command === 'setPurityRoute' && args.length == 1) {
            $gameActors.actor(returned_args[0]).setPurityRoute();
        }
        else if (command === 'setCorruptionRoute' && args.length == 1) {
            $gameActors.actor(returned_args[0]).setCorruptionRoute();
        }
        else if (command === 'setBlackmailRoute' && args.length == 1) {
            $gameActors.actor(returned_args[0]).setBlackmailRoute();
        }
        else if (command === 'setRoute' && args.length == 1) {
            $gameActors.actor(returned_args[0]).setRoute();
        }
        else if (command === 'getPhoneNumber' && args.length == 1) {
            $gameActors.actor(returned_args[0])._MC_hasNum=true;
        }
        else if (command === 'getAdress' && args.length == 1) {
            $gameActors.actor(returned_args[0])._MC_hasAdress = true;
        }
        else if (command === 'setHint' && args.length >= 2) {
            var hint='-';
            for (i = 1; i < args.length; i++) {
                hint += ' ' + returned_args[i];
            }
            $gameActors.actor(returned_args[0])._hint = hint;
        }
    };

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
        this._is_blackmailed = false;
    };

    //I.2- Modification functions
    Game_Actor.prototype.addCorruption = function (value) {
        this._corruption += value;
        if (this._corruption > 100) {
            this._corruption = 100;
        }
        showStatModification(this._name + ": +" + value + " Corruption", 2);
    }
    Game_Actor.prototype.setCorruption = function (value) {
        this._corruption = value;
        if (this._corruption > 100) {
            this._corruption = 100;
        }
        showStatModification(this._name + ":" + this._corruption + " Corruption", 2);
    }
    Game_Actor.prototype.addPurity = function (value) {
        this._purity += value;
        if (this._purity > 100) {
            this._purity = 100;
        }
        showStatModification(this._name + ": +" + value + " Purity", 1);
    }
    Game_Actor.prototype.setPurity = function (value) {
        this._purity = value;
        if (this._purity > 100) {
            this._purity = 100;
        }
        showStatModification(this._name + ":" + this._purity + " Purity", 1);
    }
    Game_Actor.prototype.addProgress = function (value) {
        this._progress += value;
        showStatModification(this._name + ": +" + value + " Progress", 1);
    }
    Game_Actor.prototype.setProgress = function (value) {
        this._progress = value;
        showStatModification(this._name + ":" + this._progress + " Progress", 3);
    }
    Game_Actor.prototype.setPurityRoute = function () {
        this._purityRoute = true;
        this._corruptionRoute = false;
        this.is_blackmailed = false;
    }
    Game_Actor.prototype.setCorruptionRoute = function () {
        this._corruptionRoute = true;
        this._purityRoute = false;
        this.is_blackmailed = false;
    }
    Game_Actor.prototype.setBlackmailRoute = function () {
        this._corruptionRoute = true;
        this._purityRoute = false;
        this.is_blackmailed = true;
    }
    Game_Actor.prototype.setRoute = function () {
        if (!this.is_blackmailed) {
            if (this._corruption > this._purity) {
                this.setCorruptionRoute();
            } else {
                this.setPurityRoute();
            }
        }
    }
})();
