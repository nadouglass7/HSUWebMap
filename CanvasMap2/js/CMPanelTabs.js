//******************************************************************
// CMPanelTabs Class
//******************************************************************

//******************************************************************
// Constructor
//******************************************************************
function CMPanelTabs(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelTabs requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	this.Tabs=[];
	this.TabContents=[];
}

CMPanelTabs.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelTabs.prototype.contructor=CMPanelTabs; // override the constructor to go to ours

//******************************************************************
// private Functions
//******************************************************************
/**
* @private
*/
CMPanelTabs.prototype.GetTabIndexFromName=function(TabName)
{
	var Result=-1;
	
	for (var i=0;i<this.Tabs.length;i++)
	{
		if (this.Tabs[i].Name==TabName) // this tab is being selected
		{
			Result=i;
		}
	}
	return(Result);
}

//******************************************************************
// Functions
//******************************************************************
/**
* Set the element that contains the tab panel
*/
CMPanelTabs.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;

	// add the container for the tabs at the top of the div
	
	this.TabContainer=document.createElement("DIV");
	this.TabContainer.className="CM_Tabs";
  
	this.TheElement.appendChild(this.TabContainer);
}

/**
* Add a tab to the tab panel.
* @public
* @param ContentID - The id for the content that will be associated with the tab.
* @param Name - The name that will appear in the tabs
* @param ToolTip - Optional tools tip that will appear when the user hovers over the tab.
* @returns - The tab content assocaited with the tab.
*/
CMPanelTabs.prototype.AddTab=function(ContentID,Name,ToolTip,TabContent)
{
//	var TabContent=null;
	
	if  (this.TheElement!=null)
	{
		// create the tab element
		var TabElement=document.createElement("button");
		TabElement.id=ContentID+"_tab";
		
		TabElement.className="tablinks";
		
		if (ToolTip!=undefined) TabElement.title=ToolTip;
		TabElement.innerHTML=Name;
		
		TabElement.Selected=false;
		TabElement.TabPanel=this;
		TabElement.Name=Name;
		
		TabElement.onclick=function()
		{
			this.TabPanel.SelectTab(this.Name);
			
			CMMainContainer.HidePopupWindow(); // global
		}
		this.Tabs.push(TabElement);
		
		this.TabContainer.appendChild(TabElement);
		
		// setup the content container
		if (CMUtilities.IsDefined(TabContent)==false)
		{
			TabContent=document.createElement("DIV");
			TabContent.id=ContentID;
			TabContent.className="CM_TabContent";
		}
		TabContent.style.display="none"; // start with the content hidden
		
		this.TabContents.push(TabContent);
		
		this.TheElement.appendChild(TabContent);
	}
	return(TabContent);
}
/**
* Set the currently selected tab
* @public
* @param TheTabButton - the button object that was returned by AddTab()
*/
CMPanelTabs.prototype.SelectTab=function(TabName)
{
	for (var i=0;i<this.Tabs.length;i++)
	{
		if (this.Tabs[i].Name==TabName) // this tab is being selected
		{
			this.TabContents[i].style.display="block";
			this.Tabs[i].className = this.Tabs[i].className += " active";
		}
		else
		{
			this.TabContents[i].style.display="none";
			this.Tabs[i].className = this.Tabs[i].className.replace(" active", "");
		}
	}
}
/***
* Returns a tab content element so it can be filled
* @public
* @param TabName - name of the tab whose content will be returned
*/
CMPanelTabs.prototype.GetTabContentElement=function(TabName)
{
	var Result=null;
	
	var Index=this.GetTabIndexFromName(TabName);
	
	if (Index!=-1) Result=this.TabContents[Index];

	return(Result);
}

/***
* Removes a table from tab container
* @public
* @param TabName - name of the tab whose content will be returned
*/
CMPanelTabs.prototype.RemoveTab=function(TabName)
{
	var Index=this.GetTabIndexFromName(TabName);
	
	if (Index!=-1) // found the tool
	{
		var TabElement=this.Tabs[Index];
		
		// remove the tool from the tool panel
		TabElement.parentNode.removeChild(TabElement);
		
		// remove the tool from the array
		this.Tabs.splice(Index,1);
		this.TabContents.splice(Index,1);
	}
}

