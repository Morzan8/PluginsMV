//=============================================================================
// rmmv_MorzanPhoneMenu.js
//=============================================================================

/*:
 * @plugindesc Plugin displaying a phone menu
 * @author Morzan
 * 
 * @param Delay
 * @desc Delay between sending a message and receiving it, expressed in milliseconds. By default, 2000.
 * 
 * @param Text Log Button
 * @desc Name of the option to access the message log window when you pick an actor. By default, Text Log.
 * 
 * @param Send Text Button
 * @desc Name of the option to access the send text window when you pick an actor. By default, Send Text.
 * 
 * @param Hint Button
 * @desc Name of the option to access the hint window when you pick an actor. By default, Hint.
 * 
 * @param Cancel Button
 * @desc Name of the option to cancel when you pick an actor. By default, Cancel.
 * 
 * @param Phone Image
 * @desc The location and the name of the phone image you'll use. By default, ./img/system/PhoneBackground.png
 * 
 * @param Phone Horizontal Padding
 * @desc Padding horizontal of the phone screen. By default, 4
 * 
 * @param Phone Vertical Padding
 * @desc Padding vertical of the phone screen. By default, 8
 * 
 * @help
 * This plugin allows you to use a phone menu by pressing p 
 * Notes:
 * -You can only see the people you've met so you need the MorzanProgression (I might change the interactivity of Progression and Phone later
 * -You can only see the message log if you have the phone number of the actor and if the message log isn't empty
 * -You can only access the texts window if you have the phone number of the actor and if you can send a text
 * -You can only see the hints if you have a hint
 * 
 * Plugin Command:
 *   MPhone enable                      # Enable the usage of the phone
 *   MPhone disable                     # Disable the usage of the phone
 *   MPhone get number 2                # Trigger the flag that the MC has the phone number of the actor 2
 *   MPhone set hint 2 do something     # Set the hint of the actor 2 to be "do something"
 *   MPhone getmsg 2 hey! dude          # The actor 2 sends the message "hey! dude" to the MC 
 * 
 * 
 */

 //Needs MorzanBase, MorzanProgression
var MorzanPlugin = MorzanPlugin || {};
(function () {
    
    //-----------//
    //Init Params//
    //-----------//
    const pluginname = "rmmv_MorzanPhoneMenu";
    //##DIFFERENT IN MV##//
    var parameters = PluginManager.parameters(pluginname);
    const PADDING_PHONE_WIDTH = MorzanPlugin.checkParam(parameters['Phone Horizontal Padding'],'number',4);
    const PADDING_PHONE_HEIGHT = MorzanPlugin.checkParam(parameters['Phone Vertical Padding'],'number',8);
    const NAME_MSGLOG_OPTION = MorzanPlugin.checkParam(parameters['Text Log Button'],'str',"Text Log");
    const NAME_MSGSEND_OPTION = MorzanPlugin.checkParam(parameters['Send Text Button'],'str',"Send Text");
    const NAME_HINT_OPTION = MorzanPlugin.checkParam(parameters['Hint Button'],'str',"Hint");
    const NAME_CANCEL_OPTION = MorzanPlugin.checkParam(parameters['Cancel Button'],'str',"Cancel");
    const DELAY_MSG=MorzanPlugin.checkParam(parameters['Delay'],'number', 2000);
    const PHONE_IMAGE = MorzanPlugin.checkParam(parameters['Phone Image'],'filepath',"/img/system/PhoneBackground.png");
    //##DIFFERENT IN MV##//

    //Check to see if the parameters are correct
    if (!MorzanPlugin.fileExist(PHONE_IMAGE)){
        throw new Error("Plugin :"+pluginname+", Parameter: Phone Image, File "+PHONE_IMAGE+" not found.");
    }else if ((typeof PADDING_PHONE_WIDTH) != 'number' && PADDING_PHONE_WIDTH>=50){
        throw new Error("Plugin :"+pluginname+", Parameter: Phone Horizontal Padding, Please type a number<50.");
    }else if ((typeof PADDING_PHONE_HEIGHT) != 'number' && PADDING_PHONE_HEIGHT>=50){
        throw new Error("Plugin :"+pluginname+", Parameter: Phone Vertical Padding, Please type a number<50.");
    }else if ((typeof DELAY_MSG) != 'number'){
        throw new Error("Plugin :"+pluginname+", Parameter: Delay, Please enter a number.");
    }

    const BITMAP_PHONEBACKGROUND = Bitmap.load(MorzanPlugin.createPath(PHONE_IMAGE));
    const OkButtons = ["ok","right"];
    const CancelButtons = ["cancel","left","p"];


    //---------------//
    //Plugin Commands//
    //---------------//
    //##DIFFERENT IN MV##//
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MPhone') {
            switch (args[0]) {
            case 'enable':
                $gameSystem.enablePhone();
                break;
            case 'disable':
                $gameSystem.disablePhone();
                break;
            case 'get':
            case 'set':
                var actorId = MorzanPlugin.getValueFromVariable(args[2]);
                if ((typeof actorId) == 'string')
                    actorId = parseInt($gameActors.getActorByName(actorId),10);
                if (args[1] == 'number'){
                    $gameActors.actor(actorId)._MC_hasNum=true;
                }
                else if (args[1] == 'hint'){
                    $gameActors.actor(actorId)._hint=args.slice(2).join(' ');
                }
                break;
            case 'getmsg':
                var actorId = MorzanPlugin.getValueFromVariable(args[1]);
                if ((typeof actorId) == 'string')
                    actorId = parseInt($gameActors.getActorByName(actorId),10);
                $gameActors.actor(actorId).addMessage($gameActors.actor(actorId).name(),args.slice(2).join(' '));
                break;
            }
        }
    };
    //##DIFFERENT IN MV##//
    //MCsendMsg actorId -> the actor who receive the msg, text-> the text of the message
    /*var MCsendMsg = function(args){
        var actorId = MorzanPlugin.getValueFromVariable(args["actorId"]);
        if ((typeof actorId) == 'string')
            actorId = parseInt($gameActors.getActorByName(actorId),10);
        $gameActors.actor(actorId).addMessage($gameActors.actor(1).name(),args["text"]);
    }
    PluginManager.registerCommand(pluginname,"MCsendMsg",MCsendMsg);*/


    //----------------------//
    //Update Default Classes//
    //----------------------//

    //Update actor class to add messages related parameters
    //Creation of Game_Actor properties
    Object.defineProperties(Game_Actor.prototype, {
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
        this._hint = "";
        this._MC_hasNum = false;
        this._MC_hasNewMessage = false;
        this._messages = [];
        this.loadTexts();
    };

    var oldActorSetup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        oldActorSetup.call(this,actorId);
        //Custom Properties
        if (this._hint == undefined)
            this._hint = "";
        if (this._MC_hasNum == undefined)
            this._MC_hasNum = false;
        if (this._MC_hasNewMessage == undefined)
            this._MC_hasNewMessage = false;
        if (this._messages == undefined)
            this._messages = [];
        
        if (this._availablesTexts == undefined){
            this.loadTexts();
        }
    };

    //Add message to the message log of the actor
    Game_Actor.prototype.addMessage = function (sender, text) {
        if (this._messages == undefined)
            this._messages = [];
        this._messages.push("- [" + sender + "] : " + text);
    };

    //Remove every messages of the actor
    Game_Actor.prototype.rmMessages = function () {
        this._messages=[];
    };

    //Loads the texts of an actor from the file
    Game_Actor.prototype.loadTexts = function(){
        var array_texts = MorzanPlugin.splitFile('data/Texts', this._actorId + '.txt');
        this._availablesTexts=[];
        if (array_texts != null){
            for (var i =0; i<array_texts.length;i++){
            this._availablesTexts.push(new PhoneTextData(array_texts[i]));
            }
        }
    };

    //Check if MC can send a text
    Game_Actor.prototype.MC_hasTxtToSend = function () {
        if (this.availablesTexts!=undefined){
            for (var i=0; i<this.availablesTexts.length; i++) {
                if ((this.availablesTexts[i].days != undefined) && (this.availablesTexts[i].periods != undefined) && (this.availablesTexts[i].progress_min != undefined)){
                    if ((MorzanPlugin.isDay(this.availablesTexts[i].days) && MorzanPlugin.isPeriod(this.availablesTexts[i].periods) && Number(this.availablesTexts[i].progress_min) <= this.progress)){
                        return true;
                    }
                }
            }
        }
        return false;
    };
    
    //Return an array containing the texts that you can send right now
    Game_Actor.prototype.getTxtToSend = function () {
        var res = [];
        if (this.availablesTexts!=undefined){
            for (var i=0; i<this.availablesTexts.length; i++) {
                if ((this.availablesTexts[i].days != undefined) && (this.availablesTexts[i].periods != undefined) && (this.availablesTexts[i].progress_min != undefined)){
                    if ((MorzanPlugin.isDay(this.availablesTexts[i].days) && MorzanPlugin.isPeriod(this.availablesTexts[i].periods) && Number(this.availablesTexts[i].progress_min) <= this.progress && MorzanPlugin.noSpace(this.availablesTexts[i].text) != "")){
                        res.push(this.availablesTexts[i]);
                    }
                }
            }
        }
        return res;
    };

    //Update the list of sendable texts
    Game_Actors.prototype.loadTexts = function () {
        for (var i=2; i<this._data.length; i++){
            this._data[i].loadTexts();
        }
    };

    //Remove the flag mc_has_new_txt
    Game_Actors.prototype.rmNewTxtFlag = function (Id) {
        this._data[Id]._MC_hasNewMessage=false;
    };

    //Send a message to the MC
    Game_Actor.prototype.sendMessageToMC = function (text, id_switch, result) {
        this.addMessage(this._name, text);
        if (id_switch!=null)
            $gameSwitches.setValue(id_switch, (result == 'true' || result == 'on'));
        this._MC_hasNewMessage = true;
        AudioManager.playSe({ name: 'Bell3', pan: 0, pitch: 100, volume: 90 });
    };

    //Function that runs in parallel to the main program, sends the text of the MC, wait DELAY_MSG secs, sends the response
    Game_Actor.prototype.MCsendMessage = function (txtToSend) {
        //MC sends his text
        this.addMessage($gameParty.members()[0]._name, txtToSend.text);
        const sActor = this;
        //set 10 sec delay
        setTimeout(this.sendTextBack, DELAY_MSG,sActor,txtToSend)
    };

    //This function is called to receive the proper text of a message sent by mc
    Game_Actor.prototype.sendTextBack = function (sActor,txtToSend) {
        var variable;
        for (var i = 0; i<txtToSend.responses.length;i++) {
            condition = txtToSend.responses[i];
            variable="";
            switch (condition.variable) {
                case 'purity':
                    if (!sActor.corruptionRoute && !sActor.blackmailed)
                        variable = sActor.purity;
                    break;
                case 'corruption':
                    if (!sActor.purityRoute && !sActor.blackmailed)
                        variable = sActor.corruption;
                    break;
                case 'progress':
                    variable = sActor.progress;
                    break;
                case 'blackmail':
                    if (sActor.blackmailed) {
                        sActor.sendMessageToMC(condition.text, txtToSend.switch, condition.result);
                        return true;
                    }
                    break;
                case 'default':
                    sActor.sendMessageToMC(condition.text, txtToSend.switch, condition.result);
                    return true;
            }
            if (variable != undefined) {
                switch (condition.operator) {
                    case '=':
                    case '==':
                    case '===':
                        if (variable == parseInt(condition.value, 10)) {
                            sActor.sendMessageToMC(condition.text, txtToSend.switch, condition.result);
                            return true;
                        }
                        break;
                    case '!=':
                    case '<>':
                        if (variable != parseInt(condition.value, 10)) {
                            sActor.sendMessageToMC(condition.text, txtToSend.switch, condition.result);
                            return true;
                        }
                        break;
                    case '>':
                        if (variable > parseInt(condition.value, 10)) {
                            sActor.sendMessageToMC(condition.text, txtToSend.switch, condition.result);
                            return true;
                        }
                        break;
                    case '>=':
                        if (variable >= parseInt(condition.value, 10)) {
                            sActor.sendMessageToMC(condition.text, txtToSend.switch, condition.result);
                            return true;
                        }
                        break;
                    case '<':
                        if (variable < parseInt(condition.value, 10)) {
                            sActor.sendMessageToMC(condition.text, txtToSend.switch, condition.result);
                            return true;
                        }
                        break;
                    case '<=':
                        if (variable <= parseInt(condition.value, 10)) {
                            sActor.sendMessageToMC(condition.text, txtToSend.switch, condition.result);
                            return true;
                        }
                        break;
                }
            }
        }
    };

    //-----------//
    //New Classes//
    //-----------//

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
        if (result == 'true')
            this.result = true;
        else
            this.result = false;
        this.text = text;
    };

    //Class of a phone data
    //day -> days where you can send this text (ex: for weekend, type "days:6:7")
    //periods -> periods of times where you can send this text
    //progress_min -> Minimal progress that you need to have with this character to send this kind of text
    //text -> String of the text that you can send
    //responses -> array of txtConditions to determine the answer you'll get
    //switch -> the id of the switch that'll get the answer
    function PhoneTextData(text) {
        this.days=[];
        this.periods=[];
        this.progress_min=0;
        this.text="";
        this.switch=0;
        this.responses=[];
        for (var i=0; i<text.length;i++){
            var line = text[i];
            if (line.length > 1) {
                switch (line[0]) {
                    case 'days':
                        for (j = 1; j < line.length; j++)
                            this.days.push(parseInt(MorzanPlugin.noSpace(line[j]),10));
                        break;
                    case 'periods':
                        for (j = 1; j < line.length; j++)
                        this.periods.push(parseInt(MorzanPlugin.noSpace(line[j]),10));
                        break;
                    case 'progress_min':
                        this.progress_min = Number(MorzanPlugin.noSpace(line[1]));
                        break;
                    case 'text':
                        this.text = line[1];
                        break;
                    case 'switch':
                        this.switch = Number(MorzanPlugin.noSpace(line[1]));
                        break;
                    case 'progress':
                    case 'corruption':
                    case 'purity':
                    case 'blackmail':
                        if (line.length >= 5)
                            this.responses.push(new txtCondition(line[0], line[1], line[2], line[3], line[4]));
                        break;
                    case 'default':
                        if (line.length >= 3)
                            this.responses.push(new txtCondition(line[0], '', '', line[1], line[2]));
                        break;
                }
            }
        }
    };

    //----------//
    //Phone Menu//
    //----------//

    //1- The Base
    /*
     Here, we are going to create a new menu
     In RPG MAKER MZ, a menu is a scene (an object from a class contained in rmmz_scenes) containing one or more windows (an object from a class contained in rmmz_windows)
     */


    //1.1- Calling the menu
    //Here, we will create the 'p' key to the keymapping to call a menu from the map
    //We also need to create some function to see if the player can open the phone menu

    Input.keyMapper[80]='p';//Set p to be detected

    var oldGame_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        oldGame_System_initialize.call(this);
        this._phoneEnabled = true;
    };
    Game_System.prototype.isPhoneEnabled = function() {
        return this._phoneEnabled;
    };
    
    Game_System.prototype.disablePhone = function() {
        this.__phoneEnabled = false;
    };
    
    Game_System.prototype.enablePhone = function() {
        this._phoneEnabled = true;
    };

    Scene_Map.prototype.isPhoneEnabled = function() {
        return $gameSystem.isPhoneEnabled() && !$gameMap.isEventRunning();
    };

    var oldScene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        oldScene_Map_start.call(this);
        this.phoneCalling = false;
    };

    Scene_Map.prototype.isPhoneCalled = function() {
        return Input.isTriggered("p");
    };
    
    Scene_Map.prototype.callPhone = function() {
        SoundManager.playOk();
        SceneManager.push(Scene_Phone);
        //Window_MenuCommand.initCommandPosition();
        $gameTemp.clearDestination();
        this._mapNameWindow.hide();
        this._waitCount = 2;
    };

    Scene_Map.prototype.updatePhoneMenu = function() {
        if (this.isPhoneEnabled()) {
            if (this.isPhoneCalled())
                this.phoneCalling = true;
            if (this.phoneCalling && !$gamePlayer.isMoving())
                this.callPhone();
        } else {
            this.phoneCalling = false;
        }
    };
    
    var oldScene_Map_updateScene = Scene_Map.prototype.updateScene;
    Scene_Map.prototype.updateScene = function() {
        oldScene_Map_updateScene.call(this);
        if (!SceneManager.isSceneChanging())
            this.updatePhoneMenu();
    };
    
    //1.2- The Scene
    //Here we will create the menu and it's controls
    //For the controls, I chose a different model than the standards rmmz files:
    //Usually, in Rmmz, you set handlers to call some functions within the window
    //Here, I've put everything related to pressing Ok or cancel in Scene_Phone.processOk and Scene_Phone.cancel
    //This way, I know where the controlling code is and where the view code is
    //Plus, I can easily store and acces variables in the Scene
    //I don't know if it's the right model, but I'll keep it as is unless proven buggy or less performant
    function Scene_Phone() {
        this.initialize.apply(this, arguments);
        //To store the selected actor
        this.selectedActor = null;
    };
    
    Scene_Phone.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Phone.prototype.constructor = Scene_Phone;
    
    Scene_Phone.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
        this.preLoad();
    };

    Scene_Phone.prototype.preLoad = function(){
        ImageManager.loadSystem("blackmailed");
        ImageManager.loadSystem("corruption");
        ImageManager.loadSystem("purity");
        ImageManager.loadSystem("progress");
        ImageManager.loadSystem("has_num");
        ImageManager.loadSystem("no_num");
        ImageManager.loadSystem("text_received");
        ImageManager.loadSystem("text_to_send");
        //ImageManager.loadSystem("PhoneBackground");
        //ImageManager.loadSystem("WindowEmpty");
        array_actor_met = $gameActors.getMets();
        for (var i=0 ; i<array_actor_met.length; i++){
            ImageManager.loadPicture(array_actor_met[i].name());
        }
        $gameActors.loadTexts();
    };

    //Function used to open a window
    Scene_Phone.prototype.openWindow = function(window){
        if (window != this._phoneWindow && window != this._choiceWindow)
            this._rightBackground.show();
        window.refresh();
        window.activate();
        window.show();
    };

    //Function used to open a window
    Scene_Phone.prototype.closeWindow = function(window){
        if (window != this._phoneWindow){
            window.hide();
            if (window != this._choiceWindow)
                this._rightBackground.hide();
        }
        window.deactivate();
    };
    //Here we create the 5 windows composing this scene:
    //-phoneWindow shows the contacts, it's the first window
    //-If you can do several actions to a contact, choiceWindow shows your choices
    //-msgWindow shows the message conversation with the contact
    //-txtWindow shows the messages that you can send to the contact
    //-hintWindow shows the hint for the progression with the contact
    Scene_Phone.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.preLoad();
        array_actor_met = $gameActors.getMets();
        for (var i=0 ; i<array_actor_met.length; i++){
            ImageManager.loadPicture(array_actor_met[i].name());
        }
        this.createBackgroundLeftWindow();
        this.createBackgroundRightWindow();
        this.createPhoneWindow();
        this.createChoiceWindow();
        this.createShowMsgWindow();
        this.createSendMsgWindow();
        this.createHintWindow();
        this._phoneWindow.show();
        this._leftBackground.show();
        this._phoneWindow.activate();
    };
    //Insert a window in the scene
    Scene_Phone.prototype.insertWindow = function(window, canOk, main){
        if(window!=null){
            for (var i=0; i<CancelButtons.length;i++)
                window.setHandler(CancelButtons[i], this.processCancel.bind(this));
            if (canOk){
                for (var i=0; i<OkButtons.length;i++)
                    window.setHandler(OkButtons[i], this.processOk.bind(this));
            }   
            if (!main){//Means it's the main window of the scene, so if it's not, we hide it and we set <- as cancel
                window.hide();
            }
            this.addChild(window);
        }
        return window;
    };

    //Create the left window
    Scene_Phone.prototype.createPhoneWindow = function() {
        const rect = this.phoneWindowRect(true,false);
        const phoneWindow = new Window_Contacts(rect);
        this._phoneWindow = this.insertWindow(phoneWindow,true,true);
    };

    //Create the choice window
    Scene_Phone.prototype.createChoiceWindow = function() {
        const rect = this.choiceWindowRect();
        const choiceWindow = new Window_PhoneChoice(rect);
        this._choiceWindow = this.insertWindow(choiceWindow,true,false);
    };

    //Create the MsgLog window
    Scene_Phone.prototype.createShowMsgWindow = function() {
        const rect = this.phoneWindowRect(false,false);
        const msgWindow = new Window_PhoneMsg(rect);
        this._msgWindow = this.insertWindow(msgWindow,false,false);
    };

    //Create the Texting window
    Scene_Phone.prototype.createSendMsgWindow = function() {
        const rect = this.phoneWindowRect(false,false);
        const txtWindow = new Window_PhoneText(rect);
        this._txtWindow = this.insertWindow(txtWindow,true,false);
    };

    //Create the Hint window
    Scene_Phone.prototype.createHintWindow = function() {
        const rect = this.phoneWindowRect(false,false);
        const hintWindow = new Window_PhoneHint(rect);
        this._hintWindow = this.insertWindow(hintWindow,false,false);
    };

    //Create the left background window
    Scene_Phone.prototype.createBackgroundLeftWindow = function() {
        const rect = this.phoneWindowRect(true,true);
        const leftBackground = new Window_PhoneBackground(rect);
        leftBackground.hide();
        this.addWindow(leftBackground);
        this._leftBackground = leftBackground;
    };

    //Create the right background window
    Scene_Phone.prototype.createBackgroundRightWindow = function() {
        const rect = this.phoneWindowRect(false,true);
        const rightBackground = new Window_PhoneBackground(rect);
        rightBackground.hide();
        this.addWindow(rightBackground);
        this._rightBackground = rightBackground;
    };

    //Create a rectangle used to initiate the phone's windows
    Scene_Phone.prototype.phoneWindowRect = function(main,background) {
        var wx,wy,ww,wh;
        const ratio = BITMAP_PHONEBACKGROUND.height/BITMAP_PHONEBACKGROUND.width;
        wh = Graphics.boxHeight;
        ww = wh/ratio;
        if (main)
            wx = 0;
        else
            wx = Graphics.boxWidth - ww;
        wy = 0;
        if (!background){
            const paddingy=PADDING_PHONE_HEIGHT/100*wh;
            const paddingx=PADDING_PHONE_WIDTH/100*ww;
            wx+=paddingx;
            wy+=paddingy;
            ww-=2*paddingx;
            wh-=2*paddingy;
        }
        return new Rectangle(wx, wy, ww, wh);
    };

    //Create a rectangle used to initiate the choice window
    Scene_Phone.prototype.choiceWindowRect = function(){
        var wx,wy,ww,wh;
        wh = Graphics.boxHeight/2;
        wx = Math.min(Graphics.boxWidth,Graphics.boxHeight/2);
        ww= Graphics.boxWidth-2*(Graphics.boxHeight/(BITMAP_PHONEBACKGROUND.height/BITMAP_PHONEBACKGROUND.width));
        wy = 12;
        return new Rectangle(wx, wy, ww, wh);
    };


    //When you click Ok in this scene
    Scene_Phone.prototype.processOk = function(){
        //When we select an actor in the first window
        if (this._phoneWindow.isOpenAndActive()){
            //We check which window the player can open according to the selected actor properties
            this.selectedActor = this._phoneWindow.actor(this._phoneWindow.index());
            if (this.selectedActor != undefined){
                var hint_exist = false, messagelog_exist = false, cansendtxt = false;
                if (this.selectedActor.hint != undefined && this.selectedActor.hint != '')
                    hint_exist = true;
                if (this.selectedActor.MC_hasNum && this.selectedActor.messages != undefined && this.selectedActor.messages.length > 0)
                    messagelog_exist = true;
                if (this.selectedActor.MC_hasNum && this.selectedActor.MC_hasTxtToSend())
                    cansendtxt = true;
                
                
                this._phoneWindow.deactivate();//We deactivate the phoneWindow
                if (hint_exist && !messagelog_exist && !cansendtxt){ //can only see hint
                    this._rightBackground.show();
                    this.openWindow(this._hintWindow);
                }else if (!hint_exist && messagelog_exist && !cansendtxt){//can only see text
                    $gameActors.rmNewTxtFlag(this.selectedActor._actorId);
                    this.openWindow(this._msgWindow);
                }else if (!hint_exist && !messagelog_exist && cansendtxt){//can only send text
                    this.openWindow(this._txtWindow);
                }else if (hint_exist || messagelog_exist || cansendtxt){//can do at least 2 things
                    this.openWindow(this._choiceWindow);
                }else{//can't do anything
                    this._phoneWindow.activate();//We reactivate the phonewindow
                    AudioManager.playSe({ name: 'Cancel1', pan: 0, pitch: 100, volume: 50 });
                }
            }
            
            
        }else if (this._choiceWindow.isOpenAndActive()){
            this._choiceWindow.deactivate();
            switch (this._choiceWindow.currentSymbol()) {
                case "hint":
                    this.openWindow(this._hintWindow);
                    break;
                case "msgLog":
                    $gameActors.rmNewTxtFlag(this.selectedActor._actorId);
                    this.openWindow(this._msgWindow);
                    break;
                case "msgSend":
                    this.openWindow(this._txtWindow);
                    break;
                default:
                    this.processCancel();
            }
        }else if (this._txtWindow.isOpenAndActive()){
            if (this._txtWindow.index()>0){
                var listTexts = this.selectedActor.getTxtToSend();
                var textToSend = listTexts[this._txtWindow.index()];
                this.selectedActor.MCsendMessage(textToSend);
                this.processCancel();
            }
        }
    };

    //When you click cancel in this scene
    Scene_Phone.prototype.processCancel=function(){
        //If we're on the first menu, we leave the scene
        if (this._phoneWindow.isOpenAndActive()){
            this.popScene();
        }else{
            //If we're on another window, we hide and deactivate it
            if (this._choiceWindow.isOpenAndActive()){
                this.closeWindow(this._choiceWindow);
            }else{
                if (this._msgWindow.isOpenAndActive())
                    this.closeWindow(this._msgWindow);
                else if (this._txtWindow.isOpenAndActive())
                    this.closeWindow(this._txtWindow);
                else if (this._hintWindow.isOpenAndActive())
                    this.closeWindow(this._hintWindow);
                
            }
            //Then, if there is still the _choicewindow open, it means we went (phoneWindow->choiceWindow->"another"Window)
            if (this._choiceWindow.visible)
                this._choiceWindow.activate();//So we get back to the choiceWindow
            else
                this._phoneWindow.activate();//Otherwise, we go back to the first window
        }
    };

    //2- The Windows
    //We pretty much dealt with how the windows are positionned, what they do and how they interact between them
    //Now we just have to populate them, and show the right informations
    function Window_Phone() {
        this.initialize.apply(this, arguments);
    };
    
    Window_Phone.prototype = Object.create(Window_MenuStatus.prototype);//Window_Selectable Window_MenuStatus.prototype);
    Window_Phone.prototype.constructor = Window_Phone;
    Window_Phone.prototype.initialize = function(rect) {
        Window_MenuStatus.prototype.initialize.call(this, rect);
    };

    //Useful functions to deal with windows
    Window_Phone.prototype.numVisibleRows = function () {
        return 4;
    };

    Window_Phone.prototype.maxCols = function () {
        return 1;
    };

    Window_Phone.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem('WindowEmpty');
    };
    
    Window_Phone.prototype.processCancel = function(){
        SoundManager.playCancel();
        this.updateInputData();
        //this.deactivate();
        this.callCancelHandler();
    };

    Window_Phone.prototype.processOk = function(){
        if (this.isCurrentItemEnabled()) {
            this.playOkSound();
            this.updateInputData();
            //this.deactivate();
            this.callOkHandler();
        } else {
            this.playBuzzerSound();
        }
    };
    
    Window_Phone.prototype.isOkTriggered = function() {
        if (this._canRepeat)
            return MorzanPlugin.isRepeated(OkButtons);
        return MorzanPlugin.isTriggered(OkButtons);
    };
    
    Window_Phone.prototype.isCancelTriggered = function() {
        return MorzanPlugin.isRepeated(CancelButtons);
    };

    //Function spliting a text to fit in an item
    Window_Phone.prototype.drawItemSplit = function(text,index) {
        const rect = this.itemRectWithPadding(index);
        var txt = MorzanPlugin.formatTextMessage(text,this).split('\n');
        var currentLine=0
        var maxLine=Math.floor(rect.height/this.lineHeight())-1;
        for (var i=0; i<txt.length;i++){
            if (currentLine<maxLine){
                this.drawText(txt[i], rect.x, rect.y+(this.lineHeight()*currentLine), rect.width, "left");
                currentLine++;
            }else if(currentLine==maxLine){
                this.drawText(txt.slice(i).join(" "), rect.x, rect.y+(this.lineHeight()*currentLine), rect.width, "left");
                break;
            }
        }
    };
    
    //2.1- The Menu Window 
    function Window_Contacts() {
        this.initialize.apply(this, arguments);
    };
    
    Window_Contacts.prototype = Object.create(Window_Phone.prototype);
    Window_Contacts.prototype.constructor = Window_Contacts;

    Window_Contacts.prototype.initialize = function(rect) {
        Window_Phone.prototype.initialize.call(this, rect);
    };

    Window_Contacts.prototype.maxItems = function() {
        return $gameActors.countMets();
    };

    Window_Contacts.prototype.actor = function(index) {
        return $gameActors.getMets()[index];
    };

    Window_Contacts.prototype.numVisibleRows = function () {
        return 1;
    };

    //The functions to draw items (text, image, icons...)
    Window_Contacts.prototype.drawSystemIcon = function (ImgName, x, y) {
        var bitmap = ImageManager.loadSystem(ImgName);
        var pw = ImageManager.iconWidth;
        var ph = ImageManager.iconHeight;
        this.contents.blt(bitmap, 0, 0, pw, ph, x, y);
    };

    Window_Contacts.prototype.drawActorPurity = function(actor, x, y, width) {
        if (actor.purity == undefined)
             actor._purity = 0;
        this.drawSystemIcon('purity', x, y);
        this.drawText(":" + actor.purity, x + ImageManager.iconWidth, y , 100, 'left')
    };

    Window_Contacts.prototype.drawActorPurity = function(actor, x, y, width) {
        if (actor.purity == undefined)
             actor._purity = 0;
        this.drawSystemIcon('purity', x, y);
        this.drawText(":" + actor.purity, x + ImageManager.iconWidth, y , 100, 'left')
    };

    Window_Contacts.prototype.drawActorProgress = function(actor, x, y, width) {
        if (actor.progress == undefined)
             actor._progress = 0;
        this.drawSystemIcon('progress', x, y);
        this.drawText(":" + actor.progress, x + ImageManager.iconWidth, y , 100, 'left')
    };

    Window_Contacts.prototype.drawActorCorruption = function(actor, x, y, width) {
        if (actor.corruption == undefined)
             actor._corruption = 0;
        this.drawSystemIcon('corruption', x, y);
        this.drawText(":" + actor.corruption, x + ImageManager.iconWidth, y , 100, 'left')
    };

    Window_Contacts.prototype.drawActorBlackmail = function(actor, x, y, width) {
        if (actor.blackmail == true)
            this.drawSystemIcon('blackmail', x, y);
    };

    Window_Contacts.prototype.drawActorPhoneIcon = function(actor, x, y, width) {
        if (actor.MC_hasNum) {
            if (actor.MC_hasNewMessage)
                this.drawSystemIcon('text_received', x, y);
            else if (actor.MC_hasTxtToSend())
                this.drawSystemIcon('text_to_send', x, y);
            else 
                this.drawSystemIcon('has_num', x, y);
        } else {
            this.drawSystemIcon('no_num', x, y);
        }
    };

    Window_Contacts.prototype.drawActorBust = function(actor, x, y, height, width) {
        var bitmap = ImageManager.loadPicture(actor.name());
        const sx = 0;
        const sy = 0;
        const sw = bitmap.width;
        const sh = bitmap.height;
        const dx = x;
        const dy = y;
        const dw = Math.min(height/(sh/sw), width);
        const dh = dw*(sh/sw);
        this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy, dw, dh);
    };

    Window_Contacts.prototype.drawItem = function(index) {
        //this.drawPendingItemBackground(index);
        const actor = this.actor(index);
        const rect = this.itemRectWithPadding(index);//itemRectWithPadding
        const x = rect.x;
        const y = rect.y;
        const width = rect.width;
        const lineHeight = this.lineHeight();
        this.drawActorBust(actor, x, y + lineHeight * 3, rect.height - lineHeight * 5, width);
        this.drawActorName(actor, x, y + lineHeight * 0, width);
        this.drawActorNickname(actor, x, y + lineHeight * 1, width);
        this.drawActorClass(actor, x, y + lineHeight * 2, width);
        this.drawActorProgress(actor, x, y + rect.height - lineHeight * 2, width/2);
        this.drawActorPhoneIcon(actor, x+width/2, y + rect.height - lineHeight * 2, width/4);
        this.drawActorBlackmail(actor, x+3*width/4, y + rect.height - lineHeight * 2, width/4);
        this.drawActorCorruption(actor, x, y + rect.height - lineHeight * 1, width/2);
        this.drawActorPurity(actor, x+width/2, y + rect.height - lineHeight * 1, width/2);
    };

    //2.2 Popup choice
    function Window_PhoneChoice() {
        this.initialize.apply(this, arguments);
    };
    
    Window_PhoneChoice.prototype = Object.create(Window_Command.prototype);
    Window_PhoneChoice.prototype.constructor = Window_PhoneChoice;

    Window_PhoneChoice.prototype.maxItems = function() {
        return 4;
    };
    
    Window_PhoneChoice.prototype.maxCols = function() {
        return 1;
    };

    Window_PhoneChoice.prototype.numVisibleRows = function() {
        return this.maxItems();
    };

    Window_PhoneChoice.prototype.itemHeight = function() {
        return this.innerHeight/this.numVisibleRows();
    };

    Window_PhoneChoice.prototype.makeCommandList = function() {
        this._list = [];
        var boolLog, boolSend, boolHint = false;
        if (SceneManager._scene.selectedActor != undefined) {
            boolLog = (SceneManager._scene.selectedActor.messages != undefined && SceneManager._scene.selectedActor.messages.length > 0);
            boolSend = (SceneManager._scene.selectedActor.MC_hasTxtToSend());
            boolHint = (SceneManager._scene.selectedActor.hint != undefined && SceneManager._scene.selectedActor.hint != '');
        }
        this.addCommand(NAME_MSGLOG_OPTION,"msgLog",boolLog,null);
        this.addCommand(NAME_MSGSEND_OPTION,"msgSend",boolSend,null);
        this.addCommand(NAME_HINT_OPTION,"hint",boolHint,null);
        this.addCommand(NAME_CANCEL_OPTION,"cancel",true,null);
    };
    
    Window_PhoneChoice.prototype.isOkTriggered = function() {
        if (this._canRepeat)
            return MorzanPlugin.isRepeated(OkButtons);
        return MorzanPlugin.isTriggered(OkButtons);
    };
    
    Window_PhoneChoice.prototype.isCancelTriggered = function() {
        return MorzanPlugin.isRepeated(CancelButtons);
    };

    Window_PhoneChoice.prototype.processCancel = function(){
        SoundManager.playCancel();
        this.updateInputData();
        //this.deactivate();
        this.callCancelHandler();
    }

    Window_PhoneChoice.prototype.processOk = function(){
        if (this.isCurrentItemEnabled()) {
            this.playOkSound();
            this.updateInputData();
            //this.deactivate();
            this.callOkHandler();
        } else {
            this.playBuzzerSound();
        }
    }
    //2.3- The Message Log Window 
    function Window_PhoneMsg() {
        this.initialize.apply(this, arguments);
    };
    
    Window_PhoneMsg.prototype = Object.create(Window_Phone.prototype);
    Window_PhoneMsg.prototype.constructor = Window_PhoneMsg;

    Window_PhoneMsg.prototype.maxItems = function() {
        if (SceneManager._scene.selectedActor != null)
            return SceneManager._scene.selectedActor.messages.length;
        else
            return 0;
    };

    Window_PhoneMsg.prototype.drawItem = function(index) {
        if (SceneManager._scene.selectedActor != null)
            this.drawItemSplit(SceneManager._scene.selectedActor.messages[index],index);
    };

    Window_PhoneMsg.prototype.activate = function(index) {
        Window_Phone.prototype.activate.call(this);
        this.forceSelect(SceneManager._scene.selectedActor.messages.length-1);
    };

    //2.4- The Window where you send text
    function Window_PhoneText() {
        this.initialize.apply(this, arguments);
    };
    
    Window_PhoneText.prototype = Object.create(Window_Phone.prototype);
    Window_PhoneText.prototype.constructor = Window_PhoneText;

    Window_PhoneText.prototype.maxItems = function() {
        if (SceneManager._scene.selectedActor != null){
            var res=SceneManager._scene.selectedActor.getTxtToSend();
            return res.length;
        }else{
            return 0;
        }
    };

    Window_PhoneText.prototype.drawItem = function(index) {
        if (SceneManager._scene.selectedActor != null)
            this.drawItemSplit(SceneManager._scene.selectedActor.getTxtToSend()[index].text,index);
    };

    //2.4- The Window where you see hints
    function Window_PhoneHint() {
        this.initialize.apply(this, arguments);
    }
    
    Window_PhoneHint.prototype = Object.create(Window_Phone.prototype);
    Window_PhoneHint.prototype.constructor = Window_PhoneHint;

    Window_PhoneHint.prototype.maxItems = function() {
        return 1;
    };

    Window_PhoneHint.prototype.numVisibleRows = function () {
        return 1;
    };

    Window_PhoneHint.prototype.drawItem = function(index) {
        if (SceneManager._scene.selectedActor != null)
            this.drawItemSplit(SceneManager._scene.selectedActor.hint,index);
    };

    //2.4- The Window that overlap other phone window to see the frame of the phone
    function Window_PhoneBackground() {
        this.initialize.apply(this, arguments);
    }
    
    Window_PhoneBackground.prototype = Object.create(Window_Base.prototype);
    Window_PhoneBackground.prototype.constructor = Window_PhoneBackground;
    Window_PhoneBackground.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this.paint();
    };

    Window_PhoneBackground.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem('WindowEmpty');
    };

    Window_PhoneBackground.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.paint();
    };

    Window_PhoneBackground.prototype.paint = function() {
        if (this.contents) {
            this.contents.clear();
            this.contentsBack.clear();
            //var bitmap = ImageManager.loadSystem('PhoneBackground');
            this.contents.blt(BITMAP_PHONEBACKGROUND, 0, 0, BITMAP_PHONEBACKGROUND.width, BITMAP_PHONEBACKGROUND.height, 0, 0,this.innerWidth, this.innerHeight);
        }
    };
})();