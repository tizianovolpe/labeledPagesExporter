/**
 *
 * @name Labeled Pages exporter
 * @desc Recognise page color labels and choose which export to pdf, jpeg or png
 * @version 1.1
 *
 * @author Smart Mix smartmix.it
 * @link https://smartmix.it
 * 
 * 
 * @see https://smartmix.it/grafica-design/labeled-pages-exporter-indesign/
 
 
 */




var nome = "Labeled Pages exporter";
var version = '1.2';
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;



//import script language preferences
try {
	var scriptPath = getScriptPath().parent.fsName;
    var settingsFile = scriptPath+'/LabeledPagesExporter-settings.js';
	$.evalFile(settingsFile);
    
    main();
    
}catch(e){
    //cant find LabeledPagesExporter-settings.js or there is an error in file
	alert('Error in importing settings file.\nThe LabeledPagesExporter-settings.js script must be in the same folder of main script.\n\nDownload the lastest version at bit.ly/labelExp');
	exit();
}




//the main window
function main(){
	 
	if(!app.documents.length){
		alert (_e('noDocumentOpen'));  
		exit(); 
	}else{
		
		var pagesSelection = getPageSelectionObj();
		var myReturn = '';
        var openSettings = '';
		
		var w = new Window ("dialog", nome+' '+version);
		
		var selector = w.add('panel',undefined,_e('selectorPanel'));
		selector.orientation = 'row';		
		
		
		var labelList = selector.add ("listbox", undefined, pagesSelection.labels, {multiselect: true});
		labelList.preferredSize = [200,200];
		
        var expPrefs = w.add('panel',undefined,_e('expPrefsPanel'));
		expPrefs.orientation = 'row';	
        var expTypeSelector = expPrefs.add ('dropdownlist',undefined,['PDF','JPG','PNG'])
        expTypeSelector.preferredSize = [200,25];
        expTypeSelector.selection = 0;
        
		var buttongroup = w.add('group');

		var exp = buttongroup.add ("button", undefined, _e('exportButton'));
		var chiudi = buttongroup.add ("button", undefined, _e('closeButton'));
        var settings = buttongroup.add ("button", undefined, _e('Settings'));
		
		chiudi.onClick = function(){w.close();}
        
        settings.onClick = function(){
            w.close();
            openSettings = true;
        }
		
        
		exp.onClick = function(){
            
            var message;
            
            if(expTypeSelector.selection == null){
                message = _e('choose-exp-format');
                alert(message);
            }else{
                
                if(labelList.selection == null){
                    message = _e('choose-one-label');
                    alert(message);
                }else{
                    myReturn = true;
                    w.close();
                }           
            }
		};
		
		w.show ();
		
		if (myReturn == true){
			
			var pagine = [];
            var expType = expTypeSelector.selection.toString();
			
			for(b=0; b< labelList.selection.length; b++){
				pagine.push(pagesSelection[labelList.selection[b]]);
			}
			
            if(expType=='PDF'){
                exportPDF(pagine);
            }else if(expType =='JPG'){
                exportJPG(pagine);
            }else if(expType == 'PNG'){
                exportPNG(pagine);
            }
			
		}
        
        if(openSettings==true){
            settingsWindow();
        }
        
	}	
}


//the settings window: change language
function settingsWindow(){
    
    var translationsCode = [];
    var translationName = [];
    var currentLang = lang["current-lang"];
    var langSelectorCurrent = 0;
    var counter = 0;
    var openMain = '';
    
    //check all available translation and create the dorpdown menu
    for (translation in lang.translations){
        translationsCode.push(translation);
        translationName.push(lang.translations[translation]['name']);
        if(translation==currentLang){
            langSelectorCurrent = counter;
        }
        
        counter++;
    }
    
    var settingsW = new Window ('dialog',_e('Settings'));
    var langSelector = settingsW.add('dropdownlist',undefined,translationName);
    langSelector.selection = langSelectorCurrent;
    
    
    
    
    var buttonGroup = settingsW.add('group',undefined);
    buttonGroup.orientation = 'row';
    
    var save = buttonGroup.add ("button", undefined, _e('save'));
    var close = buttonGroup.add ("button", undefined, _e('closeButton'));

    close.onClick = function(){
        settingsW.close();
        openMain = true;
    }

    save.onClick = function(){
        
        lang["current-lang"]= translationsCode[langSelector.selection.index];
        settingsW.close();
        
        //var filePath = getScriptPath().parent.fsName+'/test.js';
        var newSettings = editSettings(lang["current-lang"],settingsFile);
        
        
        openMain = true;
    }

    settingsW.show();
    
    if(openMain==true){
        main();
    }
    
}


//get the labels assign to the pages and return a javascript object
function getPageSelectionObj(){
	var curDoc = app.documents[0];  
	var allPages = curDoc.pages;
	
	var pagesSelection = {};
    pagesSelection.labels = [];
	//pagesSelection.pages = {};
	var checkLabelExist = false;
	
	
	for(i=0; i<allPages.length; i++){
		var curPage = allPages[i];
		var pColor = curPage.pageColor.toString();
		
		if(_e(pColor)!=undefined){
			var coolColorName = _e(pColor);
		}else{
			var coolColorName = pColor;
		}
		
		var pageNumb = curPage.documentOffset + 1;
		
		
		for (c = 0; c< pagesSelection.labels.length; c++){
			if(pagesSelection.labels[c]==coolColorName){
				checkLabelExist = true;
			}
		}
		
		if(checkLabelExist==false){
			pagesSelection.labels.push(coolColorName);
			pagesSelection[coolColorName]=["+" + pageNumb];
		}else{
			pagesSelection[coolColorName].push("+" + pageNumb);
		}
		checkLabelExist = false;
	}	
	return pagesSelection;	
}





/*

***************************
* EXPORTATION FUNCTIONS
***************************

*/

function exportPDF(pagine){
	
	var theFolder = Folder.selectDialog(_e('ChooseFolder'));  
	if (theFolder == null) {
		exit();  
	}
		
	app.pdfExportPreferences.pageRange = pagine.join(",");
	var curDoc = app.documents[0]; 
	var pdfName = curDoc.name.replace(/.indd$/,".pdf");
	var theFile = File(theFolder + "/" + pdfName);
	
	try {  
		curDoc.exportFile(ExportFormat.PDF_TYPE , theFile , true);
		
	}catch(e) {  
		alert(e);  
	}
	
	app.pdfExportPreferences.pageRange = "";
	
}


function exportPNG(pagine){
	
	var theFolder = Folder.selectDialog(_e('ChooseFolder'));  
	if (theFolder == null) {
		exit();  
	}
    
    app.pngExportPreferences.pngExportRange = PNGExportRangeEnum.EXPORT_RANGE;
    app.pngExportPreferences.pageString =  pagine.join(",");
    
	var curDoc = app.documents[0]; 
	var fileName = curDoc.name.replace(/.indd$/,"");
	
	try {  
		curDoc.exportFile(ExportFormat.PNG_FORMAT , File(theFolder+'/'+fileName+'.png') , true);
		
	}catch(e) {  
		alert(e);  
	}
	app.pngExportPreferences.pngExportRange = PNGExportRangeEnum.EXPORT_ALL;
}


function exportJPG(pagine){
	
	var theFolder = Folder.selectDialog(_e('ChooseFolder'));  
	if (theFolder == null) {
		exit();  
	}
    
    app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
    app.jpegExportPreferences.pageString =  pagine.join(",");
    
	var curDoc = app.documents[0]; 
	var fileName = curDoc.name.replace(/.indd$/,"");
	
	try {  
		curDoc.exportFile(ExportFormat.JPG , File(theFolder+'/'+fileName+'.jpg') , true);
		
	}catch(e) {  
		alert(e);  
	}
	app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_ALL;
}

/*
**********************************
*/


//get the current script folder path
function getScriptPath() {
	try { 
    return app.activeScript; 
  } catch(e) { 
    return File(e.fileName); 
  }
}


//translation fuction, take string name and return string translation in LabeledPagesExporter-settings.js
function _e(stringName){
    
    var currentLang = lang["current-lang"];
    var stringTranslate = lang.translations[currentLang][stringName];
    
    if(stringTranslate==undefined){
        //the string not exist in language selected, switch to english
        var enTranslation = lang.translations.en[stringName];
        
        if(enTranslation==undefined){
            // the string not exist in english, show string name
            return stringName;
        }else{
            return enTranslation;
        }   
        
    }else{
        return stringTranslate;
    }
    
}


function editSettings(lang,filePath){
    
    var settingsR = new File(filePath);
    settingsR.open('r');
    
    var current = '';
    
    while(!settingsR.eof){
        var line = settingsR.readln().toString();
        var changeLang = false;
        
        //search the current lang string and when found it change with preferred lang
        var search = line.search("'current-lang'");      
        if(search>0){
            line="    'current-lang' : '"+lang+"',";
            changeLang = true;
        }    
        
        current += line + '\n';
    }
    
     
    
    
    settingsR.close();
    
    var settingsW = new File(filePath);
    settingsW.open('w');
    settingsW.write(current);
    settingsW.close();

    return changeLang;
    
}
