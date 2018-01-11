CMBase.DATA_TYPE_COORDINATES=1;CMBase.DATA_TYPE_COLOR=2;CMBase.DATA_TYPE_INTEGER=3;CMBase.DATA_TYPE_BOOLEAN=4;CMBase.DATA_TYPE_FLOAT=5;CMBase.DATA_TYPE_CSS_STYLE=6;CMBase.DATA_TYPE_ENUMERATED=7;CMBase.DATA_TYPE_URL=8;CMBase.DATA_TYPE_STRING=9;CMBase.DATA_TYPE_IMAGE=10;CMBase.DATA_TYPE_FONT=11;CMBase.UniqueNumber=1;function CMBase(){}CMBase.prototype.GetName=function(){return("Untitled");}
CMBase.prototype.GetNumChildren=function(){return(0);}
CMBase.prototype.GetChild=function(Index){return(null);}
CMBase.prototype.SetParent=function(NewParent){this.TheParent=NewParent;}
CMBase.prototype.GetParent=function(Class){var Result=null;if(this.TheParent!=undefined){if(Class!=undefined){if(this.TheParent instanceof Class)Result=this.TheParent;else Result=this.TheParent.GetParent(Class);}else{if(this.TheParent!=undefined)Result=this.TheParent;}}return(Result);}
CMBase.prototype.AddListener=function(TheMessage,TheListener,TheFunction){if(this.Listeners==undefined)this.Listeners=[];if(this.Listeners[TheMessage]==undefined)this.Listeners[TheMessage]=[];var UniqueNumber=CMBase.GetUniqueNumber();this.Listeners[TheMessage].push({TheFunction:TheFunction,TheListener:TheListener,UniqueNumber:UniqueNumber});return(UniqueNumber);}
CMBase.prototype.RemoveListener=function(TheMessage,UniqueNumber){if(this.Listeners!=undefined){var TheListeners=this.Listeners[TheMessage];for(var i=0;i<TheListeners.length;i++){if(TheListeners[i].UniqueNumber==UniqueNumber){TheListeners.splice(i,1);}}}}
CMBase.prototype.SendMessageToListeners=function(TheMessage,AdditionalInfo){if((this.Listeners!=undefined)){var TheListeners=this.Listeners[TheMessage];if(TheListeners!=undefined){for(var i=0;i<TheListeners.length;i++){var TheListener=TheListeners[i].TheListener;TheListeners[i].TheFunction(this,TheListener,AdditionalInfo);}}}}
CMBase.prototype.GetSettingsDefinitions=function(){var Result={};return(Result);}
CMBase.prototype.GetSettings=function(){var Result={};return(Result);}
CMBase.prototype.SetSettings=function(TheSettings){}
CMBase.GetUniqueNumber=function(){CMBase.UniqueNumber++;return(CMBase.UniqueNumber-1);}