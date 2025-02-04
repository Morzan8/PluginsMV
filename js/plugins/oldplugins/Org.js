//=============================================================================
// Progression_System.js
//=============================================================================

/*:
 * @plugindesc Plugin based on Nergal's Urban Demons. I've tried to comment it in details, so YOU can use it, change it or learn from it.
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



    //--------------//
    //Const & Params//
    //--------------//

    //Params
    //var params = PluginManager.params('CustomStuff');

    //Globals
    var Day;
    var Period;

    //-------//
    //TOOLBOX//
    //-------//

    // Class of a text condition
    //Example:
    //variable='purity'
    //operator='>'
    //value='5'
    //result='true'
    //text='ok'
    //if you send a text to this character with a purity>5, you'll get 'ok' as an answer and it'll return you true
    function txtCondition(variable, operator, value, result, text) {
        this.variable = variable;
        this.operator = operator;
        this.value = value;
        if (result == 'true') {
            this.result = true;
        } else {
            this.result = false;
        }
        this.text = text;
    }

    //Class of a phone data
    //day -> days where you can send this text (ex: weekend [6,7])
    //periods -> periods of times where you can send this text
    //progress_min -> Minimal progress that you need to have with this character to send this kind of text
    //text -> String of the text that you can send
    //responses -> array of txtConditions to determine the answer you'll get
    //switch -> the id of the switch that'll get the answer
    function PhoneTextData(txt) {
        for (line in txt.split('\n')) {
            var linesplit = line.split(':');
            if (linesplit.length > 1) {
                switch (linesplit[0]) {
                    case 'days':
                        for (i = 1; i < linesplit.length; i++) {
                            this.days.push(linesplit[i]);
                        }
                        break;
                    case 'periods':
                        for (i = 1; i < linesplit.length; i++) {
                            this.periods.push(linesplit[i]);
                        }
                        break;
                    case 'progress_min':
                        this.progress_min = linesplit[1];
                        break;
                    case 'text':
                        this.text = linesplit[1];
                        break;
                    case 'switch':
                        this.switch = linesplit[1];
                        break;
                    case 'progress':
                    case 'corruption':
                    case 'purity':
                    case 'blackmail':
                        if (linesplit.length >= 5) {
                            this.responses.push(new txtCondition(linesplit[0], linesplit[1], linesplit[2], linesplit[3], linesplit[4]));
                        }
                        break;
                    case 'default':
                        if (linesplit.length >= 5) {
                            this.responses.push(new txtCondition(linesplit[0], '', '', linesplit[1], linesplit[2]));
                        }
                        break;
                }
            }
        }
    }

    //Put the entirety of a file in a string 
    function MVNodeFS() {}
    MVNodeFS.fs = require("fs");
    MVNodeFS.readFile = function (filePath, filename) {
        filePath = this.createPath("/" + filePath + "/");
        if (this.fs.existsSync(filePath + filename)) {
            return this.fs.readFileSync(filePath + filename, "utf8");
        } else {
            return 0;
        }
        
    };
    MVNodeFS.createPath = function (relativePath) {
        //Checks if MV is in dev mode, or production, then decides the appropriate path
        relativePath = (Utils.isNwjs() && Utils.isOptionValid("test")) ? relativePath : "/www/" + relativePath;
        //Creates the path using the location pathname of the window and replacing certain characters
        var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, relativePath);
        if (path.match(/^\/([A-Z]\:)/)) {
            path = path.slice(1);
        }
        //Decode URI component and finally return the path
        path = decodeURIComponent(path);
        return path;
    };
    /*var getTextFile = function (file) {
        MVNodeFS.readFile
        /*var xhr = new XMLHttpRequest();
        xhr.open("GET", file, false);
        xhr.send(null);
        return xhr.responseText;*/
    //}

    //Used to display a modification in values 
    var showStatModification = function (full_message, color) {
        $gameMessage.setPositionType(1);
        $gameMessage.add("\\C[" + color + "]" + full_message + "\\C");
    }

    var updateDayTime = function (day, period) {
        Day=day;
        Period=period;
    }

    //-------//
    //SUMMARY//
    //-------//
    //I-Actors Stats
    //I.1- Add properties to the default Game_Actor class like corruption, purity... (I keep character story progressions as RPGMaker variables, they are easier to use to affects position of events)
    //I.2- Create function that automatically display those properties on modification
    //II-Phone Menu
    //IV-Item Menu
    //V-Scene Player

    //--------------//
    //I-Actors Stats//
    //--------------//
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
        is_blackmailed: { get: function () { return this._is_blackmailed; }, configurable: true },
        hint: { get: function () { return this._hint; }, configurable: true },
        MC_hasNum: { get: function () { return this._MC_hasNum; }, configurable: true },
        MC_hasNewMessage: { get: function () { return this._MC_hasNewMessage; }, configurable: true },
        messages: { get: function () { return this._messages; }, configurable: true },
        availablesTexts: { get: function () { return this._availablesTexts; }, configurable: true }
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
        this._MC_hasNum = false;
        this._MC_hasNewMessage = false;
        this._MC_hasAdress = false;
        this._is_blackmailed = false;
        this._hint = "";
        this._messages = [];

        var txt = MVNodeFS.readFile('data/Texts', this._actorId + '.txt');//getTextFile('data/Texts/' + this._actorId + '.txt')
        if (txt != 0) {
            for (txtData in txt.split(';')) {
                this._availablesTexts.push(new PhoneTextData(txtData));
            }
        }
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

    //Add message to the message log of the actor
    Game_Actor.prototype.addMessage = function (sender, text) {
        if (this._messages == undefined) {
            this._messages = [];
        }
        this._messages.push("- ["+sender+"] : "+text);
    }

    //Check if MC can send a text
    Game_Actor.prototype.MC_hasTxtToSend = function () {
        for (txt in this.availablesTexts) {
            if (txt.days.includes(Day) && txt.periods.includes(Period) && txt.progress_min <= this.progress) {
                return true;
            }
        }
        return false;
    }

    //Send the picked response and flip the right switch
    Game_Actor.prototype.sendTextBack = function (text,id_switch, result) {
        this.addMessage(this._name, text);
        $gameSwitches.setValue(id_switch, (result == 'true' || result == 'on'));
        this._MC_hasNewMessage = true;
        AudioManager.playSe({ name: 'Bell3', pan: 0, pitch: 100, volume: 90 });
    }

    //Sends text if condition is resolved
    Game_Actor.prototype.resolveTxtCondition = function(condition){
        var variable;
        switch (condition.variable) {
            case 'purity':
                if (this.corruptionRoute == false && this.blackmailed == false) {
                    variable = this.purity;
                }
                break;
            case 'corruption':
                if (this.purityRoute == false && this.blackmailed == false) {
                    variable = this.corruption;
                }
                break;
            case 'progress':
                variable = this.progress;
                break;
            case 'blackmail':
                if (this.blackmailed == true) {
                    this.sendTextBack.call(this, condition.text, txt.switch, condition.result);
                    return true;
                }
                break;
            case 'default':
                this.addMessage(this._name, condition.text);
                this.sendTextBack.call(this, condition.text, txt.switch, condition.result);
                return true;
        }
        if (variable != undefined) {
            switch (condition.operator) {
                case '=':
                case '==':
                case '===':
                    if (variable == parseInt(condition.value, 10)) {
                        this.sendTextBack.call(this, condition.text, txt.switch, condition.result);
                        return true;
                    }
                    break;
                case '!=':
                case '<>':
                    if (variable != parseInt(condition.value, 10)) {
                        this.sendTextBack.call(this, condition.text, txt.switch, condition.result);
                        return true;
                    }
                    break;
                case '>':
                    if (variable > parseInt(condition.value, 10)) {
                        this.sendTextBack.call(this, condition.text, txt.switch, condition.result);
                        return true;
                    }
                    break;
                case '>=':
                    if (variable >= parseInt(condition.value, 10)) {
                        this.sendTextBack.call(this, condition.text, txt.switch, condition.result);
                        return true;
                    }
                    break;
                case '<':
                    if (variable < parseInt(condition.value, 10)) {
                        this.sendTextBack.call(this, condition.text, txt.switch, condition.result);
                        return true;
                    }
                    break;
                case '<=':
                    if (variable <= parseInt(condition.value, 10)) {
                        this.sendTextBack.call(this, condition.text, txt.switch, condition.result);
                        return true;
                    }
                    break;

            }
        }
        return false;
    }

    //Function that runs in parallel to the main program, sends the text of the MC, wait 10 secs, sends the response
    Game_Actor.prototype.sendMessage = function (id_text) {
        txt = this.availablesTexts[id_text];
        //MC sends his text
        this.addMessage($gameParty.members()[1]._name, txt.text);
        //set 10 sec delay
        setTimeout(function () {
            //vv--Executed after 10000 milliseconds--vv
            //for each condition 
            for (condition in txt.responses) {
                //We check which condition it validates, then it sends a text, a beep ,puts the selected switch on or off and break out of the loop
                if (this.resolveTxtCondition(condition)) {
                    break;
                }
            }
        }, 10000)
    }

    //-------------//
    //II-Phone Menu//
    //-------------//

    //1- The First Menu
    /*
     Here, we are going to modify the basic menu to display what we want
     In RPG MAKER MV, a menu is a scene (an object from a class contained in rpg_scenes) containing one or more windows (an object from a class contained in rpg_windows)
     Keep in mind that:
     -a scene controls the datas, the windows, the navigation between the scenes etc...
     -a windows is just a graphic interface that displays the data from the scene or catch the data that the player input and pass it to the scene
     
     We are going to modify the main menu here, so we don't need to create a new scene, we are just going to update the Scene_Menu class to our liking
     Basically, everything is already set:
     - the commandWindow window allow us to select what we want to do 'Check Phone' 'Options' 'Save' 'Load' 'Quit'
     - the statusWindow displays the status of every actor from the party (in this game being in the party means that they are met, we might update that in the future)
     - the goldWindow shows the money in our bag $_$
     */

    //1.1- Structure
    //Here, we will update the structure of the menu
    //By default, the commandWindow is to the left and displays its options in a single column
    //What we want is to put it on top on a single row
    //The statusWindow is on the right and displays athe actors  in a single column
    //What we want is to put it below commandWindow and to display actors on a single row

    var _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function () {
        _Scene_Menu_create.call(this);//<-here we add every windows to the scene by using scene.addWindow(this._statusWindow) for example
        this._statusWindow.x = 0;//Status window starts from the left
        this._statusWindow.y = this._commandWindow.height;// and is positionned right after commandWindow
        this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;// goldWindow was on the bottom left ,now we put it on the bottom right
        
        //While we are here, we will setup popups that will allow us to do stuff when we select actors
        //They will pop when we call them via scene.addChild(window)
        this.create_popupchoice();//popup asking if we want to show hint, show the conversation or send a text
        this.create_popuphint();//popup showing the hints
        //this.create_popupmessages();//popup showing the conversation
        //this.create_popupsendmessage();//popup sending a text
    };

    //Window_MenuCommand 
    //Set the Window_MenuCommand width to be the same as the game window (not the class, the app window !!) 
    Window_MenuCommand.prototype.windowWidth = function () {
        return Graphics.boxWidth;
    };
    //Set its column number as 5 cause we have 5 options
    Window_MenuCommand.prototype.maxCols = function () {
        return 5;
    };
    //And to display only one row
    Window_MenuCommand.prototype.numVisibleRows = function () {
        return 1;
    };

    //Window_MenuStatus 
    //Phone Menu
    //Set the Window_MenuStatus width to be the same as the game window (not the class, the app window !!)
    Window_MenuStatus.prototype.windowWidth = function () {
        return Graphics.boxWidth;
    };
    //Set its height number to fit 1 row
    Window_MenuStatus.prototype.windowHeight = function () {
        var h1 = this.fittingHeight(1);
        var h2 = this.fittingHeight(2);
        return Graphics.boxHeight - h1 - h2;
    };
    //We chose to display 4 actors at a time
    Window_MenuStatus.prototype.maxCols = function () {
        return 4;
    };
    //On 1 row
    Window_MenuStatus.prototype.numVisibleRows = function () {
        return 1;
    };
    //We increase the padding (the distance between the border of a window and its content) 
    //because we want to mimic a phone and with a padding of 18, the content would overlap the border of the phone
    Window_MenuStatus.prototype.standardPadding = function () {
        //return 18;
        return 30;
    };
    //We change the windowskin of the window to match a phone's (in the future we might improve this script to add a picture as background but for now it'll do)
    Window_MenuStatus.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem('PhoneWindow');
    };
    //The opacity of a phone can't be transparent
    Window_MenuStatus.prototype.standardBackOpacity = function () {
        return 255;
    };
    //Return the actor selected
    Window_MenuStatus.prototype.getSelectedActor = function () {
        return $gameParty.members()[this.index() + 1];
    };


    //1.2- Adding the load and check phone(which is status button) buttons
    Window_MenuCommand.prototype.makeCommandList = function () {
        /*this.addMainCommands();
        this.addFormationCommand();
        this.addOriginalCommands();*/
        this.addCommand(TextManager.status, 'status', true);//Status is remplaced by 'Check Phone' in the editor
        this.addOptionsCommand();
        this.addSaveCommand();
        //this is how we add a command to a window: this.addCommand(DisplayedName, HandlerToTrigger, isEnabled)
        //DisplayedName: the name displayed by the option
        //HandlerToTrigger: the handle that will be returned to the scene 
        //isEnabled: if the option is clickable
        this.addCommand('Load', 'load', true);//here, we add the option 'Load', and we allow the user to click on it, if he does, the scene will execute the method bound to the keyword 'load'
        this.addGameEndCommand();
    };
    //We set the handlers on the commands
    Scene_Menu.prototype.createCommandWindow = function () {
        this._commandWindow = new Window_MenuCommand(0, 0);
        //We create the handler matching the options
        this._commandWindow.setHandler('status', this.commandPersonal.bind(this));
        this._commandWindow.setHandler('options', this.commandOptions.bind(this));
        this._commandWindow.setHandler('save', this.commandSave.bind(this));
        //for instance, if 'load' is selected, it will execute this.commandLoad()
        this._commandWindow.setHandler('load', this.commandLoad.bind(this));
        this._commandWindow.setHandler('gameEnd', this.commandGameEnd.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    };
    //When we click load, we will go to a the load scene (which is already implemented by default into the game)
    Scene_Menu.prototype.commandLoad = function () {
        SceneManager.push(Scene_Load);
    };
    //Get the actor selected on the status window
    Scene_Menu.prototype.getSelectedActor = function () {
        if (this._statusWindow == undefined) {
            return undefined;
        } else {
            return this._statusWindow.getSelectedActor();
        }
    };

    //1.3- Show the right informations for every actors
    //Basically, we show every actor in the party EXCEPT THE MC
    //It might change but for now, if a character is in the party -> we met him / her, so we can display him/her

    //Window_MenuStatus display a list of items, and each item is an actor of the party
    //It considers that the index of the actor in the party is the same as the index of the items list
    //eg: the first character of the party will be the first character of the list

    //We show every character of the party minus the MC so we will show $gameParty.size() - 1 items
    Window_MenuStatus.prototype.maxItems = function () {
        return $gameParty.size() - 1;
    };
    //The loop to parse the actors happens in drawAllItems, but we don't need to change it
    //When we draw an item (the status of an actor)
    Window_MenuStatus.prototype.drawItem = function (index) {
        this.drawItemBackground(index);//We set the background 
        this.drawItemStatus(index);//We display the status
    };
    //When we display an actor, we actually display the next one, since MC is always the first
    Window_MenuStatus.prototype.drawItemStatus = function (index) {
        var actor = $gameParty.members()[index+1];
        var rect = this.itemRectForText(index);
        var x = rect.x;
        var y = rect.y;
        var width = rect.width;
        var bottom = y + rect.height;
        var lineHeight = this.lineHeight();
        //First line
        this.drawActorName(actor, x, y + lineHeight * 0, width);
        //Second line
        this.drawActorClass(actor, x, y + lineHeight * 1, width);
        //Face
        this.drawActorFace(actor, x, y + lineHeight * 2, width, lineHeight * 4);
        //The icons
        this.drawActorProgress(actor, x, y + lineHeight * 6, width);
        this.drawActorPhone(actor, x+width - Window_Base._iconWidth, y + lineHeight * 6, width);
        this.drawActorCorruption(actor, x, y + lineHeight * 7, width);
        if (actor.is_blackmailed) {
            this.drawImg('blackmailed', width - Window_Base._iconWidth, y + lineHeight * 7);
        }
        this.drawActorPurity(actor, x, y + lineHeight * 8, width);
    };
    //Functions displaying actors stats (We put them in the superclass Window_Base so we can use them in all kinds of windows)
    Window_Base.prototype.drawActorPurity = function (actor, x, y) {
        if (actor.purity == undefined) {
            actor._purity = 0;
        }
        this.drawImg('purity', x, y);
        this.drawText(":" + actor.purity, x + Window_Base._iconWidth, y , 100, 'left')
    }
    Window_Base.prototype.drawActorCorruption = function (actor, x, y) {
        if (actor.corruption == undefined) {
            actor._corruption = 0;
        }
        this.drawImg('corruption', x, y);
        this.drawText(":" + actor.corruption, x + Window_Base._iconWidth, y, 100, 'left')
    }
    Window_Base.prototype.drawActorProgress = function (actor, x, y) {
        if (actor.progress == undefined) {
            actor._progress = 0;
        }
        this.drawImg('progress', x, y);
        this.drawText(":" + actor.progress, x + Window_Base._iconWidth, y, 100, 'left')
    }
    Window_Base.prototype.drawActorPhone = function (actor, x, y) {
        if (actor.MC_hasNum) {
            if (actor.MC_hasNewMessage) {
                this.drawImg('text_received', x, y);
            } else if (actor.MC_hasTxtToSend()) {
                this.drawImg('text_to_send', x, y);
            } else {
                this.drawImg('has_num', x, y);
            }
        } else {
            this.drawImg('no_num', x, y);
        }
    }
    Window_Base.prototype.drawImg = function (ImgName, x, y) {
        var bitmap = ImageManager.loadSystem(ImgName);
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        this.contents.blt(bitmap, 0, 0, pw, ph, x, y);
    };

    //2-Popup Windows
    //When we click on an actor, on the phone menu
    Window_MenuStatus.prototype.processOk = function () {
        var actor = this.getSelectedActor();
        var scene = SceneManager._scene;
        var hint_exist = false, messagelog_exist = false, cansendtxt = false;
        if (actor != undefined) {
            if (actor.hint != undefined && actor.hint != '') {
                hint_exist = true;
            }
            if (actor.messages != undefined && actor.messages.length > 0) {
                messagelog_exist = true;
            }
            if (actor.MC_hasTxtToSend()) {
                cansendtxt = true;
            }
        }
        if (hint_exist && !messagelog_exist && !cansendtxt) {//can only see hint
            scene.open_popuphint();
        } else if (!hint_exist && messagelog_exist && !cansendtxt) {//can only see text
            scene.open_popupmessages();
        } else if (!hint_exist && !messagelog_exist && cansendtxt) {//can only send text
            //scene.open_popupsendtxt();
        } else if (hint_exist || messagelog_exist || cansendtxt) {//can do at least 2 things
            scene.open_popupchoice();
        } else {//can't do anything
            AudioManager.playSe({ name: 'Cancel1', pan: 0, pitch: 100, volume: 50 });
        }
    };
    Scene_Menu.prototype.removeWindow = function (window) {
        this._windowLayer.removeChild(window);
    }
    //CHOICE WINDOW
    //We create the window in the scene and we set the handlers, just waiting to be addChild
    Scene_Menu.prototype.create_popupchoice = function () {
        /*this._choiceWindow = new Window_ChoiceActor();
        this._choiceWindow.setHandler('hint', this.open_popuphint.bind(this));//this.addChild.bind(this, this._hintWindow));
        this._choiceWindow.setHandler('messages', this.open_popupmessages.bind(this));
        //this._choiceWindow.setHandler('sendmessages', this.open_popupsendtxt.bind(this));
        this._choiceWindow.setHandler('cancel', this.close_popupchoice.bind(this));*/
        
    };
    //Open Popup
    Scene_Menu.prototype.open_popupchoice = function () {
        this._statusWindow.deactivate();
        this._choiceWindow = new Window_ChoiceActor();
        this._choiceWindow.setHandler('hint', this.open_popuphint.bind(this));//this.addChild.bind(this, this._hintWindow));
        this._choiceWindow.setHandler('messages', this.open_popupmessages.bind(this));
        //this._choiceWindow.setHandler('sendmessages', this.open_popupsendtxt.bind(this));
        this._choiceWindow.setHandler('cancel', this.close_popupchoice.bind(this));
        this.addWindow(this._choiceWindow);
        //this._choiceWindow.open();
    }
    //Close Popup
    Scene_Menu.prototype.close_popupchoice = function () {
        //this._choiceWindow.close();Window_Command.prototype.close.call(this);
        this.removeWindow(this._choiceWindow);
        this._statusWindow.activate();
    }
    //The window itself
    function Window_ChoiceActor() {
        this.initialize.apply(this, arguments);
    }
    Window_ChoiceActor.prototype = Object.create(Window_Command.prototype);
    Window_ChoiceActor.prototype.constructor = Window_ChoiceActor;
    Window_ChoiceActor.prototype.initialize = function () {
        this.clearCommandList();
        this.makeCommandList();
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = (Graphics.boxWidth - width) / 2;
        var y = (Graphics.boxHeight - height) / 2;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
        this.select(0);
        this.activate();
    };
    Window_ChoiceActor.prototype.makeCommandList = function () {
        var actor = SceneManager._scene.getSelectedActor();
        if (actor != undefined) {
            if (actor.hint != undefined && actor.hint != '') {
                this.addCommand('See hint', 'hint', true);
            }
            if (actor.messages != undefined && actor.messages.length > 0) {
                this.addCommand('See messages', 'messages', true);
            }
            if (actor.MC_hasTxtToSend()) {
                this.addCommand('Send Message', 'sendmessages', true);
            }
        }
        this.addCommand('Cancel', 'cancel', true);
    };
    Window_ChoiceActor.prototype.itemTextAlign = function () {
        return 'center';
    };
    Window_ChoiceActor.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem('PopupWindow');
    };
    Window_ChoiceActor.prototype.standardBackOpacity = function () {
        return 255;
    };
    /*Window_ChoiceActor.prototype.open = function () {
        var scene = SceneManager._scene;//Scene_Menu
        this.deactivatedStatusWindow = false;
        if (scene._statusWindow.isOpen()) {
            scene._statusWindow.deactivate();
            this.deactivatedStatusWindow = true;
        }
        Window_Command.prototype.open.call(this);
    };
    Window_ChoiceActor.prototype.close = function () {
        Window_Command.prototype.close.call(this);
        var scene = SceneManager._scene;//Scene_Menu
        if (this.deactivatedStatusWindow) {
            scene._statusWindow.activate();
        }
    };*/


    //HINT WINDOW
    //Open Popup
    Scene_Menu.prototype.create_popuphint = function () {
        this._hintwindow = new Window_HintActor();
        this.addWindow(this._hintwindow);
    }
    //Open Popup
    Scene_Menu.prototype.open_popuphint = function () {
        var actor = this.getSelectedActor();
        if (actor != undefined) {
            $gameMessage.clear();
            $gameMessage.setPositionType(1);
            $gameMessage.setBackground(0);
            $gameMessage.add('Hint:\n' + actor._hint);
            this._hintwindow.open();
        }
    }
    //Close Popup
    Scene_Menu.prototype.close_popuphint = function () {
        this._hintwindow.close();
    }
    //The window itself
    function Window_HintActor() {
        this.initialize.apply(this, arguments);
    }
    Window_HintActor.prototype = Object.create(Window_Message.prototype);
    Window_HintActor.prototype.constructor = Window_HintActor;
    Window_HintActor.prototype.open = function () {
        var scene = SceneManager._scene;//Scene_Menu

        this.deactivatedStatusWindow = false;
        if (scene._statusWindow.isOpen()) {
            scene._statusWindow.deactivate();
            this.deactivatedStatusWindow = true;
        }
        this.deactivatedChoiceWindow = false;
        if (scene._choiceWindow.isOpen()) {
            //scene._choiceWindow.deactivate();
            scene.close_popupchoice();
            this.deactivatedChoiceWindow = true;
        }

        Window_Message.prototype.open.call(this);
    };
    Window_HintActor.prototype.close = function () {
        Window_Message.prototype.close.call(this);
        var scene = SceneManager._scene;//Scene_Menu

        if (this.deactivatedStatusWindow) {
            scene._statusWindow.activate();
        }
        if (this.deactivatedChoiceWindow) {
            //scene._choiceWindow.activate();
            scene.open_popupchoice();
        }

        this.initMembers();
    };
    Window_HintActor.prototype.itemTextAlign = function () {
        return 'center';
    };
    Window_HintActor.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem('PopupWindow');
    };
    Window_HintActor.prototype.standardBackOpacity = function () {
        return 255;
    };


    //MESSAGES WINDOW
    //We create the window in the scene and we set the handlers, just waiting to be addChild
    Scene_Menu.prototype.create_popupmessages = function () {
        this._messagesWindow = new Window_MessagesLog();
        this._messagesWindow.setHandler('cancel', this.closeWindow.bind(this, this._messagesWindow));
        this.addWindow(this._hintwindow);
    };
    //Open Popup
    Scene_Menu.prototype.open_popupmessages = function () {
        this._messagesWindow.open();
    }
    //Close Popup
    Scene_Menu.prototype.close_popupmessages = function () {
        this._messagesWindow.close();
    }
    //The window itself
    function Window_MessagesLog() {
        this.initialize.apply(this, arguments);
    }
    Window_MessagesLog.prototype = Object.create(Window_Selectable.prototype);
    Window_MessagesLog.prototype.constructor = Window_MessagesLog;
    Window_MessagesLog.prototype.initialize = function () {
        var height = (this.itemHeightGraphics.boxWidth/2) * 4 + this.padding * 2;
        var width = Graphics.boxWidth / 2 ;
            Window_Selectable.prototype.initialize.call(this, (Graphics.boxHeight - height) / 2, (Graphics.boxWidth - width) / 2, width, height);
        this.actor = SceneManager._scene.getSelectedActor(); 
    };
    Window_MessagesLog.prototype.open = function () {
        var scene = SceneManager._scene;//Scene_Menu

        this.deactivatedStatusWindow = false;
        if (scene._statusWindow.isOpen()) {
            scene._statusWindow.deactivate();
            this.deactivatedStatusWindow = true;
        }
        this.deactivatedChoiceWindow = false;
        if (scene._choiceWindow.isOpen()) {
            scene._choiceWindow.deactivate();
            this.deactivatedChoiceWindow = true;
        }
        Window_Selectable.prototype.open.call(this);
    };
    Window_MessagesLog.prototype.close = function () {
        Window_Message.prototype.close.call(this);
        var scene = SceneManager._scene;//Scene_Menu
        if (this.deactivatedStatusWindow) {
            scene._statusWindow.activate();
        }
        if (this.deactivatedChoiceWindow) {
            scene._choiceWindow.activate();
        }
        this.initMembers();
    };
    Window_MessagesLog.prototype.maxItems = function () {
        var res = 0;
        for (i = 0; this.actor.messages.length; i++) {
            res += 1;
        }
        return res;
    };
    Window_MessagesLog.prototype.itemHeight = function () {
        return this.lineHeight()*2;
    };
    Window_MessagesLog.prototype.processCancel = function () {
        SoundManager.playCancel();
        this.close();
    };
    Window_MessagesLog.prototype.drawAllItems = function () {
        var topIndex = this.topIndex();
        for (var i = 0; i < this.maxPageItems(); i++) {
            var index = topIndex + i;
            if (index < this.maxItems()) {
                this.drawItem(index);
            }
        }
    };
    Window_MessagesLog.prototype.drawItem = function (index) {
        var txt = this.actor.messages[this.maxPageItems() - index];//we get last message reveived or sent
        var rect = this.itemRect(index);
        if (index === this._pendingIndex) {
            var color = this.pendingColor();
            this.changePaintOpacity(false);
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
            this.changePaintOpacity(true);
        }
        this.drawText(txt, rect.x, rect.y, width);

    };
    /*
    //Open Popup
    Scene_Menu.prototype.open_popuphint = function () {
        this._statusWindow.deselect();
        this.closeWindow(this._choiceWindow).call(this);
        var actor = this.getSelectedActor.call(this);
        if (actor != undefined) {
            $gameMessage.push('Hint:\n' + actor._hint);
            this.addChild(this._hintWindow);
        }
    }
    //Close Popup
    Scene_Menu.prototype.close_popuphint = function () {
        this.closeWindow(this._hintWindow);
        this._statusWindow.activate();
    }
    //The window itself
    function Window_HintActor() {
        this.initialize.apply(this, arguments);
    }
    Window_HintActor.prototype = Object.create(Window_Message.prototype);
    Window_HintActor.prototype.constructor = Window_HintActor;
    Window_HintActor.prototype.itemTextAlign = function () {
        return 'center';
    };
    */
    
    /*
    //CHOICE WINDOW //WINDOW_MESSAGE VERSION
    //We create the window in the scene and we set the handlers, just waiting to be addChild
    Scene_Menu.prototype.create_popupchoice = function () {
        this._choiceWindow = new Window_ChoiceActor();
        //this._choiceWindow.setHandler('hint', this.open_popuphint.bind(this));//this.addChild.bind(this, this._hintWindow));
        //this._choiceWindow.setHandler('messages', this.open_popupmessages.bind(this));
        //this._choiceWindow.setHandler('sendmessages', this.open_popupsendtxt.bind(this));
        //this._choiceWindow.setHandler('cancel', this.close_popupchoice.bind(this));
        this.addWindow(this._choiceWindow);
    };
    //Open Popup
    Scene_Menu.prototype.open_popupchoice = function () {
        var actor = SceneManager._scene.getSelectedActor();
        $gameMessage.clear();
        $gameMessage.setPositionType(1);
        $gameMessage.choiceBackground(0);
        choices = [];
        if (actor != undefined) {
            if (actor.hint != undefined && actor.hint != '') {
                choices.push('See hint');
            }
            if (actor.messages != undefined && actor.messages.length > 0) {
                choices.push('See messages');
            }
            if (actor.MC_hasTxtToSend()) {
                choices.push('Send Message');
            }
        }
        choices.push('Cancel');
        $gameMessage.setChoices(choices, 0, choices.length);
        $gameMessage.setChoiceCallback(function (choice) {
            // choice is the index of the selected option.
            switch (choices[choice]) {
                case 'See hint':
                    SceneManager._scene.open_popuphint();
                    break;
                case 'See messages':
                    SceneManager._scene.open_popupmessages();
                    break;
                case 'Send Message':
                //SceneManager._scene.open_popupsendtxt();
                //break;
                case 'Cancel':
                    SceneManager._scene.close_popupchoice();
                    break;
            }
        });
        this._choiceWindow.open();
    }
    //Close Popup
    Scene_Menu.prototype.close_popupchoice = function () {
        this._choiceWindow.close();
    }
    //The window itself
    function Window_ChoiceActor() {
        this.initialize.apply(this, arguments);
    }
    Window_ChoiceActor.prototype = Object.create(Window_Message.prototype);
    Window_ChoiceActor.prototype.constructor = Window_ChoiceActor;
    Window_ChoiceActor.prototype.open = function () {
        var scene = SceneManager._scene;//Scene_Menu
        this.deactivatedStatusWindow = false;
        if (scene._statusWindow.isOpen()) {
            scene._statusWindow.deactivate();
            this.deactivatedStatusWindow = true;
        }
        Window_Message.prototype.open.call(this);
    };
    Window_ChoiceActor.prototype.close = function () {
        Window_Message.prototype.close.call(this);
        var scene = SceneManager._scene;//Scene_Menu
        if (this.deactivatedStatusWindow) {
            scene._statusWindow.activate();
        }
    };
    /*Window_ChoiceActor.prototype.itemTextAlign = function () {
    return 'center';
};
Window_ChoiceActor.prototype.loadWindowskin = function () {
    this.windowskin = ImageManager.loadSystem('PopupWindow');
};
Window_ChoiceActor.prototype.standardBackOpacity = function () {
    return 255;
};*/
    //CHOICE WINDOW //WINDOW_MESSAGE VERSION









    /////////
    //JUNK//
    ////////
/*//Now we, like every Karen of this world, have to make a scene
//This scene will display a single menu with several choices
//How to create a class:
//When we create an object we use the initialize function
function Scene_Choice() { this.initialize.apply(this, arguments); }
//Based on Scene_MenuBase, meaning that it will behave like a Scene_MenuBase object, we will just have to modify some functions to our liking
Scene_Choice.prototype = Object.create(Scene_MenuBase.prototype);
//What we call to create an object of this class
Scene_Choice.prototype.constructor = Scene_Choice;
//prepare allows us to catch something passed to this scene with SceneManager.prepareNextScene(parameterToPass)
Scene_Choice.prototype.prepare = function (actor) {
    this.actor = actor;
};
//When we create this scene, we create and display the window created in this.create_window();
Scene_Choice.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    this.create_window();
};
//These 2 functions below will behave like those inherited from Scene_MenuBase, so I could just not rewrite them here
//However they are crucial to a scene, so I just put them here for good measure and so I can tell you what they do
//update applies the changes made to the scene without us having to exit and reenter it, it also handles inputs, navigation  etc...
Scene_Choice.prototype.update = function () {
};
//terminate is launched when we leave the scene
Scene_Choice.prototype.terminate = function () {
};

//This create the window that we display
Scene_Choice.prototype.create_window = function () {
    this.choice_window = new Window_ChoiceActor();
    //this.choice_window.setHandler('hint', this.commandGameEnd.bind(this));
    //this.choice_window.setHandler('messages', this.commandGameEnd.bind(this));
    this.choice_window.setHandler('closewindow', this.choice_window.close.bind(this));
    this.addWindow(this.choice_window);
};*/



    //Draw the status window
   /* Window_Status.prototype.refresh = function () {
        this.contents.clear();
        if (this._actor) {
            var lineHeight = this.lineHeight();
            this.drawBlock1(lineHeight * 0);//Face + Name class surname + Status
            this.drawHorzLine(lineHeight * 4);//Horizontal Line
            this.drawBlock2(lineHeight * 5);//Hint
            this.drawHorzLine(lineHeight * 9);//Horizontal Line
            this.drawBlock3(lineHeight * 10);//Messages
        }
    };

    Window_Status.prototype.drawBlock1 = function (y) {
        this.drawActorFace(this._actor, 6, y);
        this.drawActorName(this._actor, 180, y);
        this.drawActorNickname(this._actor, 180, y + (this.lineHeight()*1) );
        this.drawActorClass(this._actor, 180, y + (this.lineHeight()*2));
        this.drawActorProgress(this._actor, 466, y )
        this.drawActorPurity(this._actor, 466, y + (this.lineHeight() * 1))
        this.drawActorCorruption(this._actor, 466, y + (this.lineHeight() * 2))
        this.drawActorPhone(this._actor, 466, y + (this.lineHeight() * 3))
        this.drawImg('blackmailed', 468 + this._iconWidth, y + (this.lineHeight() * 3));
    };

    Window_Status.prototype.drawBlock2 = function (y) {
        this.drawActorHint(this._actor, 6, y, this.lineHeight * 2);
    }

    Window_Status.prototype.drawBlock3 = function (y) {
        this.drawActorMessages(this._actor, 6, y, this.lineHeight * 3);
    }

    //Reselect the right actor
    Window_MenuStatus.prototype.reselect = function () {
        if (this._index > 0) {
            this.select(this._index-1);
        } else {
            this.select(this._index);
        }
    };*///II-Keyboard Structure
    /*var oldKeyDown = SceneManager.onKeyDown;
    SceneManager.onKeyDown = function (event) {
        oldKeyDown.call(this, event);
        if (!event.ctrlKey && !event.altKey) {
            switch (event.keyCode) {
                case 83:   // S
                    if (SceneManager._scene instanceof Scene_PhoneMenu) {
                        SceneManager.pop();
                    } else {
                        SceneManager.push(Scene_PhoneMenu);
                    }

                    //Scene_PhoneMenu.prototype.start().call(this);
                    break;
                case 68:   // D
                    $gameMessage.add("OPEN ITEMS");
                    break;
            }
        }
    };*/
})();
