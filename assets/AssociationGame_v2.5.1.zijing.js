function SSIAssociationGame(config){
    var self=this;
	this.configObject={
    }
	this.settings={
	
	};
    $.extend(true,this.configObject, config);
    $.extend(true,this.settings,this.configObject); 
    
    //console.log(this.settings);
    /*******exclude invalid scale************/
    this.settings.olabels=new Array(new Array(), new Array());
    for(var i=0;i<this.settings.oOriglabels[0].length;i++){
        var isItemValid=true;
        if(this.settings.scaleConfig.invalid!=null&&parseInt(this.settings.oOriglabels[0][i])==this.settings.scaleConfig.invalid){
            isItemValid=false;
        }
        
        if(isItemValid){
                this.settings.olabels[0].push(this.settings.oOriglabels[0][i]);
                this.settings.olabels[1].push(this.settings.oOriglabels[1][i]);
        }
    }    

    this.uiElm={
        items       :[],
        scales      :[],
        keyboards   :[]
    }; 
    this.settings.iTotalItems= this.settings.oItems[0].length;
    this.settings.iTotalScales= this.settings.olabels[0].length; 
    
    this.settings.iTotalScaleImgLoaded=0;
    this.settings.currentItemIndex=0;
    this.settings.toolReady=false;
    this.settings.keyEventEnabled=false;
    this.settings.statementEnabled=false;
    this.settings.timerCounter=0;
    this.settings.tCoutner;
	this.iCorrectCounter=0;
	this.iWrongCounter=0;
	this.iHighestTime=-1;
    this.build();
    
    return this;
}


SSIAssociationGame.prototype.build = function(){
    var self=this;
    /*********build progress area***********/
    this.uiElm.progressArea=$("<div>",{"class":"progress-area hidden block container-fluid"}).appendTo($(self.settings.toolContainer));
    this.uiElm.progressRow=$("<div>",{"class":"row"}).appendTo(this.uiElm.progressArea);
    if(this.settings.timerConfig.bShow){
        this.uiElm.timercol=$("<div>",{"class":"timer-col col-xs-4 col-xs-offset-5"}).appendTo(this.uiElm.progressRow);
        this.uiElm.timerRow=$("<div>",{"class":"row"}).appendTo(this.uiElm.timercol);
        this.uiElm.timerIndicator=$("<div>",{"class":"timer col-xs-9 col-sm-8 col-lg-6 col-lg-offset-3"}).appendTo(this.uiElm.timerRow);
        this.uiElm.timerTXT=$("<div>",{"class":"timer-postfix col-xs-3"}).html(this.settings.timerConfig.postfix).appendTo(this.uiElm.timerRow);
        this.remvClass(this.uiElm.progressArea,'hidden');
    }
    if(this.settings.progressConfig.bShow){
        this.uiElm.progressTXT=$("<div>",{"class":"progress-text col-xs-2"}).html(self.getProgressTXT()).appendTo(this.uiElm.progressRow);
        if(!this.settings.timerConfig.bShow){
            this.uiElm.progressTXT.addClass('col-xs-offset-11');
        }
        else{
            this.uiElm.progressTXT.addClass('col-xs-offset-1');
        }
        this.remvClass(this.uiElm.progressArea,'hidden');
    }
    /*********build statement area***********/    
    this.uiElm.statements=$("<div>",{"class":"statements block"}).appendTo($(self.settings.toolContainer));
    
    for(var i=0;i<self.settings.oItems[0].length;i++){
        this.uiElm.items[i]=$('<div class="statement transparent"><span></span></div>').attr('data-id',self.settings.oItems[0][i]).find('span').html(self.settings.oItems[1][i]).addClass('level'+self.settings.oItems[4][i]).end().appendTo(this.uiElm.statements); 
        this.uiElm.items[i].iTimer={
            start   :0,
            end     :0,
            elapsed :0
        };      
   }    
    
       
    if(this.settings.itemConfig.maxSecond!=null){
        this.uiElm.ErrorMsg=$('<div class="err-statement hidden"><span></span></div>').find('span').html(this.settings.sError.sTimeout).end().appendTo(this.uiElm.statements); 
    }
    /*********build scale area***********/     
    this.uiElm.scaleContainer=$("<div>",{"class":"scale-container container-fluid block"}).appendTo($(self.settings.toolContainer));
    
    /*********build start button***********/  
    if(this.settings.sStart!=null){
        this.uiElm.startRow=$("<div>",{"class":"start-row row block"}).appendTo($(this.uiElm.scaleContainer)); 
        this.uiElm.startButton=$("<div>",{"class":"start-button tool-button block"}).html(this.settings.sStart).appendTo(this.uiElm.startRow); 
		if(this.settings.itemConfig.clickFixOnErr){
			this.uiElm.continueButton=$("<div>",{"class":"continue-button tool-button block"}).html(this.settings.sContinue).appendTo(this.uiElm.startRow).hide();	
		}		
    }    
    
    this.uiElm.scaleRow=$("<div>",{"class":"scale-row row block"}).appendTo($(this.uiElm.scaleContainer));

    /*********build key area***********/    
    if(this.settings.scaleConfig.keyChars.length>0){
        //this.settings.keyEventEnabled=true;
    }
    if(this.settings.keyEventEnabled){
        this.uiElm.keyContainer=$("<div>",{"class":"key-container container-fluid block"}).appendTo($(self.settings.toolContainer)); 
        this.uiElm.keyRow=$("<div>",{"class":"key-row row block"}).appendTo(this.uiElm.keyContainer);
        for(var i=0;i<self.settings.olabels[0].length;i++){
            self.createKeys(i,self.uiElm.keyRow);
        }
    }    
    
    for(var i=0;i<self.settings.olabels[0].length;i++){
        self.createScaleButton(i,self.settings.olabels[0][i],self.settings.olabels[1][i],self.uiElm.scaleRow);
    } 
    // add title
	this.uiElm.title=$("<div>",{"class":"title-container container-fluid block"}).html(self.settings.sTitle).appendTo($(self.settings.toolContainer));  
	
 
}

SSIAssociationGame.prototype.getProgressTXT = function(){
    var currentProgress=this.settings.currentItemIndex;
	var iTotalStatement=this.settings.iTotalItems;
	if(!this.settings.showTest){
		//console.log(currentProgress)
		currentProgress=this.settings.currentItemIndex+1;
	}
	else{
		iTotalStatement-=1;
	}
	return currentProgress+'/'+iTotalStatement+this.settings.progressConfig.postfix;
}

SSIAssociationGame.prototype.remvClass= function(elm,className){
    if(elm.hasClass(className)){
       elm.removeClass (className);
    }
}

SSIAssociationGame.prototype.createKeys = function(index,parent){
     this.uiElm.keyboards[index]={};
     this.uiElm.keyboards[index].col=$("<div>",{"class":"col col-xs-6 block"}).appendTo(parent); 
     if(index==0){
        this.uiElm.keyboards[index].col.addClass('first');
     }
     else if(index==this.settings.olabels[0].length-1){
        this.uiElm.keyboards[index].col.addClass('last');
     }
     this.uiElm.keyboards[index].body=$("<div>",{"class":"key-body transparent block"}).html(this.settings.scaleConfig.keyChars[index]).appendTo(this.uiElm.keyboards[index].col); 
}

SSIAssociationGame.prototype.createScaleButton = function(index,code,olabel,parent){
     var self=this;
     this.uiElm.scales[index]={};
     this.uiElm.scales[index].col=$("<div>",{"class":"col col-xs-6 block"}).appendTo(parent);
     if(index==0){
        this.uiElm.scales[index].col.addClass('first');
     }
     else if(index==this.settings.olabels[0].length-1){
        this.uiElm.scales[index].col.addClass('last');
     }
     this.uiElm.scales[index].body=$("<div>",{"class":"scale-body transparent block",'code':code,'iOrder':index}).appendTo(this.uiElm.scales[index].col);     
     this.uiElm.scales[index].contentBox=$("<div>",{"class":"scale-contentbox block"}).appendTo(this.uiElm.scales[index].body);
     //console.log(this.settings.scaleConfig.theme.length)
	 if(this.settings.scaleConfig.theme!=null){
        this.uiElm.scales[index].contentBox.addClass(self.getScaletheme(code));
     }
     if(this.settings.scaleConfig.contentType.toLowerCase()=="image"){
		if(this.settings.scaleConfig.isLabelAdded){
            var oLabelData=olabel.split(this.settings.scaleConfig.splitor);    
            // load button image            
            $("<img>",{	"class"	:"scale-image img-responsive"})
            .appendTo( this.uiElm.scales[index].contentBox)
            .one("load",function(){
                //console.log($(this));
                //console.log($(this).width(),$(this).height());
                self.scaleImageLoaded($(this));
            }).attr('src',this.settings.imagePath+oLabelData[1]+this.settings.scaleConfig.extention);	
                
            this.uiElm.scales[index].label=$("<label>",{"class":"scale-label block"}).html(oLabelData[0]).appendTo(this.uiElm.scales[index].body);
			//this.uiElm.scales[index].label=$("<div>",{"class":"scale-label block"}).appendTo(this.uiElm.scales[index].body);
        }
		else{
            // load button image            
            $("<img>",{	"class"	:"scale-image img-responsive"})
            .appendTo( this.uiElm.scales[index].contentBox)
            .one("load",function(){
                //console.log($(this));
                //console.log($(this).width(),$(this).height());
                self.scaleImageLoaded($(this));
            }).attr('src',this.settings.imagePath+olabel+this.settings.scaleConfig.extention);			
		}
     }
     this.uiElm.scales[index].ticker=$("<div>",{"class":"scale-ticker block fade"}).appendTo(this.uiElm.scales[index].body);
        
}

SSIAssociationGame.prototype.getScaletheme = function(code){
    return this.settings.scaleConfig.theme['code'+code];
}

SSIAssociationGame.prototype.scaleImageLoaded = function(imgElm){
    //resize image
    //console.log(imgElm.width(),imgElm.height());
    //console.log(imgElm.parent().width(),imgElm.parent().height())
    // centralize
    var imageTop=(imgElm.parent().height()-imgElm.height())/2;
    var imageLeft=(imgElm.parent().width()-imgElm.width())/2;
    imgElm.css('top',imageTop+'px').css('left',imageLeft+'px');
    this.settings.iTotalScaleImgLoaded++;
    this.checkImageLoaded();    
}

SSIAssociationGame.prototype.checkImageLoaded = function(){
    var self=this;
    if(this.settings.iTotalScaleImgLoaded>=this.settings.iTotalScales){
        if(this.settings.sStart==null){
            this.deployTool(1000);
        }
        else{
            this.uiElm.startRow.show();
            this.uiElm.startButton.click(function() {
                $(this).hide();
				$(this).parent().hide();
                self.deployTool(0);
            });
			if(this.settings.itemConfig.clickFixOnErr){
				this.uiElm.continueButton.click(function() {
					self.hideErr();
					self.hideStatement();  
				});
			}
        }
		
        if(this.settings.keyEventEnabled){
            this.addKeyEvent();
        }
		if(this.settings.clkEvtEnabled){
			this.addClickEvent();
		}

    }
}

SSIAssociationGame.prototype.deployTool = function(iMDSecond){
    var self=this;
    for(var i=0;i<this.settings.olabels[0].length;i++){
        this.uiElm.scales[i].body.removeClass('transparent').addClass('hard');
         if(this.settings.keyEventEnabled){
            this.uiElm.keyboards[i].body.removeClass('transparent').addClass('hard');
         }
    }
    if(iMDSecond>0){
        setTimeout(function(){
            
            self.showStatement(); 
            
            
        }, iMDSecond);   
    } 
    else{
            self.showStatement(); 
    }
}

SSIAssociationGame.prototype.showStatement = function(){
	var self=this;
    for(var i=0;i<this.settings.olabels[0].length;i++){
        this.uiElm.scales[i].ticker.removeClass('in');
    }
    self.uiElm.progressTXT.html(self.getProgressTXT());
    this.uiElm.items[this.settings.currentItemIndex]
        .animate({
		  left: 0,
		  opacity: 1
	   },{
         duration:this.settings.itemConfig.durationShow,
         complete:function(){
            //self.uiElm.items[self.settings.currentItemIndex].append('<span class="shot"> done</span>');
             self.settings.statementEnabled=true;
             //self.uiElm.progressTXT.html(self.getProgressTXT())
             self.startCounter();
             self.uiElm.items[self.settings.currentItemIndex].iTimer.start=new Date().getTime();
         }       
       });

}

SSIAssociationGame.prototype.hideStatement = function(){
     var self=this;
     this.uiElm.items[this.settings.currentItemIndex]
        .animate({
		  left: '100%',
		  opacity: 0
	   },{
         duration:this.settings.itemConfig.durationHide,
         complete:function(){
            self.settings.currentItemIndex++;
            if(self.settings.currentItemIndex<self.settings.oItems[0].length){
                self.showStatement();
            }
            else{                
                //console.log('go to next page');
				//goToNextPage();
				self.displayTestResult();
             }
         }       
       });
}    
SSIAssociationGame.prototype.displayTestResult = function(){
	$('#toolContainer').hide();
	$('#test-result').show();
	var iTotalTime=0;
	for(var i=0;i<this.settings.oItems[0].length;i++){
		iTotalTime+=parseFloat($("#"+this.settings.sTimerForm+"_"+this.settings.oItems[0][i]).val())*1000;
	}
	var arrageTime=Math.round(iTotalTime/this.settings.oItems[0].length)/1000;
	console.log(arrageTime)
	$('.correctCounter').html(this.iCorrectCounter);
	$('.wrongCounter').html(this.iWrongCounter);
	$('.timeCounter').html(arrageTime);
	$('.highCounter').html(this.iHighestTime);	
}

SSIAssociationGame.prototype.startCounter = function(){
    var self=this; 
    this.settings.timerCounter=0;
    self.updateTimerTXT(this.settings.timerCounter);
    this.settings.tCoutner= setTimeout(function(){ self.updateCounter();}, 100);
}

SSIAssociationGame.prototype.updateCounter = function(){
    var self=this;
    this.settings.timerCounter++;
	
	//timer adjustment
	var speed = 100;
	var real = this.settings.timerCounter * speed,
	ideal = (new Date().getTime() -  self.uiElm.items[self.settings.currentItemIndex].iTimer.start);
	var diff = (ideal - real) > 0 ? (ideal - real) : 0;
	//console.log('real: ', real, 'ideal: ', ideal, 'diff: ', diff);
	
	//console.log(this.settings.timerCounter,this.validateTimer())
	var isValidCounter=true;
	if(this.settings.itemConfig.maxSecond){
		isValidCounter=this.validateTimer();
	}
	if(isValidCounter){
		self.updateTimerTXT(this.settings.timerCounter);
		clearTimeout(self.settings.tCoutner);
		this.settings.tCoutner= setTimeout(function(){ self.updateCounter();}, speed - diff );
	}else{
		self.settings.statementEnabled=false;
		self.showErr();
		clearTimeout(self.settings.tCoutner);
		self.getTimeLag(self);
		self.codeInvalidAnswer();
		var isDirectNext=false;
		//console.log(self.settings.currentItemIndex)
		if(self.settings.itemConfig.clickFixOnErr&&!self.isNotLastItem()){
			isDirectNext=true;
		}		
		if(isDirectNext){
			setTimeout(function(){
				self.hideErr();
				self.hideStatement();  
			},self.settings.sError.displayTime); 
		}		
	}
}

SSIAssociationGame.prototype.isNotLastItem = function(){
	return (this.settings.currentItemIndex<this.settings.iTotalItems-1)?true:false;
}

SSIAssociationGame.prototype.codeInvalidAnswer = function(){
	var currentItemCode=this.settings.oItems[0][this.settings.currentItemIndex];
    if(this.settings.scaleConfig.invalid) assignValueToIP(this.settings.sForm,currentItemCode,this.settings.scaleConfig.invalid,true);
    assignValueToText(this.settings.sTimerForm,currentItemCode,this.uiElm.items[this.settings.currentItemIndex].iTimer.elapsed);
}

SSIAssociationGame.prototype.showErr = function(){
	this.uiElm.ErrorMsg.removeClass('hidden');
	if(this.settings.itemConfig.clickFixOnErr){
		this.uiElm.scaleRow.hide();
		this.uiElm.startRow.show();
		this.uiElm.continueButton.hide();
		if(this.isNotLastItem()){
			this.uiElm.continueButton.show();
		}
	}
}

SSIAssociationGame.prototype.hideErr = function(){
	this.uiElm.ErrorMsg.addClass('hidden');
	if(this.settings.itemConfig.clickFixOnErr){
		this.uiElm.startRow.hide();
		if(this.isNotLastItem()){
			this.uiElm.scaleRow.show();
		}
	}	
}

SSIAssociationGame.prototype.validateTimer = function(){
	return (this.settings.timerCounter>this.settings.itemConfig.maxSecond*10)?false:true;	
}

SSIAssociationGame.prototype.clearCounter = function(){
    var self=this;
    self.updateTimerTXT(-1);
    clearTimeout(self.settings.tCoutner);
}

SSIAssociationGame.prototype.updateTimerTXT= function(value){
    var sDisplayTXT='';   
    if(value>=0){
        value=value>99999?99999:value;
        sDisplayTXT=this.formatDecimals(value/10,1,'.',2);
    }
    this.uiElm.timerIndicator.html(sDisplayTXT);
}

SSIAssociationGame.prototype.formatDecimals= function (num, digits, jointer, iType) {
       //if no decimal places needed, we're done
	if (digits <= 0) {
    	return Math.round(num);
    }
	else {
        //round the number to specified decimal places
        //e.g. 12.3456 to 3 digits (12.346) -> mult. by 1000, round, div. by 1000
        var tenToPower = Math.pow(10, digits);
        var cropped = String(Math.round(num * tenToPower) / tenToPower);
		var finalRestul="";
		var zerosNeeded=0;
		if (cropped.indexOf(".") == -1) {
               // cropped += jointer; 
			    finalRestul=cropped; 
			    if(iType==2){
			    	finalRestul += jointer;
					//finalRestul += "0";//e.g. 5 -> 5.0 (at least one zero is needed)
					zerosNeeded=digits;
				}
		}
		else{
				//finally, force correct number of zeroes; add some if necessary
				var halves = cropped.split("."); //grab numbers to the right of the decimal	
				finalRestul=halves[0]+jointer;
				finalRestul +=halves[1];
				if(iType==2){
					zerosNeeded = digits - halves[1].length; //number of zeros to add
				}
		}
		for (var i=1; i <= zerosNeeded; i++) {
                finalRestul += "0";
		}	
         return finalRestul;
    }
 }


SSIAssociationGame.prototype.addKeyEvent = function(){
    var self=this; 
   /*if (window.addEventListener) {                    // For all major browsers, except IE 8 and earlier
        window.addEventListener("keyup",function(){self.KeyEventHandler(self)},false);
    } else if (window.attachEvent) {                  // For IE 8 and earlier versions
        window.attachEvent("keyup",function(){self.KeyEventHandler(self)});
    }*/
    
    $(document).keyup(function( event ) {
		//console.log(event.which)
        self.KeyEventHandler(event,self);
    })
}

SSIAssociationGame.prototype.KeyEventHandler = function(e,obj){
    var key = e.keyCode || e.which;
   // console.log(this);
    //console.log(key,obj);
    if(obj.settings.statementEnabled){
        //console.log(currentItemCode,key);
        for(var i=0;i<obj.settings.olabels[0].length;i++){
            if(key==obj.settings.scaleConfig.keyCodes[i]){
                // item selected            
                /*obj.settings.keyEnabled=false;
                obj.uiElm.items[obj.settings.currentItemIndex].iTimer.end=new Date().getTime();
                obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed=obj.uiElm.items[obj.settings.currentItemIndex].iTimer.end-obj.uiElm.items[obj.settings.currentItemIndex].iTimer.start;
                obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed=Math.max(0,obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed)/1000;
               // console.log(obj.uiElm.items[obj.settings.currentItemIndex].iTimer);
                //console.log('item code',obj.settings.olabels[0][i]);
                obj.uiElm.scales[i].ticker.addClass('in');
                assignValueToIP(obj.settings.sForm,currentItemCode,obj.settings.olabels[0][i],true);
                assignValueToText(obj.settings.sTimerForm,currentItemCode,obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed);
                obj.clearCounter();
                obj.hideStatement();*/
				obj.settings.statementEnabled=false;
                obj.selectItem(obj,i);
                break;
            }
        }

    }
    else{
        //console.log('clicked too quick');
    }
}

SSIAssociationGame.prototype.addClickEvent = function(){
    var self=this;
	for(var i=0;i<this.settings.olabels[0].length;i++){
        this.uiElm.scales[i].body.click(function() {
			self.clickHandler($(this).attr('iOrder'),self);
        });
    }
}

SSIAssociationGame.prototype.getTimeLag = function(obj){
    obj.uiElm.items[obj.settings.currentItemIndex].iTimer.end=new Date().getTime();
    obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed=obj.uiElm.items[obj.settings.currentItemIndex].iTimer.end-obj.uiElm.items[obj.settings.currentItemIndex].iTimer.start;
    obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed=Math.max(0,obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed)/1000;
}

SSIAssociationGame.prototype.selectItem = function(obj,btnindex){
    var currentItemCode=obj.settings.oItems[0][obj.settings.currentItemIndex];
	// item selected            
    /*obj.uiElm.items[obj.settings.currentItemIndex].iTimer.end=new Date().getTime();
    obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed=obj.uiElm.items[obj.settings.currentItemIndex].iTimer.end-obj.uiElm.items[obj.settings.currentItemIndex].iTimer.start;
    obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed=Math.max(0,obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed)/1000;*/
	
	obj.getTimeLag(obj);
   // console.log(obj.uiElm.items[obj.settings.currentItemIndex].iTimer);
    //console.log('item code',obj.settings.olabels[0][i]);
    obj.uiElm.scales[btnindex].ticker.addClass('in');
    assignValueToIP(obj.settings.sForm,currentItemCode,obj.settings.olabels[0][btnindex],true);
	if(obj.settings.olabels[0][btnindex]==1){
		this.iCorrectCounter++;
	}
	else{
		this.iWrongCounter++;
	}
    assignValueToText(obj.settings.sTimerForm,currentItemCode,obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed);
	if(obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed>this.iHighestTime){
		console.log(obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed)
		this.iHighestTime=obj.uiElm.items[obj.settings.currentItemIndex].iTimer.elapsed;
	}
    obj.clearCounter();
    obj.hideStatement();  
}


SSIAssociationGame.prototype.clickHandler = function(index,obj){
	//console.log('index',index)
	if(obj.settings.statementEnabled){
		obj.settings.statementEnabled=false;
		obj.selectItem(obj,index);
	 }
}