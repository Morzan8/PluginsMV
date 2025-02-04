//=============================================================================
// rmmv_MorzanBase.js
//=============================================================================

/*:
 * @plugindesc Base Plugin.
 * @author Morzan
 *
 * @help This plugin does not provide plugin commands.
 * 
 * Base Plugin for the others Morzan plugins.
 * Differences noted between RMMV and RMMZ plugins:
 * -Plugin commands and recuperations of variables are different
 * -RMMV doesn't support let (replaced by var)
 * -RMMV doesn't support => functions
 * -RMMV doesn't support ... parameters
 * -RMMV doesn't support arg=valbydefault
 * -RMMV doesn't support the array.includes function
 * -RMMV doesn't support the if ? then : else function
 * -FileExists changes
 */
var MorzanPlugin = MorzanPlugin || {};
(function() {
    const STR_SPLIT_ITEM = "<=>";
    const STR_SPLIT_PARAGRAPH="--separate--";
    
    //-------//
    //TOOLBOX//
    //-------//
    
    //////////////////
    //Misc Functions//
    //////////////////
    //Remove spaces
    MorzanPlugin.noSpace = function(str){
        return str.replace(' ','');
    };

    //Return the standard soundobject with just a name as parameter
    MorzanPlugin.getSoundObject = function(soundname){
        return {name:soundname, volume: 100, pitch: 100, pan: 0, pos: 0};
    };
    
    //##DIFFERENT IN MV##//
    //Return true if value in array
    MorzanPlugin.includes = function(value,array){
        for (var i=0; i<array.length;i++){
            if (array[i]==value)
                return true;
        }
        return false;
    };
    //##DIFFERENT IN MV##//
    
    //get the parameters of a plugin command in the right format
    MorzanPlugin.getValueFromVariable = function(arg){
        if ((typeof arg) =='string'){
            var arrayVar=[];
            switch (arg.substring(0, 3)) {
                case "\\V[":
                    arrayVar = arg.split((/\[|\]/));
                    if ($gameVariables.value(arrayVar[1]) != null)
                        return parseInt($gameVariables.value(arrayVar[1]),10);
                case "\\S[":
                    arrayVar = arg[i].split((/\[|\]/));
                    if ($gameSwitches.value(arrayVar[1]) != null)
                        return parseInt($gameSwitches.value(arrayVar[1]),10);
                default:
                    if (isNaN(arg))
                        return arg;
                    else
                        return parseInt(arg,10);
                return 
            }
        }
        return arg;
    };
    
    //Add \n when needed to split a text
    MorzanPlugin.formatTextMessage = function(str,context){
        var text = str.split(' ').map(function(space) { return space.trim(); });
        var newText = '';
        var lw = 0;
        for(var i = 0; i < text.length; i++) {
            lw += i == 0 ? context.textWidth(text[i]) : context.textWidth(' ' + text[i]);
            if(lw >= context.itemWidth()) {
                newText += i == 0 ? text[i] : '\n' + text[i];
                lw = 0;
            }
            else newText += i == 0 ? text[i] : ' ' + text[i];
        }
        return newText;

    };

    MorzanPlugin.checkParam = function(_value, _type, _res_default){
        var value;
        if (_type =='number'){
            value=parseInt(value,10);
        }else{
            value = _value;
        }
        if (MorzanPlugin.includes(value,[""," ",null,undefined,NaN])){
            return _res_default;
        }else{
            switch (_type){
                case 'url':
                    return MorzanPlugin.formatPath(value);
                case 'ext':
                    return value.charAt(0) == '.' ? value : '.'+value;
                case 'filepath':
                    return value.charAt(0) == '/' ? value : '/'+value;
                default:
                    return value;
            }
        }
    };
    ////////////////////
    //Inputs Functions//
    ////////////////////
    //Check if an item of an array of inputs is repeated
    MorzanPlugin.isRepeated = function(inputs){
        for(var i=0; i<inputs.length; i++){
            if (Input.isRepeated(inputs[i]))
                return true;
        }
    };

    //Check if an item of an array of inputs is repeated
    MorzanPlugin.isTriggered = function(inputs){
        for(var i=0; i<inputs.length; i++){
            if (Input.isTriggered(inputs[i]))
                return true;
        }
    };

    //////////////////////////////////
    //Functions used to handle files//
    //////////////////////////////////
    MorzanPlugin.fs = require("fs");
    //Return the str used to split paragraph
    MorzanPlugin.splitPar = function () {
        return STR_SPLIT_PARAGRAPH;
    };

    //Return the str used to split item in lines
    MorzanPlugin.splitLine = function (path) {
        return STR_SPLIT_ITEM;
    };
    
    //Return the path with / before and after
    MorzanPlugin.formatPath = function (path) {
        var _path  = path;
        if (_path!= undefined){
            while(_path!="" && (_path.charAt(0)=='/' || _path.charAt(0)==' ')){
                _path=_path.slice(1);
            }
            while(_path!="" && _path.charAt(_path.length-1)=='/' || _path.charAt(_path.length-1)==' '){
                _path=_path.slice(0,-1);
            }

            return "/"+_path+"/";
        }
        return _path;
    };

    //Combine several path
    MorzanPlugin.combinePath = function (array_paths) {
        if (array_paths.length ==0){
            return null;
        }else if (array_paths.length == 1){
            return MorzanPlugin.formatPath(array_paths[0]);
        }else{
            var res=MorzanPlugin.formatPath(array_paths[0]);
            for(var i=1; i<array_paths.length;i++){
                res+=MorzanPlugin.formatPath(array_paths[i]).slice(1);
            }
            return res;
        }
    };

    //Return the formatted path of a relative path
    MorzanPlugin.createPath = function (relativePath) {
        //Checks if MV is in dev mode, or production, then decides the appropriate path
        relativePath = (Utils.isNwjs() && Utils.isOptionValid("test")) ? relativePath : "/www/" + relativePath;
        //Creates the path using the location pathname of the window and replacing certain characters
        var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, relativePath);
        if (path.match(/^\/([A-Z]\:)/))
            path = path.slice(1);
        //Decode URI component and finally return the path
        path = decodeURIComponent(path);
        return path;
    };

    //Return a string containing a txt file
    MorzanPlugin.readFile = function (filePath, filename) {
        filePath = this.createPath(filePath);
        if (this.fs.existsSync(filePath + filename)) 
            return this.fs.readFileSync(filePath + filename, "utf8");
        else 
            return null;
    };

    //Check if a file exists and ensure that the path is correct
    MorzanPlugin.fileExist = function (filePath, filename) {
        filePath = this.createPath(filePath);
        return this.fs.existsSync(filePath + filename);
    };

    //Check if a file exists
    MorzanPlugin.fileExist = function (file) {
        return this.fs.existsSync(this.createPath(file));
    };

    //Get all files in the filepath that starts by startsby
    MorzanPlugin.getAllStartBy = function (filePath, startsby) {
        var filePath = this.createPath(filePath);
        var fileList=this.fs.readdirSync(filePath);
        var listRes=[];
        for(var i=0; i<fileList.length;i++){
            if (fileList[i].startsWith(startsby))
                listRes.push(fileList[i]);
        }
        listRes.sort();
        return listRes;
    };

    //Get the first file in the filepath that starts by startsby
    MorzanPlugin.getFirstStartBy = function (filePath, startsby) {
        var filePath = this.createPath(filePath);
        var fileList=this.fs.readdirSync(filePath);
        for(var i=0; i<fileList.length;i++){
            if (fileList[i].startsWith(startsby))
                return fileList[i];
        }
    };

    //Return a line split with the str defined above
    MorzanPlugin.splitLine = function(line){
        var res=line.split(STR_SPLIT_ITEM);
        if (res.length>1)
            return res;
        return null;
    };
    //Return an array of lines split
    MorzanPlugin.splitParagraph = function(paragraph){
        var res=[];
        var array_lines=paragraph.replace(/(?:\\[rn]|[\r\n]+)+/g, "\n").split('\n');
        var line=[];
        for (var i=0; i<array_lines.length;i++){
            if (array_lines[i]!=undefined && array_lines[i]!=null){
                line=MorzanPlugin.splitLine(array_lines[i]);
                if (line!=null)
                    res.push(line);
            }
        }
        if (res == [])
            return null;
        else
            return res;
    };
    //Return the content of the file split in this format
    //res[0](first paragraph)->res[0][0](first paragraph, first line)->res[0][0][0](first paragraph, first line,first word)
    //                                                               ->res[0][0][1](first paragraph, first line,2nd word)
    //                                                               ....
    //                       ->res[0][1](first paragraph, 2nd line)->res[0][1][0](first paragraph, 2nd line,first word)
    //                                                             ->res[0][1][1](first paragraph, 2nd line,2nd word)
    //                                                             ....
    //res[1](2nd paragraph)->res[1][0](2nd paragraph, first line)->res[1][0][0](2nd paragraph, first line,first word)
    //                                                           ->res[1][0][1](2nd paragraph, first line,2nd word)
    //                                                           ....
    //                     ->res[1][1](2nd paragraph, 2nd line)->res[1][1][0](2nd paragraph, 2nd line,first word)
    //                                                         ->res[1][1][1](2nd paragraph, 2nd line,2nd word)
    //                                                         ....
    MorzanPlugin.splitFile = function (filePath, filename) {
        var file = MorzanPlugin.readFile(filePath, filename);
        if (file!=null){
            var res=[];
            var array_paragraphs = file.split(STR_SPLIT_PARAGRAPH);
            var paragraph =[];
            for (var i=0; i<array_paragraphs.length;i++){
                if (array_paragraphs[i]!=undefined && array_paragraphs[i]!=null){
                    paragraph=MorzanPlugin.splitParagraph(array_paragraphs[i]);
                    if (paragraph!=null)
                        res.push(paragraph);
                    }
                }
            return res;
        }else{
            return null;
        }
    };

})();