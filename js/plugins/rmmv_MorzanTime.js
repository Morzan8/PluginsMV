//=============================================================================
// rmmv_MorzanTime.js
//=============================================================================

/*:
 * @plugindesc Time Management.
 * @author Morzan
 *
 * @param VariableDay
 * @desc The NUMBER of the variable in which you store the day.\nPlease, keep the variable content over 0. By default 2;
 * 
 * @param VariablePeriod
 * @desc The NUMBER of the variable in which you store the time period.\nPlease, keep the variable content over 0. By default 3;
 *
 * @param NamesPeriods
 * @desc The names of the periods in your game, separated by a ;, By default, Dawn;Morning;Noon;Afternoon;Evening;Night
 * 
 * @help
 * This plugin helps integrate the notion of time to the other plugins.
 * Please, keep the variables content over 0. I use the value 0 when I compare the days.
 * Ex:If you store the day in the 3rd variable, enter 3 and try to keep the content of the variable 3 over 0.
 * 1 for monday, 2 for tuesday, 3 for wednesday, 4 for thursday, 5 for friday, 6 for saturday, 7 for sunday
 * 
 * Plugin Command:
 *   MTime showDayTime            # Show the day and time on the screen
 *   MTime hideDayTime            # Hide the day and time on the screen
 */

//import "MorzanBase.js";
var MorzanPlugin = MorzanPlugin || {};
(function() {
    const pluginname = 'rmmv_MorzanTime';
    
    //-----------//
    //Init Params//
    //-----------//
    //##DIFFERENT IN MV##//
    var parameters = PluginManager.parameters(pluginname);
    const VARIABLE_DAY = MorzanPlugin.checkParam(parameters['VariableDay'],'number',2);
    const VARIABLE_PERIOD = MorzanPlugin.checkParam(parameters['VariablePeriod'],'number',3);
    const ARRAY_PERIODS = MorzanPlugin.checkParam(parameters['NamesPeriods'].split(";"),'array',["Dawn","Morning","Noon","Afternoon","Evening","Night"]);
    //##DIFFERENT IN MV##//
    const ARRAY_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const ID_PICTURE = 1;
    var show_hud=false;

    //---------------//
    //Plugin Commands//
    //---------------//
    //##DIFFERENT IN MV##//
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MTime') {
            switch (args[0]) {
            case 'showDayTime':
                show_hud=true;
                break;
            case 'hideDayTime':
                show_hud=false;
                if(SceneManager._scene instanceof Scene_Map){
                    $gameScreen.erasePicture(ID_PICTURE);
                }
                break;
            }
        }
    };
    //##DIFFERENT IN MV##//

    //---------//
    //Functions//
    //---------//

    //Return the # of the current day
    MorzanPlugin.getDay = function(){
        return $gameVariables.value(VARIABLE_DAY);
    };
    //Return the # of the current period
    MorzanPlugin.getPeriod = function(){
        return $gameVariables.value(VARIABLE_PERIOD);
    };
    //Return the name of the day
    MorzanPlugin.getNameDay = function(){
        const d = MorzanPlugin.getDay();
        if (d == undefined)
            return "undefined";
        if(d>ARRAY_DAYS.length)
            return "???";
        else
            return ARRAY_DAYS[d-1];
    };
    //Return the name of the time period
    MorzanPlugin.getNamePeriod = function(){
        const p = MorzanPlugin.getPeriod();
        if (p == undefined)
            return "undefined";
        if(p>ARRAY_PERIODS.length)
            return "???";
        else
            return ARRAY_PERIODS[p-1];
    };
    //Checks if the day passed in parameter is today (if an array is passed as parameter, checks if today is in the array)
    MorzanPlugin.isDay = function(d){
        if (Array.isArray(d)){
            for(var i=0; i<d.length;i++){
                if (MorzanPlugin.isDay(d[i])){
                    return true;
                }
            }
        }else{
            if ((typeof d) == 'string'){
                d=MorzanPlugin.noSpace(d);
                if (d=="0"){
                    return true;
                }else{
                    return (d == MorzanPlugin.getDay().toString());
                }
            }else if ((typeof d) == 'number'){
                if (d==0){
                    return true;
                }else{
                    return (d == MorzanPlugin.getDay());
                }
            }
        }
        return false;
    };
    //Checks if the time period passed in parameter is now (if an array is passed as parameter, checks if now is in the array)
    MorzanPlugin.isPeriod = function(p){
        if (Array.isArray(p)){
            for(var i=0; i<p.length;i++){
                if (MorzanPlugin.isPeriod(p[i])){
                    return true;
                }
            }
        }else{
            if ((typeof p) == 'string'){
                p=MorzanPlugin.noSpace(p);
                if (p=="0" || p=="0 "){
                    return true;
                }else{
                    return (p == MorzanPlugin.getPeriod().toString() || p == MorzanPlugin.getPeriod().toString()+" ");
                }
            }else if ((typeof p) == 'number'){
                if (p==0){
                    return true;
                }else{
                    return (p == MorzanPlugin.getPeriod());
                }
            }
        }
        return false;
    };
    
    //--------//
    //Time HUD//
    //--------//
    //Displays an the day and time on the map
    //For this, I use the plugin TextPicture.js by Yoji Ojima, available as default plugin with RPGMMZ
    const game_screen_update = Game_Screen.prototype.update;
    Game_Screen.prototype.update = function() {
        game_screen_update.call(this);
        if(SceneManager._scene instanceof Scene_Map && show_hud){
            var param={text:MorzanPlugin.getNameDay()+"\n"+MorzanPlugin.getNamePeriod()};
            PluginManager.callCommand(this, "TextPicture","set",param);
            $gameScreen.showPicture(ID_PICTURE,"", 0, 0, 0, 100, 100, 255, 0)
        }
    };
})();