/**Copy right @ SSI 2012
 * [v1.0-Wenlong] created basic functions to start with the flash tools
 * [v1.1-Ling] changed function name assignNumericValue into assignValueToNumeric to be consistent with Dub
 * [v1.2-Wenlong] created the functions for items popup and also assign the answers to IP
 * [v1.3-Ling] created the functions for 3Dgrid question
 * [v1.4-Wenlong] updated functions: replaceChar() and goToNextPage()
   [v1.4-Ling] Create function to get form name
   [v1.5-Ling] adde function assignValueToMIP and function assignValueToText
   [v1.5-Ling] add function assignValueToOpen
   [v1.6-Ling] add an 3rd array for each question to get item status
   [v1.7-Ling] Add console log hack
   [v1.8-Ling] handle other specify in open text list
   [v2.2-Ling] major fix retrieve data when answer button turned on  
   
 */
 
 // Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

 
 /* get form name from fieldset id ********/
 
 function getFormName(formindex){
    // formindex starts from 1
	var theFormID=document.getElementsByTagName("fieldset")[formindex-1].getAttribute("id");
	var theFormName=theFormID.slice(9);// fieldset_ are sliced
	return theFormName;
	} 
 
/*
** get items in the items popup table
*/

function getItemsPopupItems(theFormName) {
	// loop through all a-name tags on page to find item codes and positions
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var theTable = theFieldset.getElementsByTagName("table")[0];
	var oItems = new Array(new Array(), new Array(), new Array(), new Array());
	for (var i=1;i<theTable.rows.length;i++) {
		var theRow=theTable.rows[i];
		var oLabels=theRow.cells[0].getElementsByTagName('label');
		if(oLabels.length>0){
			oItems[1][oItems[1].length] = String(oLabels[0].innerHTML).trim();
		}
		else{
			if(theRow.cells.length>1){// exclude header
				oItems[1][oItems[1].length] = String(theTable.rows[i].cells[0].innerHTML).trim();
			}
		}
		if(theRow.cells.length>1){// exclude header
			for (var j=1;j<theRow.cells.length;j++) {
				var oInput = theRow.cells[j].getElementsByTagName('input')[0];
				if (oInput.type=="radio") {
					var thisID = oInput.getAttribute('id');
					if(thisID){
						if (thisID.indexOf(theFormName+"_") > -1) {
							var arryItemID = String(thisID).split("_");
							if(j==1){
								oItems[0][oItems[0].length] = arryItemID[arryItemID.length-2];
							}							
							if(oInput.checked){
								oItems[2][oItems[2].length] = arryItemID[arryItemID.length-1];
								break;
							}							
						}
					}
				}
			}			
		}
		var theOtherInput=theRow.cells[0].getElementsByTagName('input');
		if (theOtherInput.length>0&&theOtherInput[0].type=="text") {
			var theOEValue=document.getElementById(theFormName+'_'+oItems[0][oItems[0].length-1]+'_other').value;
			oItems[3][oItems[0].length-1]=theOEValue?theOEValue:"";
		}
		else{
			if(theRow.cells.length>1){// exclude header
				oItems[3][oItems[0].length-1]='';
			}
		}
    }
	return oItems;
}
/*
** get items in the multi items popup table
*/
function getMultipleItemsPopupItems(theFormName) {
	// loop through all a-name tags on page to find item codes and positions
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var theTable = theFieldset.getElementsByTagName("table")[0];
	var oItems = new Array(new Array(), new Array(), new Array());
	for (var i=1;i<theTable.rows.length;i++) {
		oItems[1][oItems[1].length] = String(theTable.rows[i].cells[0].innerHTML).trim();
		var theRow=theTable.rows[i];
		oItems[2][i-1]=[];
		for (var j=1;j<theRow.cells.length;j++) {
			var oInput = theRow.cells[j].getElementsByTagName('input')[0];
			if (oInput.type=="checkbox"||oInput.type=="radio") {
				var thisID = oInput.getAttribute('id');
				if ((thisID !="")&&(thisID!=null)) {
					if (thisID.indexOf(theFormName+"_") > -1) {
						var arryItemID = String(thisID).split("_");
						if(oInput.checked){
							oItems[2][i-1].push(arryItemID[arryItemID.length-1]);
						}
						if(j==1){
							oItems[0][oItems[0].length] = arryItemID[arryItemID.length-2];
						}
					}
				}
			}
		}
   }

	return oItems;
}
/*
** get labels in the items popup table
*/
function getItemsPopupLabels(theFormName) {
	//loop through the first row of radios/checkboxes to get label codes
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var theTable=theFieldset.getElementsByTagName("table")[0];
	var oInputs;
	for (var i=1;i<theTable.rows.length;i++) {
		oInputs = theTable.rows[i].getElementsByTagName('input');
		if(oInputs.length>0){
			break;
		}
	}
	var oLabels = new Array(new Array(), new Array());
	for (var i=0;i<oInputs.length;i++) {
		if (oInputs[i].type=="radio") {
			var thisID = oInputs[i].getAttribute('id');
			if ((thisID !="")&&(thisID!=null)) {
				if (thisID.indexOf(theFormName+"_") > -1) {
					var arryLabelID = String(thisID).split("_");
					oLabels[0][oLabels[0].length] = arryLabelID[arryLabelID.length-1];
				}
			}
		}
	}

	//loop through all spans on the first row to get label names
	var theRow = theFieldset.getElementsByTagName("table")[0].rows[0];
	for (var i=1;i<theRow.cells.length;i++) {
 		oLabels[1][oLabels[1].length] = String(theRow.cells[i].innerHTML).trim();
	}
	return oLabels;
}
/*
** get labels in the items popup table
*/
function getMultipleItemsPopupLabels(theFormName) {
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var oInputs = theFieldset.getElementsByTagName("table")[0].rows[1].getElementsByTagName('input');
	var oLabels = new Array(new Array(), new Array(), new Array());
	for (var i=0;i<oInputs.length;i++) {
		if (oInputs[i].type=="checkbox"||oInputs[i].type=="radio") {
			var thisID = oInputs[i].getAttribute('id');
			if ((thisID !="")&&(thisID!=null)) {
				if (thisID.indexOf(theFormName+"_") > -1) {
					var arryLabelID = String(thisID).split("_");
					oLabels[0][oLabels[0].length] = arryLabelID[arryLabelID.length-1];
				}
			}
		}
	}

	//loop through all spans on the first row to get label names
	var theRow = theFieldset.getElementsByTagName("table")[0].rows[0];
	for (var i=1;i<theRow.cells.length;i++) {
		var oOEInput=theRow.cells[i].getElementsByTagName('input');
		if(oOEInput.length>0){
			var theScaleLabel=theRow.cells[i].getElementsByTagName('label');
			oLabels[1][oLabels[1].length] = String(theScaleLabel[0].innerHTML).trim();
			oLabels[2][oLabels[2].length] = oOEInput[0].value;
		}
		else{
			oLabels[1][oLabels[1].length] = String(theRow.cells[i].innerHTML).trim();
			oLabels[2][oLabels[2].length] = '';
		}
	}
	return oLabels;
}

/*
** get items in the multiple response table without "capture order"
*/
function getMRItems(theFormName) {
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var oTables=theFieldset.getElementsByTagName('table');
	var oItems = new Array(new Array(), new Array(), new Array(),new Array());
	var m=0;
	for (var i=0;i<oTables.length;i++) {
	    // if(oTables[i].className=="confirmit-table"){
		if(oTables[i].className.toLowerCase().indexOf("confirmit-table")>-1){	
				for (var r = 1, row=oTables[i].rows.length; r<row; r++) {
					   var theInput=oTables[i].rows[r].cells[0].getElementsByTagName('input');
					   if (theInput.length>0&&(theInput[0].type=="checkbox"||theInput[0].type=="radio")) {
                            var thisID = theInput[0].getAttribute('id');
							if ((thisID !="")&&(thisID!=null)) {
								if (thisID.indexOf(theFormName+"_") > -1) {
									var arryItemID = String(thisID).split("_");
									oItems[0][m] = arryItemID[arryItemID.length-1];
								}
							}
								oItems[2][m]=0;
							if(theInput[0].checked){
								oItems[2][m]=1;
							}
							
					   }
					 if(oTables[i].rows[r].cells.length>1){  
					// var oLabels=oTables[i].rows[r].cells[1].getElementsByTagName('label');
					 var oLabels=oTables[i].rows[r].getElementsByTagName('label');
					 oItems[3][m]='';
					 if(oLabels.length>0){// this make sure the th row is not counted in
						if(oLabels.length>1){ // other specify row
								for (var l=0;l<oLabels.length;l++) {
									var thisID = oLabels[l].getAttribute('id');
									if ((thisID !="")&&(thisID!=null)) {
										if (thisID.indexOf(theFormName+"_") > -1) {
											if (thisID.indexOf("_other_label")> -1) {
												if(oItems[2][m]>0){
													oItems[3][m]=document.getElementById(theFormName+'_'+oItems[0][m]+'_other').value;
												}
											}
											else{
												oItems[1][m]=oLabels[l].innerHTML;
											}
										
										}
									}
								}
						}
						else{
									oItems[1][m]=oLabels[0].innerHTML;
						}
					 }
					m=oItems[0].length;
					}
				}
		 
		 }

	}
	return oItems;
}

/*
** get items in the single response table without "capture order", also handles multi column
*/
function getSRItems(theFormName) {
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var oTables=theFieldset.getElementsByTagName('table');
	var oItems = new Array(new Array(), new Array(), new Array(),new Array());
	var m=0;
	for (var i=0;i<oTables.length;i++) {
	     if(oTables[i].className.toLowerCase().indexOf("confirmit-table")>-1){
				for (var r = 1, row=oTables[i].rows.length; r<row; r++) {
					   var theInput=oTables[i].rows[r].cells[0].getElementsByTagName('input');
					   if (theInput.length>0&&theInput[0].type=="radio") {
                            var thisID = theInput[0].getAttribute('id');
							if ((thisID !="")&&(thisID!=null)) {
								if (thisID.indexOf(theFormName+"_") > -1) {
									var arryItemID = String(thisID).split("_");
									oItems[0][m] = arryItemID[arryItemID.length-1];
								}
							}
								oItems[2][m]=0;
							if(theInput[0].checked){
								oItems[2][m]=1;
							}
							
					   }
					if(oTables[i].rows[r].cells.length>1){    
					// var oLabels=oTables[i].rows[r].cells[1].getElementsByTagName('label');
					  var oLabels=oTables[i].rows[r].getElementsByTagName('label');
					 oItems[3][m]='';
					 //console.log(oLabels.length)
					 if(oLabels.length>0){// this make sure the th row is not counted in
						if(oLabels.length>1){ // other specify row
								for (var l=0;l<oLabels.length;l++) {
									var thisID = oLabels[l].getAttribute('id');
									if ((thisID !="")&&(thisID!=null)) {
										if (thisID.indexOf(theFormName+"_") > -1) {
											if (thisID.indexOf("_other_label")> -1) {
												if(oItems[2][m]>0){
													oItems[3][m]=document.getElementById(theFormName+'_'+oItems[0][m]+'_other').value;
												}
											}
											else{
												oItems[1][m]=oLabels[l].innerHTML;
											}
										
										}
									}
								}
						}
						else{
									oItems[1][m]=oLabels[0].innerHTML;
						}
					 }
					m=oItems[0].length;
					}
				}
		 
		 }

	}
	return oItems;
}

/*
** get items in the numeric list
*/
function getNumericItems(theFormName) {
    // loop through all the textboxes
    var theFieldset = document.getElementById("fieldset_" + theFormName);
    var oTables=theFieldset.getElementsByTagName('table');
    var oItems = new Array(new Array(), new Array(), new Array(),new Array());
	for (var i=0;i<oTables.length;i++) {
		if(oTables[i].className.toLowerCase().indexOf("confirmit-table")>-1){			
			for (var r = 1, row=oTables[i].rows.length; r<row; r++) {
				if(oTables[i].rows[r].cells.length>1){
					var theInput=oTables[i].rows[r].cells[1].getElementsByTagName('input');
					var theOtherInput=oTables[i].rows[r].cells[0].getElementsByTagName('input');
					if (theInput[0].type=="text"||theInput[0].type=="number") {
						var thisID = theInput[0].getAttribute('id');
						if(thisID){
							if (thisID.indexOf(theFormName+"_") > -1) {
								var arryItemID = String(thisID).split("_");
								oItems[0][oItems[0].length] = arryItemID[arryItemID.length-1];
							}					
						}
						if(theInput[0].value&&theInput[0].value.length>0){
							oItems[2][oItems[2].length]=theInput[0].value;
						}
						else{
							oItems[2][oItems[2].length]='';
						}
					}	
					if(theOtherInput.length>0){
						oItems[3][oItems[3].length]=document.getElementById(theFormName+'_'+oItems[0][oItems[3].length]+'_other').value;
					}
					else{
						oItems[3][oItems[3].length]='';
					}
				}
			}
		}			
	}	
	// loop through all the label tag to get list item texts and label names
    var oLabels = theFieldset.getElementsByTagName('label');
    for (var i=0;i<oLabels.length;i++) {
        //var thisItem = oLabels.item(i);
        var thisID = oLabels[i].getAttribute('id');
        if ((thisID !="")&&(thisID!=null)&&oLabels[i].className!="confirmit-offscreen") {
            if (thisID.indexOf(theFormName+"_") > -1) {
                    oItems[1][oItems[1].length] = oLabels[i].innerHTML;
            }
        }
    }
    return oItems;
} 


/*
** get text value of the open text question
*/

function getNumericValue(theFormName){
	var theItem = document.getElementById(theFormName);
	var theValue='';
	if(theItem.value&&theItem.value!=''&&theItem.value!=null){
		theValue=theItem.value;
	}
	return theValue;
}

/*
** get a item text value of the numeric list question
   [v1.9-Ling]
*/
function getNumericListValue(theFormName,theItemCode){
	var theValue;
	if(theItemCode == "-1"){
		var theItem = document.getElementById(theFormName);
		theValue=theItem.value;
	}
	else{
		var theItem = document.getElementById(theFormName+"_"+theItemCode);
		theValue=theItem.value;	
	}
	return theValue;
}


/*
** get items in the open text list
*/
function getOpenTextListItems(theFormName) {
    // loop through all the textboxes
    var theFieldset = document.getElementById("fieldset_" + theFormName);
    var oTables=theFieldset.getElementsByTagName('table');
    var oItems = new Array(new Array(), new Array(), new Array(),new Array());
	for (var i=0;i<oTables.length;i++) {
		if(oTables[i].className.toLowerCase().indexOf("confirmit-table")>-1){			
			for (var r = 1, row=oTables[i].rows.length; r<row; r++) {
				if(oTables[i].rows[r].cells.length>1){
					var theInput=oTables[i].rows[r].cells[1].getElementsByTagName('input');
					var theOtherInput=oTables[i].rows[r].cells[0].getElementsByTagName('input');
					if (theInput[0].type=="text") {
						var thisID = theInput[0].getAttribute('id');
						if(thisID){
							if (thisID.indexOf(theFormName+"_") > -1) {
								var arryItemID = String(thisID).split("_");
								oItems[0][oItems[0].length] = arryItemID[arryItemID.length-1];
							}					
						}
						if(theInput[0].value&&theInput[0].value.length>0){
							oItems[2][oItems[2].length]=theInput[0].value;
						}
						else{
							oItems[2][oItems[2].length]='';
						}
					}	
					if(theOtherInput.length>0){
						oItems[3][oItems[3].length]=document.getElementById(theFormName+'_'+oItems[0][oItems[3].length]+'_other').value;
					}
					else{
						oItems[3][oItems[3].length]='';
					}
				}
			}	
		}			
	}	
	// loop through all the label tag to get list item texts and label names
    var oLabels = theFieldset.getElementsByTagName('label');
    for (var i=0;i<oLabels.length;i++) {
        //var thisItem = oLabels.item(i);
        var thisID = oLabels[i].getAttribute('id');
        if ((thisID !="")&&(thisID!=null)&&oLabels[i].className!="confirmit-offscreen") {
            if (thisID.indexOf(theFormName+"_") > -1) {
                    oItems[1][oItems[1].length] = oLabels[i].innerHTML;
            }
        }
    }
    return oItems;
} 

/*
** get text value of the open text question
*/

function getOpenTextValue(theFormName){
	var theItem = document.getElementById(theFormName);
	var theValue='';
	if(theItem.value&&theItem.value!=''&&theItem.value!=null){
		theValue=theItem.value;
	}
	return theValue;
}

/*
** get a item text value of the open text list question
   [v1.9-Ling]
*/
function getOpenTextListValue(theFormName,theItemCode){
	var theValue='';
	if(theItemCode == "-1"){
		var theItem = document.getElementById(theFormName);
		theValue=theItem.value;
	}
	else{
		var theItem = document.getElementById(theFormName+"_"+theItemCode);
		theValue=theItem.value;	
	}
	return theValue;
}


/*
** get Labels in the 3D grid with SR and MR inside only
**[v1.3-Ling] function added 
*/

function get3DGridLabels(theFormName) {
	// loop through all a-name tags on page to find item codes and positions
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var theTable = theFieldset.getElementsByTagName("table")[0];
	var oItems = new Array(new Array(), new Array());
	for (var i=1;i<theTable.rows.length;i++) {
		oItems[1][oItems[1].length] = String(theTable.rows[i].cells[0].innerHTML).trim();
		var oInput = theTable.rows[i].cells[1].getElementsByTagName('input')[0];
		var thisID = oInput.getAttribute('id');
			if ((thisID !="")&&(thisID!=null)) {
					var arryItemID = String(thisID).split("_");
					oItems[0][oItems[0].length] = arryItemID[arryItemID.length-1];
			}
	}
	return oItems;
}

/*
** get item in the 3D grid with SR and MR inside only
**[v1.3-Ling] function added 
*/
function get3DGridItems(theFormName) {
	//loop through the first row of radios/checkboxes to get label codes
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var oInputs = theFieldset.getElementsByTagName("table")[0].rows[1].getElementsByTagName('input');
	var oLabels = new Array(new Array(), new Array());
	for (var i=0;i<oInputs.length;i++) {
			var thisID = oInputs[i].getAttribute('id');
			if ((thisID !="")&&(thisID!=null)) {
					var arryLabelID = String(thisID).split("_");
					oLabels[0][oLabels[0].length] = arryLabelID[0];
			}
	}

	//loop through all spans on the first row to get label names
	var theRow = theFieldset.getElementsByTagName("table")[0].rows[0];
	for (var i=1;i<theRow.cells.length;i++) {
 		oLabels[1][oLabels[1].length] = String(theRow.cells[i].innerHTML).trim();
	}
	return oLabels;
}


/*
** remove the white space both at the left side and at the right side
*/
String.prototype.trim = function() { 
	return this.replace(/^\s+|\s+$/g, ''); 
}

/*
** replace special characters
*/
String.prototype.replaceChar= function() {
	var sStr1 = /&/g;
	var sStr2 = /%/g;
	var sStr3 = /\+/g;
	var sStr4 = /"/g;
	var sText = this.replace(sStr1, "^");
	sText = String(sText).replace(sStr2, "%25");
	sText = String(sText).replace(sStr3, "%2B");
	sText = String(sText).replace(sStr4, "''");
	//add more later on here
	return sText;
}

String.prototype.replaceCharJS = function() {
	var sStr1 = /'/g;
	var sStr2 = /\+/g;
	var sStr3 = /"/g;
	var sText = this.replace(sStr1, "\'");
	sText = String(sText).replace(sStr2, "\+");
	sText = String(sText).replace(sStr3, "\"");
	//add more later on here
	return sText;
}
/*
** toggle the checkbox for MR without "capture order"
*/
function toggleCheckbox(theFormName, theItemCode, sStatus){
	var theItem = document.getElementById(theFormName+"_"+theItemCode);
	theItem.checked = sStatus;
}
/*
** assign the value to the multiple response question
*/
function assignValueToMR(theFormName, theItemCode, status){
	if((status == "true") || (status == true)){
		document.getElementById(theFormName+"_"+theItemCode).checked = true;
	}
	else{
		document.getElementById(theFormName+"_"+theItemCode).checked = false;
	}
}

function assignValueToMROther(theFormName, theItemCode,theValue){
    var theItem = document.getElementById(theFormName+"_"+theItemCode+'_other');
	theItem.value = theValue;	  
}

/*
** assign the value to the single response question
*/
function assignValueToSR(theFormName, theItemCode, status){
	if((status == "true") || (status == true)){
		document.getElementById(theFormName+"_"+theItemCode).checked = true;
	}
	else{
		document.getElementById(theFormName+"_"+theItemCode).checked = false;
	}
}

function assignValueToSROther(theFormName, theItemCode,theValue){
    var theItem = document.getElementById(theFormName+"_"+theItemCode+'_other');
	theItem.value = theValue;	  
}

/*
** assign the value to the items popup question
*/
function assignValueToIP(theFormName,theItemCode,theAnswerCode,status){
	if((status == "true") || (status == true)){
		document.getElementById(theFormName+"_"+theItemCode+"_"+theAnswerCode).checked = true;
	}
	else{
		document.getElementById(theFormName+"_"+theItemCode+"_"+theAnswerCode).checked = false;
	}
}

/*
** assign the value to miltigrid questions
*/
function assignValueToMIP(theFormName,theItemCode,theAnswerCode,status){
	if((status == "true") || (status == true)){
		document.getElementById(theFormName+"_"+theItemCode+"_"+theAnswerCode).checked = true;
	}
	else{
		document.getElementById(theFormName+"_"+theItemCode+"_"+theAnswerCode).checked = false;
	}
}

/*
** assign the value to the open numeric text list
**[v1.1-Ling] change function name assignNumericValue into assignValueToNumeric to be consistent with Dub
*/
function assignValueToNumeric(theFormName, theItemCode, theValue){
	if(theItemCode == "-1"){
		var theItem = document.getElementById(theFormName);
		theItem.value = theValue;
	}
	else{
		var theItem = document.getElementById(theFormName+"_"+theItemCode);
		theItem.value = theValue;	
	}
}

/*
** assign the value to the open text list
**[v1.5-Ling] add function assignValueToText
***/
function assignValueToText(theFormName, theItemCode, theValue){
	if(theItemCode == "-1"){
		var theItem = document.getElementById(theFormName);
		theItem.value = theValue;
	}
	else{
		var theItem = document.getElementById(theFormName+"_"+theItemCode);
		theItem.value = theValue;	
	}
}

/*
** assign the value to the open answer question
**[v1.5-Ling] add function assignValueToOpen
***/
function assignValueToOpen(theFormName,theValue){
		var theItem = document.getElementById(theFormName);
		theItem.value = theValue;	
}

/*
** assign the value to 3Dgrid
**[v1.3-Ling] function added 
*/
function assignValueTo3DGrid(theFormName,theItemCode,theAnswerCode,status){
	if((status == "true") || (status == true)){
		document.getElementById(theItemCode+"_"+theAnswerCode).checked = true;
	}
	else{
		document.getElementById(theItemCode+"_"+theAnswerCode).checked = false;
	}
}


/*
** toggleNextButton(theMethod, status)
** toggle next button
** method 1: visibility
** method 2: display
*/
function toggleNextButton(theMethod, status){
	if((status == "true") || (status == true)){
		if(theMethod == 1){
			document.getElementById("forwardbutton").style.visibility = "visible";
		}
		else{
			document.getElementById("forwardbutton").style.display = "inline";
		}
	}
	else{
		if(theMethod == 1){
			document.getElementById("forwardbutton").style.visibility = "hidden";
		}
		else{
			document.getElementById("forwardbutton").style.display = "none";
		}
	}
}

/*
** submit the value and go to next page
*/
function goToNextPage(){
	//document.ctlform.submit();
	document.getElementById("ctlform").submit();
}

/*
** getting items for groups
*/

function getDataItemCode(theInput,qType,theFormName){
	var theItemCode,theValue;
	switch (qType.toUpperCase()) {
		case "SR":
		case "MR":
			theValue=0;
			var thisID = theInput[0].getAttribute('id');
			if (thisID&&(thisID !="")) {
				if (thisID.indexOf(theFormName+"_") > -1) {
				var arryItemID = String(thisID).split("_");
				theItemCode = arryItemID[arryItemID.length-1];
				}
			}	
			if(theInput[0].checked){
				theValue=1;
			}			
		break;
		case "NUM":
		case "OTL":
			theValue='';
			var thisID = theInput[0].getAttribute('id');
			if (thisID&&(thisID !="")) {
				if (thisID.indexOf(theFormName+"_") > -1) {
				var arryItemID = String(thisID).split("_");
				theItemCode = arryItemID[arryItemID.length-1];
				}
			}	
			if(theInput[0].value&&theInput[0].value.length>0){
				theValue=theInput[0].value;
			}			
		break;
		case "IP":
			theValue=[];
			for (var i=0;i<theInput.length;i++) {
				if (theInput[i].type=="radio") {
					var theValueIndex=theValue.length;
					theValue[theValueIndex]=0;
					var thisID = theInput[i].getAttribute('id');
					if (thisID&&(thisID !="")) {
						if (thisID.indexOf(theFormName+"_") > -1) {
							var arryItemID = String(thisID).split("_");
							if(!theItemCode){
								theItemCode=arryItemID[arryItemID.length-2];
							}
							if(theInput[i].checked){
								theValue[theValueIndex]=1;
							}							
						}
					}
				}
			}
		break;
	}
	return {
		"code"	:theItemCode,
		"value"	:theValue
	};
}


function getDataItemLabels(oLabels,qType,theFormName,itemCode){
	var theLabel='',isOE=false,sOEValue='';
	switch (qType.toUpperCase()) {
		case "SR":
		case "MR":
		case "NUM":
		case "OTL":		
			if(oLabels.length>1){ // other specify row
				for (var l=0;l<oLabels.length;l++) {
					var thisID = oLabels[l].getAttribute('id');
					if (thisID&&(thisID !="")) {
						if (thisID.indexOf(theFormName+"_") > -1) {
							if (thisID.indexOf("_other_label")> -1) {
								isOE=true;
								var theOEValue=document.getElementById(theFormName+'_'+itemCode+'_other').value;
								if(theOEValue&&theOEValue.length>0){
									sOEValue=theOEValue;
								}
							}
							else{
								theLabel=oLabels[l].innerHTML;
							}
						}						
					}
				}
			}
			else{
				theLabel=oLabels[0].innerHTML;
			}
		break;
		case "IP":
			var otherLabel=oLabels.getElementsByTagName('label');
			if(otherLabel.length>0){
				isOE=true;
				theLabel= String(otherLabel[0].innerHTML).trim();
				var theOEValue=document.getElementById(theFormName+'_'+itemCode+'_other').value;
				if(theOEValue&&theOEValue.length>0){
					sOEValue=theOEValue;
				}				
			}
			else{
				theLabel = String(oLabels.innerHTML).trim();
			}			
		break;
	}
	return {
		"label"		:theLabel,
		"isOE"		:isOE,
		"sOEValue"	:sOEValue		
	};	
}

function getItemsInGroups(theFormName,qType){
	var oItemGroups=[];
	switch (qType.toUpperCase()) {
		case "SR":
		case "MR":
			oItemGroups=getSMRItemsGroups(theFormName,qType);
		break;
		case "NUM":
		case "OTL":
			oItemGroups=getTextListItemsGroups(theFormName,qType);
		break;
		case "IP":
			oItemGroups=getGridItemsGroups(theFormName,qType);
		break;
	}
	return oItemGroups;
}

function getSMRItemsGroups(theFormName,qType) {
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var oTables=theFieldset.getElementsByTagName('table');
	var oItems = [],grpIndex=-1;
	for (var i=0;i<oTables.length;i++) {
	    if($(oTables[i]).hasClass("confirmit-table")){
			for (var r = 1, row=oTables[i].rows.length; r<row; r++) {
				if(oTables[i].rows[r].cells[0].className=="group-header-label"){
					grpIndex++;
					oItems[grpIndex]={
						"title":oTables[i].rows[r].cells[0].innerHTML,
						"items":[]
					}
				}
				else {
					if(!$(oTables[i].rows[r].cells[1]).hasClass("group-answerlabel")){
						grpIndex++;
						oItems[grpIndex]={
							"title":"",
							"items":[]
						}						
					}
					var theItemGrpIndex=oItems[grpIndex]["items"].length;
					var theInput=oTables[i].rows[r].cells[0].getElementsByTagName('input');
					var oLabels=oTables[i].rows[r].cells[1].getElementsByTagName('label');
					oItems[grpIndex]["items"][theItemGrpIndex]={
						"code"		:getDataItemCode(theInput,qType,theFormName).code,
						"value"		:getDataItemCode(theInput,qType,theFormName).value	
					}
					var labelRowData=getDataItemLabels(oLabels,qType,theFormName,oItems[grpIndex]["items"][theItemGrpIndex]["code"]);
					oItems[grpIndex]["items"][theItemGrpIndex]["label"]=labelRowData.label;
					oItems[grpIndex]["items"][theItemGrpIndex]["isOE"]=labelRowData.isOE;
					oItems[grpIndex]["items"][theItemGrpIndex]["sOEValue"]=labelRowData.sOEValue;
				}
					
	        }
		}
    }
	
	return oItems;
}

function getTextListItemsGroups(theFormName,qType) {
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var oTables=theFieldset.getElementsByTagName('table');
	var oItems = [],grpIndex=-1;
	for (var i=0;i<oTables.length;i++) {
	    if($(oTables[i]).hasClass("confirmit-table")){
			for (var r = 1, row=oTables[i].rows.length; r<row; r++) {
				if(oTables[i].rows[r].cells[0].className=="group-header-label"){
					grpIndex++;
					oItems[grpIndex]={
						"title":oTables[i].rows[r].cells[0].innerHTML,
						"items":[]
					}
				}
				else {
					if(!$(oTables[i].rows[r].cells[0]).hasClass("group-answerlabel")){
						grpIndex++;
						oItems[grpIndex]={
							"title":"",
							"items":[]
						}						
					}
					var theItemGrpIndex=oItems[grpIndex]["items"].length;
					var theInput=oTables[i].rows[r].cells[1].getElementsByTagName('input');
					var oLabels=oTables[i].rows[r].cells[0].getElementsByTagName('label');
					oItems[grpIndex]["items"][theItemGrpIndex]={
						"code"		:getDataItemCode(theInput,qType,theFormName).code,
						"value"		:getDataItemCode(theInput,qType,theFormName).value	
					}
					var labelRowData=getDataItemLabels(oLabels,qType,theFormName,oItems[grpIndex]["items"][theItemGrpIndex]["code"]);
					oItems[grpIndex]["items"][theItemGrpIndex]["label"]=labelRowData.label;
					oItems[grpIndex]["items"][theItemGrpIndex]["isOE"]=labelRowData.isOE;
					oItems[grpIndex]["items"][theItemGrpIndex]["sOEValue"]=labelRowData.sOEValue;
				}
					
	        }
		}
    }
	
	return oItems;
}

function getGridItemsGroups(theFormName,qType) {
	var theFieldset = document.getElementById("fieldset_" + theFormName);
	var oTables=theFieldset.getElementsByTagName('table');
	var oItems = [],grpIndex=-1;
	for (var i=0;i<oTables.length;i++) {
	    if($(oTables[i]).hasClass("confirmit-grid")){
			for (var r = 1, row=oTables[i].rows.length; r<row; r++) {
				if($(oTables[i].rows[r].cells[0]).hasClass("grid-group-header-label")){
					grpIndex++;
					oItems[grpIndex]={
						"title":oTables[i].rows[r].cells[0].innerHTML,
						"items":[]
					}
				}
				else {
					var theItemGrpIndex=oItems[grpIndex]["items"].length;
					var oInputs=oTables[i].rows[r].getElementsByTagName('input');
					var oLabels=oTables[i].rows[r].cells[0];
					oItems[grpIndex]["items"][theItemGrpIndex]={
						"code"			:getDataItemCode(oInputs,qType,theFormName).code,
						"value"		:getDataItemCode(oInputs,qType,theFormName).value	
					}
					var labelRowData=getDataItemLabels(oLabels,qType,theFormName,oItems[grpIndex]["items"][theItemGrpIndex]["code"]);
					oItems[grpIndex]["items"][theItemGrpIndex]["label"]=labelRowData.label;
					oItems[grpIndex]["items"][theItemGrpIndex]["isOE"]=labelRowData.isOE;
					oItems[grpIndex]["items"][theItemGrpIndex]["sOEValue"]=labelRowData.sOEValue;
				}
					
	        }
		}
    }
	
	return oItems;
}


/*
** getting value for a specific item
*/
function getListItemValue(qType,theFormName,theItemCode,isOther){
	
	switch (qType.toUpperCase()) {
		case "SR":
		case "MR":
			if(isOther){
				return {
					"value"		:document.getElementById(theFormName+"_"+theItemCode).checked,
					"sOEValue"	:document.getElementById(theFormName+'_'+theItemCode+'_other').value.length>0?document.getElementById(theFormName+'_'+theItemCode+'_other').value:''
				}		
			}
			else{
				return document.getElementById(theFormName+"_"+theItemCode).checked;
			}
		break;	
		case "NUM":
		case "OTL":		
			if(isOther){
				return {
					"value"		:document.getElementById(theFormName+"_"+theItemCode).value,
					"sOEValue"	:document.getElementById(theFormName+'_'+theItemCode+'_other').value.length>0?document.getElementById(theFormName+'_'+theItemCode+'_other').value:''
				}		
			}
			else{
				return document.getElementById(theFormName+"_"+theItemCode).value;
			}
		break;
	}
}

function getGridValue(qType,theFormName,theItemCode,isOther,theLabelCode){
	if(isOther){
		var theItemValue={
			"value"		:theLabelCode?document.getElementById(theFormName+"_"+theItemCode+"_"+theLabelCode).checked:null,
			"sOEValue"	:document.getElementById(theFormName+'_'+theItemCode+'_other').value.length>0?document.getElementById(theFormName+'_'+theItemCode+'_other').value:''
		}
		return theItemValue;					
	}
	else{
		return document.getElementById(theFormName+"_"+theItemCode+"_"+theLabelCode).checked;
	}		
}

function getMultiGridValue(qType,theFormName,theLabelCode,isOther,theItemCode){
	if(isOther){
		var theItemValue={
			"value"		:theItemCode?document.getElementById(theFormName+"_"+theItemCode+"_"+theLabelCode).checked:null,
			"sOEValue"	:document.getElementById(theFormName+'_'+theLabelCode+'_other').value.length>0?document.getElementById(theFormName+'_'+theLabelCode+'_other').value:''
		}
		return theItemValue;					
	}
	else{
		return document.getElementById(theFormName+"_"+theItemCode+"_"+theLabelCode).checked;
	}		
}