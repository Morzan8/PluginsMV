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



    //--------------//
    //Const & Params//
    //--------------//

    //Globals
    var Day;
    var Period;

    //-------//
    //TOOLBOX//
    //-------//

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

    //To use in other js
    var readfile = function(filePath, filename){
        MVNodeFS.readFile(filePath, filename);
    };

    //Used to display a modification in values 
    var showStatModification = function (full_message, color) {
        $gameMessage.setPositionType(1);
        $gameMessage.add("\\C[" + color + "]" + full_message + "\\C");
    }

    var updateDayTime = function (day, period) {
        Day=day;
        Period=period;
    }



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
