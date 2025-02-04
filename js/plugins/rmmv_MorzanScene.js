//=============================================================================
// rmmv_MorzanScene.js
//=============================================================================

/*:
 * @plugindesc Generate a cutscene based on a txt file.
 * @author Morzan
 * 
 * @param Scenes Folder
 * @desc The path to the scene txt folder. By default, /data/Scenes/
 * 
 * @param Scenes Images Folder
 * @desc The path to the scene images folder. By default, /img/pictures/Scenes/
 * 
 * @param Background Folder
 * @desc The path to the background images folder. By default, /img/battlebacks1/
 * 
 * @param Background Extension
 * @desc The extension of your background files. By default, .jpg
 * 
 * @help
 * This plugin allow you to create animated cutscenes.
 * For this, you'll need to create a .txt file of a specific format, and start the scene via a plugin command.
 * More details in the documentation.
 * 
 * Plugin Command:
 *   MScene startScene filepath filename            # Start the scene located at filepath\filename.txt. Don't enter the extension and dont put spaces in filepath and filename.
 * 
 */

//import "MorzanBase.js";

var MorzanPlugin = MorzanPlugin || {};
(function() {
    const pluginname = "rmmv_MorzanScene";

    //-----------//
    //Init Params//
    //-----------//
    //##DIFFERENT IN MV##//
    var parameters = PluginManager.parameters(pluginname);
    const URL_BACKGROUND = MorzanPlugin.checkParam(parameters['Background Folder'], 'url',"/img/battlebacks1/");
    const URL_SCENES = MorzanPlugin.checkParam(parameters['Scenes Folder'], 'url', "/data/Scenes/");
    const URL_IMGLOOP = MorzanPlugin.checkParam(parameters['Scenes Images Folder'], 'url',"/img/pictures/Scenes/");
    const BACKGROUND_EXT = MorzanPlugin.checkParam(parameters['Background Extension'], 'ext',".jpg");
    //##DIFFERENT IN MV##//
    const SCENE_EXT = ".txt";

    //Check to see if the parameters are correct
    if (!MorzanPlugin.fileExist(URL_BACKGROUND)){
        throw new Error("Plugin :"+pluginname+", Parameter: Background Folder, Folder "+URL_BACKGROUND+" not found.");
    }else if (!MorzanPlugin.fileExist(URL_SCENES)){
        throw new Error("Plugin :"+pluginname+", Parameter: Scenes Folder, Folder "+URL_SCENES+" not found.");
    }else if (!MorzanPlugin.fileExist(URL_IMGLOOP)){
        throw new Error("Plugin :"+pluginname+", Parameter: Scenes Images Folder, Folder "+URL_IMGLOOP+" not found.");
    }else if (!MorzanPlugin.includes(BACKGROUND_EXT,[".jpg",".png",".jpeg"])){
        console.log(BACKGROUND_EXT);
        throw new Error("Plugin :"+pluginname+", Parameter: Background Extension, Format not supported.");
    }

    //##DIFFERENT IN MV##//
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MScene') {
            switch (args[0]) {
            case 'startScene':
                SceneManager.push(Scene_Cutscene);
                SceneManager.prepareNextScene(MorzanPlugin.combinePath([URL_SCENES,args[1]]),args[2]+SCENE_EXT);
                break;
            }
        }
    };
    //##DIFFERENT IN MV##//

    /////////////
    //Functions//
    //---------//
    //A full scene is divided in acts, containing different loops, music, background etc...
    //To create a scene, you need to get a file containing every informations of the cutscene
    //And put it in an array of Acts.
    MorzanPlugin.getFullScene = function(filepath,filename){
        var array_paragraphs = MorzanPlugin.splitFile(filepath,filename);
        if (array_paragraphs!=null){
            var background="";
            var music="";
            var repeat=false;
            var delay=0;
            var path="";
            var nameimgs="";
            var dialogues=[];
            var sounds={};

            var res=[];
            var array_lines;
            var line;
            //for each paragraph
            for (var i=0; i<array_paragraphs.length;i++){
                //We reset the dialogues
                //Everything else is kept
                dialogues=[];
                //for each line
                array_lines=array_paragraphs[i];
                for (var j=0; j<array_lines.length;j++){
                    line=array_lines[j];
                    //If it starts with
                    switch (line[0]){
                        case "background":
                            background=line[1];
                            break;
                        case "music":
                            music=line[1];
                            break;
                        case "repeat":
                            if (MorzanPlugin.includes(line[1],["true","on","yes"]))
                                repeat=true;
                            else
                                repeat=false;
                            break;
                        case "delay":
                            delay=line[1];
                            break;
                        case "path":
                            path=line[1];
                            break;
                        case "nameimgs":
                            nameimgs=line[1];
                            break;
                        case "dialogue":
                            dialogues.push(line[1]);
                            break;
                        case "sound":
                            if (line.length>2){
                                sounds[parseInt(line[1],10)]=line[2];
                            }else{
                                sounds={};
                            }
                            break;                                              
                    }
                }
                res.push(new Act(background,music,dialogues,new Loop(repeat,delay,path,nameimgs,sounds)));
            }
            return res;
        }else{
            return null;
        }
    };

    //New function for ImageManager: same as loadBitmap but we specify the extension
    ImageManager.loadBitmapExtension = function(folder, filename,fileExtension) {
        if (filename) {
            const url = folder + Utils.encodeURI(filename) + fileExtension;
            return this.loadBitmapFromUrl(url);
        } else {
            return this._emptyBitmap;
        }
    };
    //New function for ImageManager: same as loadBitmap the extension is already in the filename
    ImageManager.loadBitmapExtended = function(folder, filename) {
        if (filename) {
            const url = folder + Utils.encodeURI(filename);
            return this.loadBitmapFromUrl(url);
        } else {
            return this._emptyBitmap;
        }
    };
    //-----------//
    //New Classes//
    //-----------//
    //Loop Class
    //repeat = true if the animation is on repeat, false if it only plays once
    //delay = delay between each picture
    //images = array of images to be displayed
    //sounds = sounds played as the loop goes on
    function Loop(repeat, delay, path, nameImg, sounds) {
        this.repeat = repeat;
        this.delay = delay;
        this.path=MorzanPlugin.combinePath([URL_IMGLOOP,path]);
        this.images = MorzanPlugin.getAllStartBy(this.path,nameImg+" (");
        this.images.sort(function(a, b){return parseInt(a.slice((nameImg+" (").length),10)-parseInt(b.slice((nameImg+" (").length))});
        this.sounds = Object.assign({},sounds);
        this.currentframe = 0;
    };
    //Return the name of the current image of the loop
    Loop.prototype.currentImage = function(){
        return this.images[this.currentframe];
    }
    //Return the name of the current se of the loop
    Loop.prototype.currentSe = function(){
        return this.sounds[this.currentframe];
    }
    //Act Class
    //background = the background of the animation
    //music = the music playing in the background
    //dialogue = dialogues shown during this act
    //loop = loop executed during this act
    function Act(background, music, dialogues, loop) {
        this.background = background;
        this.music = music;
        this.dialogues = dialogues;
        this.loop = loop;
    };

    Act.prototype.loadAct = function(){
        //Preload images
        ImageManager.loadBitmapExtension(URL_BACKGROUND,this.background,BACKGROUND_EXT);
        for(var i=0; i<this.loop.images.length ;i++){
            ImageManager.loadBitmapExtended(this.loop.path,this.loop.images[i]);
        }
        //Preload Sounds
    }

    //---------//
    //The Scene//
    //---------//
    function Scene_Cutscene() {
        this.initialize.apply(this, arguments);
    };
    
    Scene_Cutscene.prototype = Object.create(Scene_Message.prototype);
    Scene_Cutscene.prototype.constructor = Scene_Cutscene;
    
    //initialization
    Scene_Cutscene.prototype.initialize = function() {
        Scene_Message.prototype.initialize.call(this);
        this.fadeTime=80;
    };
    //We receive the elements passed in parameters
    Scene_Cutscene.prototype.prepare = function(filepath,filename) {
        this._filepath = filepath;
        this._filename = filename;
    };
    //We start by loading the images in parallel
    Scene_Cutscene.prototype.loadScene = function() {
        this.full_scene = MorzanPlugin.getFullScene(this._filepath,this._filename);
        for(var i=0; i<this.full_scene.length; i++){
            this.full_scene[i].loadAct();
        }
    };
    //We need a message window and a scene window
    Scene_Cutscene.prototype.create = function() {
        Scene_Message.prototype.create.call(this);
        this.loadScene();
        this.createSceneWindow();
        this.createWindowLayer();
        this.createAllWindows();
        //this.createMessageWindow();
    };
    
    //CREATING THE SCENE WINDOW
    Scene_Cutscene.prototype.createSceneWindow = function() {
        const rect = this.sceneWindowRect();
        this._sceneWindow = new Window_Cutscene(rect);
        this.addChild(this._sceneWindow);
    };
    Scene_Cutscene.prototype.sceneWindowRect = function() {
        const ww = Graphics.boxWidth;
        const wh = Graphics.boxHeight;
        const wx = 0;
        const wy = 0;
        return new Rectangle(wx, wy, ww, wh);
    };

    //HOW THE SCENE WILL UNFOLD
    //We start by initiating some values
    Scene_Cutscene.prototype.start = function() {
        Scene_Message.prototype.start.call(this);
        this.currentActNumber=0;
        this.currentAct;//=this.full_scene[this.currentActNumber];
        this.loopId;
        this.currentDialogue=0;
        this.currentLoop;//=this.currentAct.loop;
    };
    //This one is looped as long as the scene is active
    Scene_Cutscene.prototype.update = function() {
        Scene_Message.prototype.update.call(this);
        //If we step out of the act_array, we end the scene
        if (this.full_scene.length>this.currentActNumber){
            //If the player has passed a dialogue
            if (!$gameMap._interpreter.updateWaitMode()){
                //If this is the first dialogue, we initiate the act
                if(this.currentDialogue==0){
                    this.currentAct=this.full_scene[this.currentActNumber];
                    this.currentLoop=this.currentAct.loop;
                    //Update Background
                    if (this.currentAct.background!="" && this.currentAct.background!=undefined){
                        this._sceneWindow.updateBackGround(URL_BACKGROUND,this.currentAct.background);
                    }
                    //Update Music
                    if (this.currentAct.music!="" && this.currentAct.music!=undefined){
                        AudioManager.playBgm(MorzanPlugin.getSoundObject(this.currentAct.music));
                    }
                    //Setup Loop
                    clearInterval(this.loopId);
                    this.startLoop();
                    //Add dialogues
                    $gameMessage.add(this.currentAct.dialogues[this.currentDialogue]);
                    $gameMap._interpreter.setWaitMode("message");
                    this.currentDialogue++;
                //If we step out of the dialogue array, we go to the next act
                }else if (this.currentDialogue>=this.currentAct.dialogues.length){
                    this.currentActNumber++;
                    this.currentDialogue=0;
                
                //Else, we throw the next line
                }else{
                    $gameMessage.add(MorzanPlugin.formatTextMessage(this.currentAct.dialogues[this.currentDialogue],this._messageWindow));//._windowLayer
                    $gameMap._interpreter.setWaitMode("message");
                    this.currentDialogue++;
                }
            }
        }else{
            this.popScene();
        }
    };

    //LOOP FUNCTIONS
    //Starts a loop 
    Scene_Cutscene.prototype.startLoop = function(){
        if (this.currentLoop!=undefined){
            var currentSe= this.currentLoop.currentSe();
            this._sceneWindow.updateImg(this.currentLoop.path,this.currentLoop.currentImage());
            if(currentSe!=""){
                AudioManager.playSe(MorzanPlugin.getSoundObject(currentSe));
            }
            this.loopId=setInterval(this.updateLoop, this.currentLoop.delay);
        }
    };
    //Maintain or ends the loop
    Scene_Cutscene.prototype.updateLoop = function(){
        var context = SceneManager._scene;
        if (context.currentLoop!=undefined){
            var currentSe= context.currentLoop.currentSe();

            context.currentLoop.currentframe++;
            if (context.currentLoop.currentframe>=context.currentLoop.images.length){
                if (context.currentLoop.repeat)
                    context.currentLoop.currentframe=0;
                else
                context.currentLoop.currentframe=context.currentLoop.images.length-1;
                
            }
            context._sceneWindow.updateImg(context.currentLoop.path,context.currentLoop.currentImage());//SceneManager._scene
            if(currentSe!=undefined){
                AudioManager.playSe(MorzanPlugin.getSoundObject(currentSe));
            }
            if ((context.currentLoop.currentframe == context.currentLoop.images.length-1) && !context.currentLoop.repeat){
                clearInterval(context.loopId);
            }
        }
    };

    //-----------//
    //The Windows//
    //-----------//
    function Window_Cutscene() {
        this.initialize.apply(this, arguments);
    }
    
    Window_Cutscene.prototype = Object.create(Window_Base.prototype);
    Window_Cutscene.prototype.constructor = Window_Base;
    Window_Cutscene.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
    };
    //No window borders
    Window_Cutscene.prototype.loadWindowskin = function () {
        this.windowskin = new Bitmap();//ImageManager.loadSystem('WindowEmpty');
    };
    //Update the background image
    Window_Cutscene.prototype.updateBackGround = function (url,filename) {
        var buff_bitmap = ImageManager.loadBitmapExtension(url,filename,BACKGROUND_EXT);
        if (this.contentsBack) {
            this.contentsBack.destroy();
        }
        this.contentsBack = new Bitmap(this.innerWidth, this.innerHeight);
        this.contentsBack.blt(buff_bitmap,0,0,buff_bitmap.width,buff_bitmap.height, 0,0,Graphics.boxWidth,Graphics.boxHeight);
    };
    //Update the loop image
    Window_Cutscene.prototype.updateImg = function (url,filename) {
        var buff_bitmap = ImageManager.loadBitmapExtended(url,filename);
        if (this.contents) {
            this.contents.destroy();
        }
        this.contents = new Bitmap(this.innerWidth, this.innerHeight);
        this.contents.blt(buff_bitmap,0,0,buff_bitmap.width,buff_bitmap.height, 0,0,Graphics.boxWidth,Graphics.boxHeight);
    };
    
})();


//---------------------------------------//
// WE RECREATE THE SCENE8_MESSAGE FROM MZ//
//---------------------------------------//
//-----------------------------------------------------------------------------
// Scene_Message
//
// The superclass of Scene_Map and Scene_Battle.

function Scene_Message() {
    this.initialize.call(this);
}

Scene_Message.prototype = Object.create(Scene_Base.prototype);
Scene_Message.prototype.constructor = Scene_Message;

Scene_Message.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_Message.prototype.isMessageWindowClosing = function() {
    return this._messageWindow.isClosing();
};

Scene_Message.prototype.createAllWindows = function() {
    this.createMessageWindow();
    this.createScrollTextWindow();
    this.createGoldWindow();
    this.createNameBoxWindow();
    this.createChoiceListWindow();
    this.createNumberInputWindow();
    this.createEventItemWindow();
    this.associateWindows();
};

Scene_Message.prototype.createMessageWindow = function() {
    const rect = this.messageWindowRect();
    this._messageWindow = new Window_Message(rect);
    this.addWindow(this._messageWindow);
};

Scene_Message.prototype.messageWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Message.prototype.createScrollTextWindow = function() {
    const rect = this.scrollTextWindowRect();
    this._scrollTextWindow = new Window_ScrollText(rect);
    this.addWindow(this._scrollTextWindow);
};

Scene_Message.prototype.scrollTextWindowRect = function() {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Message.prototype.createGoldWindow = function() {
    const rect = this.goldWindowRect();
    this._goldWindow = new Window_Gold(rect);
    this._goldWindow.openness = 0;
    this.addWindow(this._goldWindow);
};

Scene_Message.prototype.goldWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1, true);
    const wx = Graphics.boxWidth - ww;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Message.prototype.createNameBoxWindow = function() {
    this._nameBoxWindow = new Window_NameBox();
    this.addWindow(this._nameBoxWindow);
};

Scene_Message.prototype.createChoiceListWindow = function() {
    this._choiceListWindow = new Window_ChoiceList();
    this.addWindow(this._choiceListWindow);
};

Scene_Message.prototype.createNumberInputWindow = function() {
    this._numberInputWindow = new Window_NumberInput();
    this.addWindow(this._numberInputWindow);
};

Scene_Message.prototype.createEventItemWindow = function() {
    const rect = this.eventItemWindowRect();
    this._eventItemWindow = new Window_EventItem(rect);
    this.addWindow(this._eventItemWindow);
};

Scene_Message.prototype.eventItemWindowRect = function() {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Message.prototype.associateWindows = function() {
    const messageWindow = this._messageWindow;
    messageWindow.setGoldWindow(this._goldWindow);
    messageWindow.setNameBoxWindow(this._nameBoxWindow);
    messageWindow.setChoiceListWindow(this._choiceListWindow);
    messageWindow.setNumberInputWindow(this._numberInputWindow);
    messageWindow.setEventItemWindow(this._eventItemWindow);
    this._nameBoxWindow.setMessageWindow(messageWindow);
    this._choiceListWindow.setMessageWindow(messageWindow);
    this._numberInputWindow.setMessageWindow(messageWindow);
    this._eventItemWindow.setMessageWindow(messageWindow);
};