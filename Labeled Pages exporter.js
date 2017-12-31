/**
 *
 * @name Labeled Pages exporter
 * @desc Recognise page color labels and choose which export to pdf
 * @version 0.0.4
 *
 * @author Smart Mix smartmix.it
 * @link https://smartmix.it
 * 
 * 
 * @see https://forums.adobe.com/thread/2173129
 
 
 */




var nome = "Labeled Pages exporter";
var version = '0.1.1';




//import script language preferences
try {
	var scriptPath = getScriptPath().parent.fsName;
	$.evalFile(scriptPath+'/lang.js');

	var labelsName = textContent['labelsName'];
	var ui = textContent['ui'][lang];
}catch(e){
	alert('can\'t find lang.js script');
	exit();
}




app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;



main();

function main(){
    finestra ();
}


//user inteface
function finestra(){
	 
	if(!app.documents.length){
		alert (ui['noDocumentOpen']);  
		exit(); 
	}else{
		
		var pagesSelection = getPageSelectionObj();
		var myReturn = '';
		
		var w = new Window ("dialog", nome+' '+version);
		
		var selector = w.add('panel',undefined,ui['selectorPanel']);
		selector.orientation = 'row';		
		
		
		var labelList = selector.add ("listbox", undefined, pagesSelection.labels, {multiselect: true});
		labelList.preferredSize = [200,200];
		
        var expPrefs = w.add('panel',undefined,ui['expPrefsPanel']);
		expPrefs.orientation = 'row';	
        var expTypeSelector = expPrefs.add ('dropdownlist',undefined,['PDF','JPG','PNG'])
        expTypeSelector.preferredSize = [200,25];
        expTypeSelector.selection = 0;
        
		var buttongroup = w.add('group');

		var exp = buttongroup.add ("button", undefined, ui['exportButton']);
		var chiudi = buttongroup.add ("button", undefined, ui['closeButton']);
		
		chiudi.onClick = function(){w.close();}
		
		exp.onClick = function(){
            //alert(expTypeSelector.selection);
            
            if(expTypeSelector.selection == null){
                alert('Choose the exportation format');
            }else{
                
                if(labelList.selection == null){
                    alert('Choose at least one label');
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
	}	
}







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
		
		if(labelsName[lang][pColor]!=undefined){
			var coolColorName = labelsName[lang][pColor];
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



function exportPDF(pagine){
	
	var theFolder = Folder.selectDialog(ui['ChooseFolder']);  
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
	
	var theFolder = Folder.selectDialog(ui['ChooseFolder']);  
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
	
	var theFolder = Folder.selectDialog(ui['ChooseFolder']);  
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


function getScriptPath() {
	try { 
    return app.activeScript; 
  } catch(e) { 
    return File(e.fileName); 
  }
}