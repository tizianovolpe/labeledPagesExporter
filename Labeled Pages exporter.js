/**
 *
 * @name Labelled Pages exporter
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
var version = '0.0.5';




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
		
		var buttongroup = w.add('group');

		var exp = buttongroup.add ("button", undefined, ui['exportButton']);
		var chiudi = buttongroup.add ("button", undefined, ui['closeButton']);
		
		chiudi.onClick = function(){w.close();}
		
		exp.onClick = function(){
			w.close();
			myReturn = true;
		};
		
		w.show ();
		
		if (myReturn == true){
			
			var pagine = [];
			
			for(b=0; b< labelList.selection.length; b++){
				pagine.push(pagesSelection[labelList.selection[b]]);
			}
			
			exportPDF(pagine);
			
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


function getScriptPath() {
	try { 
    return app.activeScript; 
  } catch(e) { 
    return File(e.fileName); 
  }
}