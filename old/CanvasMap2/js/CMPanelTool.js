//******************************************************************
// SetupSettingsPanel Class
//******************************************************************

//******************************************************************
// Constructor
//******************************************************************
function CMPanelTool(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelTool requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	this.Tools=[];
}

CMPanelTool.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelTool.prototype.contructor=CMPanelTool; // override the constructor to go to ours

//******************************************************************
// private Functions
//******************************************************************
/**
* @private
*/
CMPanelTool.prototype.GetToolIndexFromID=function(ToolID)
{
	var Result=-1;
	
	for (var i=0;i<this.Tools.length;i++)
	{
		if (this.Tools[i].id==ToolID) Result=i;
	}
	return(Result);
}

//******************************************************************
// Functions
//******************************************************************
CMPanelTool.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;
	
	this.Tools=[];
}

/**
* Add a tool to the panel.
* @public
* @param ToolID - ID which will be used to create the element
* @param UnselectedFilePath - file path for the image of the tool when unselected
* @param SelectedFilePath - file path for the tool icon when selected
*/
CMPanelTool.prototype.AddTool=function(ToolElement,UnselectedFilePath,SelectedFilePath,TheHandler,ToolTip,TheFunction)
{
//	var ToolElement=null;
	
	if  (this.TheElement!=null)
	{
		var ToolID;
			
		// create the tool element if is does not exist yet
		
		if (typeof(ToolElement) === 'string') // element does not exist yet, create it
		{
			var ToolID=ToolElement;
			
			ToolElement=document.createElement("DIV");
			ToolElement.id=ToolID;
			ToolElement.className="CM_Tool";
		}
		else 
		{
			ToolID=ToolElement.id;
		}
		// setup the rest of the tool properties
		
		ToolElement.style.backgroundColor="none";
		
		ToolElement.title=ToolTip;
		ToolElement.cursor='pointer';
		ToolElement.innerHTML="<img id='"+ToolID+"_Image' class='CMTool_Image' \
		  src='"+UnselectedFilePath+"'alt='ID Marker'>";
		
		ToolElement.Selected=false;
		ToolElement.ToolPanel=this;
		ToolElement.UnselectedFilePath=UnselectedFilePath;
		ToolElement.SelectedFilePath=SelectedFilePath;
		ToolElement.TheFunction=TheFunction;
		
		ToolElement.onclick=function()
		{
			var TheToolPanel=this.ToolPanel;
			var TheCanvasMap=TheToolPanel.GetParent(CMMainContainer);
			
			TheToolPanel.SelectTool(this.id);
			
			CMMainContainer.HidePopupWindow(); // global
			
			if (this.TheFunction!=undefined)
			{
				this.TheFunction(TheHandler);
			}
		}
		this.TheElement.appendChild(ToolElement);
		
		this.Tools.push(ToolElement);
	}
	return(ToolElement);
}
CMPanelTool.prototype.MakeToolGroup=function(ToolArray)
{
	// remove the tools
	for (var i=0;i<ToolArray.length;i++)
	{
		var ToolElement=ToolArray[i];
		
		ToolElement.parentNode.removeChild(ToolElement);
	}
	var TheTableDIV=document.createElement("DIV");
	TheTableDIV.className="CM_ToolGroup";
	
	var TheTable=document.createElement("TABLE");
	TheTableDIV.appendChild(TheTable);
	
	TheTable.style.borderSpacing="0px";
	
	// Add the tools back in
	var TheRow=TheTable.insertRow(0);
	
	var TheTableWidth=0;
	for (var i=0;i<ToolArray.length;i++)
	{
		var ToolElement=ToolArray[i];
		ToolElement.className="CM_ToolInGroup";

//		ToolElement.style.border="solid red 1px";
		
		var TheCell=TheRow.insertCell(-1);
		
		if (i!=ToolArray.length-1) TheCell.style.borderRight="thin solid #999";
		
		TheCell.appendChild(ToolElement);
		
		TheTableWidth+=28;
	}
	TheTableDIV.style.width=TheTableWidth+"px";
	
	this.TheElement.appendChild(TheTableDIV);
	
	return(TheTableDIV);
}
CMPanelTool.prototype.RemoveToolGroupElement=function(ToolGroupElement)
{
	this.TheElement.removeChild(ToolGroupElement);
}
CMPanelTool.prototype.AddToolGroupElement=function(ToolGroupElement)
{
	this.TheElement.appendChild(ToolGroupElement);
}

/**
* Removes the specified tool from the panel
* @public 
* @param ToolID - the DOM element id for the tool.
*/
CMPanelTool.prototype.RemoveTool=function(ToolID)
{
	var Index=this.GetToolIndexFromID(ToolID);
	
	if (Index!=-1) // found the tool
	{
		var ToolElement=this.Tools[Index];
		
		// remove the tool from the tool panel
		ToolElement.parentNode.removeChild(ToolElement);
		
		// remove the tool from the array
		this.Tools.splice(Index,1);
	}
}

/**
* Select a specific tool based on its ID and unselect the other tools
* @public
* @TargetToolID - the tool to select
*/
CMPanelTool.prototype.SelectTool=function(TargetToolID)
{
	for (var i=0;i<this.Tools.length;i++)
	{
		var TheElement=this.Tools[i];
		
		if (TheElement.id==TargetToolID) // foiund the tool to select
		{
			TheElement.Selected=true;
			
			var ImageElement=document.getElementById(TargetToolID+"_Image");
			ImageElement.src=TheElement.SelectedFilePath;
		}
		else // unselect the tool if selected
		{
			if (TheElement.Selected)
			{
				if (TheElement.UnselectFunction!=undefined) TheElement.UnselectFunction();
				
				TheElement.Selected=false;
				
				var ImageElement=document.getElementById(TheElement.id+"_Image");
				ImageElement.src=TheElement.UnselectedFilePath;
			}
		}
	}
}
