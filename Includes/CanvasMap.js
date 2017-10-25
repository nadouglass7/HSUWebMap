/***************************************************************************************
* CanvasMap Class
*
* This class implements a full dynamic mapping system with a layer list and a status
* bar.  The user can add tool icons as desired.
*
* The elements for a CanvasMap are held in an array, 
* @module CanvasMap
***************************************************************************************/
//***************************************************************************************
// Static functions
//***************************************************************************************
// Functions to manage popup windows
//
// There can only be one popup window on the screen at a time.
//***************************************************************************************
/*
* This function is inserted into event processing so we can hide popup windows when the
* user clicks anywhere in the document.
*/
document.onmousedown=function(TheEvent) 
//$(document).mousedown( function(TheEvent) 
{ "use strict";
						
	var TargetContainedInPopupWindow=false;
	
	if (CanvasMap.PopupWindow!==null) 
	{
		TargetContainedInPopupWindow=jQuery.contains( CanvasMap.PopupWindow, TheEvent.target ) ;
	}
	var TargetIsPopupWindow=false;
	if (TheEvent.target===CanvasMap.PopupWindow) { TargetIsPopupWindow=true; }
	
	if ((TargetContainedInPopupWindow==false)&&(TargetIsPopupWindow==false))
	{
	   CanvasMap.HidePopupWindow();	
	}
};

/**
* Sets the current popup window and hides any existing windows
* @public
* @param NewPopupWindow - the DOM element with the visible window
*/
CanvasMap.SetPopupWindow=function(NewPopupWindow)
{ "use strict";
	CanvasMap.HidePopupWindow();
	CanvasMap.PopupWindow=NewPopupWindow;
};

/**
* Sets the current popup window and hides any existing windows
* @public
*/
CanvasMap.HidePopupWindow=function() 
{ "use strict";
	if (CanvasMap.PopupWindow!==null)
	{
		CanvasMap.PopupWindow.style.visibility="hidden";
	}
	CanvasMap.PopupWindow=null;
};


//***************************************************************************************
// Definitions
// The following definitions should be treated as "static" and should not be 
// modified by users of CanvasMap
//***************************************************************************************

// Indexes into the CanvasMap.ELEMENT_DEFS array
/**
* Defniitions for the DOM elements within a CanvasMap
* @public, @enum
*/
CanvasMap.MAP_CONTAINER=0;
CanvasMap.MAP_HEADER=1;
CanvasMap.TOOL_CONTAINER=2;
CanvasMap.TOOL_ADD=3;
CanvasMap.TOOL_EDIT=4;
CanvasMap.TOOL_INFO=5;
CanvasMap.TOOL_PAN=6;
CanvasMap.CANVAS_CONTAINER=7;
CanvasMap.CANVAS=8;
CanvasMap.LAYER_LIST=9; // list of layers contained within the TAB_CONTAINER
CanvasMap.MAP_FOOTER=10; // just contains coordinates for now
CanvasMap.MAP_COORDINATES=11; // 
CanvasMap.MAP_COORDINATES_PIXELS=12; // not implemented
CanvasMap.MAP_COORDINATES_REF=13; // not implemented
CanvasMap.MAP_COORDINATES_GEOGRAPHIC=14; // not implemented
CanvasMap.MAP_SRS=15; // 
CanvasMap.MAP_CREDITS=16; // 
CanvasMap.NAVIGATION=17;
CanvasMap.TOOLS_TITLE=18;

CanvasMap.BACKGROUND_LIST=19;
CanvasMap.SEARCH_PANEL=20;
CanvasMap.TAB_CONTAINER=21;
CanvasMap.TOOL_SELECT=22;

/**
* Units to display in the footer.  
* @public, @enum
*/
CanvasMap.COORDINATES_UNITS_DD=0;
CanvasMap.COORDINATES_UNITS_DMS=1;
CanvasMap.COORDINATES_UNITS_METERS=2;
CanvasMap.COORDINATES_UNITS_FEET=3;
CanvasMap.COORDINATE_UNITS_PIXELS=4; // displays the pixel level coordinates for debugging
CanvasMap.COORDINATE_UNITS_ZOOM=5; // displays the zoom level for debugging
/**
* Definitions for the mobile device gesture events
*/
CanvasMap.GESTURE_ZOOM=0.2; // how much to add to the zoom on a pinch event
CanvasMap.GESTURE_PAN=8; // how many pixels to move the map on a pan event

// Global variable to count the total number of maps created on one web page.
// This value is saved as the index into each CanvasMap and then incremented each time a map is created. 
// The value is also added to the end of all ElementIDs to make them unique for each map.

CanvasMap.NumMaps=0; 

// keeps track of a popup window that is currently displayed so it can be hidden if the
// user clicks anywhere in the document

CanvasMap.PopupWindow=null;

// Definitions for the elements within the CanvasMap.  

CanvasMap.ELEMENT_DEFS=[
	// ID_0							HTML tag		css className
	["MapContainer",				"div",			"CM_MapContainer"],
	["CM_MapHeader",				"div",			"CM_MapHeader"],
	["CM_ToolContainer",			"div",			"CM_ToolContainer"],
	["CM_ToolAdd",					"div",			"CM_ToolAdd"], // target?
	["CM_ToolEdit",					"div",			"CM_ToolEdit"],
	["CM_ToolInfo",					"div",			"CM_ToolInfo"], // arrow
	["CM_ToolPan",					"div",			"CM_ToolPan"], // hand
	["CM_CanvasContainer",			"div",			"CM_CanvasContainer"],
	["CM_Canvas",					"CANVAS",		"CM_Canvas"],
	["CM_LayerList",				"div",			"CM_LayerList"],
	["CM_MapFooter",				"div",			"CM_MapFooter"],
	["CM_MapCoordinates",			"div",			"CM_MapCoordinates"],
	["CM_MapCoordinatePixels",		"div",			null],
	["CM_MapCoordinateRef",			"div",			null],
	["CM_MapCoordinateGeographic",	"div",			null],
	["CM_SRS",						"div",			"CM_SRS"],
	["CM_Credits",					"div",			"CM_Credits"],
	["CM_Navigation",				"div",			"CM_Navigation"],
	["CM_ToolsTitle",				"div",			"CM_ToolsTitle"],
	["CM_BackgroundList",			"div",			"CM_BackgroundList"],
	["CM_SearchPanel",				"div",			"CM_SearchPanel"],
	["CM_TabContainer",				"div",			"CM_TabContainer"],
	["CM_ToolSelect",				"div",			"CM_ToolSelect"],
];

// defintions for the tabs above the layer list
// only used in this file

CanvasMap.TabNames=["Layers","Background","Search"]; // names that appear to the user
CanvasMap.TabContentIDs=["CM_LayerList","CM_BackgroundList","CM_SearchPanel"]; // names of the content IDs

//***************************************************************************************
// Constructors
//***************************************************************************************
/**
* Constructor for the main CanvasMap object
* @public, @constructs
*/
function CanvasMap() 
{ "use strict";
	// settings
	
	this.TheProjector=null; // used to convert corrdinates for info, will not be used unless set by the caller

	//this.SupportsResize=false;
	this.ResizeFlags=null; // object containing flags (true/false) for if we should resize an element
	this.ExistingElements=true; // true when we need to search for existing elements in the DOM
	
	this.ImageFolder="../Images/";
	
	// dimensional settings
	
	this.MapRightOffset=30;
	this.MapBottomOffset=30;
	this.HorizontalMargin=10;
	
	this.CoordinateUnits=CanvasMap.COORDINATES_UNITS_DD;
	
	// other properties
	
	this.Index=CanvasMap.NumMaps; // set the index for this map
	CanvasMap.NumMaps++; // increment the index for the next map
	
	this.TheScene=null;
	this.TheView=null;
	
	// Array for the elements in the CanvasMap.  The array entrie will be initialized to undefined
	// when first used.  The user can set the entries to null to prevent an element from being created.
	this.Elements=null;
	
	this.Test=false; // flag for Jim to test stuff without breaking the map
	
	this.DebugPanel=null;
	
	this.MobileSupported=false;
};
CanvasMap.prototype.SetTest=function(New) { this.Test=New; };

//***************************************************************************************
// Private functions for managing stickyness
// These are here just to make the code simpler to add stickiness
// Stickiness is when the elements "stick" to one of the sides of the window.
// Elements can be sticky and either move or size with the right side or bottom of the window.
//***************************************************************************************

/**
* Make the right side of an element sticky so that when the window is resized,
* the map's width changes.
*/
CanvasMap.prototype.Private_AddRightSticky=function(Index,MoveFlag,Offset)
{ "use strict";
//	if ((this.ResizeFlags==null)||(this.ResizeFlags[Index]))
	{
		if (this.Elements[Index]!=null) 
		{
			this.AddRightSticky(this.Elements[Index],MoveFlag,Offset);
		}
	}
};
/**
* Make the bottom of an element sticky so that when the window is resized,
* the map's height changes.
*/
CanvasMap.prototype.Private_AddBottomSticky=function(Index,MoveFlag,Offset)
{ "use strict";
//	if ((this.ResizeFlags==null)||(this.ResizeFlags[Index]))
	{
		if (this.Elements[Index]!==null) 
		{
			this.AddBottomSticky(this.Elements[Index],MoveFlag,Offset);
		}
	}
};
//***************************************************************************************
// Private functions for general utility functions
//***************************************************************************************
/*
* Takes over the mouse wheel.  CanvasMap adds this as an event handler on initialization.
*/
CanvasMap.MouseWheel=function(TheEvent)
{ "use strict";
	var Result; // return result is undefined typically
	
	CanvasMap.HidePopupWindow();
	
	var TheEvent=window.event || TheEvent // grab the event passed in or globally (IE compatibility)
	
	var Result=this.TheView.MouseWheel(TheEvent);
		
	return(Result);
};

/*
* Enters with a tool div as the this pointer and CanvasMap in the attributes
*/
CanvasMap.prototype.ClickOnTool=function(NewTool) // create function "CanvasMap.ClickOnTool"
{ "use strict";
	CanvasMap.HidePopupWindow();
	
	this.SelectTool(NewTool); // create a new select tool
	
	// set all tools to their default images
	
	var ArrowImage=document.getElementById("ArrowImage"); // Create the variable "TheArrowButton" and assign it to the element 		
	ArrowImage.src=this.ImageFolder+"IconArrow_20w_Default.png";
	
	var HandImage=document.getElementById("HandImage"); // Create the variable "TheArrowButton" and assign it to the element 		
	HandImage.src=this.ImageFolder+"IconHand_20w_Default.png";
	
	var InfoImage=document.getElementById("InfoImage"); // Create the variable "TheArrowButton" and assign it to the element 		
	InfoImage.src=this.ImageFolder+"Icon_I_Default.png";
	
	if (NewTool==CMView.TOOL_SELECT) // onclick, if the CanvasMap.TOOL_INFO is selected, give the ArrowButton a unique background color, and set the HandButton background color to the default.
	{
		ArrowImage.src=this.ImageFolder+"IconArrow_20w_Selected.png";
	}
	else if (NewTool==CMView.TOOL_HAND) // onclick, if the TOOL_HAND is selected, give the ArrowButton the default color, and set the HandButton a unique background color.
	{
		HandImage.src=this.ImageFolder+"IconHand_20pixels_Selected.png";
	}
	else if (NewTool==CMView.TOOL_INFO) // onclick, if the TOOL_HAND is selected, give the ArrowButton the default color, and set the HandButton a unique background color.
	{
		InfoImage.src=this.ImageFolder+"Icon_I_Selected.png";
	}
	
<!-- end button select function for map arrow (the default) and map hand (the pointer) -->
  
};
//***************************************************************************************
// CanvasMap functions to be called before Initialize() is called.  These functions setup
// connections with the DOM objects and set the behavior of the map.
//***************************************************************************************

/**
* Sets the folder containing the images for the CanvasMap interface
* @public
* @param ImageFolder - path to the folder with the images
*/
CanvasMap.prototype.SetImageFolder=function(ImageFolder)
{  "use strict";
	this.ImageFolder=ImageFolder; 
};
/** 
* Changes the coordinate units
* @public
* @param CoordinateUnits - one of the coordinate definitions:
* - CanvasMap.COORDINATES_UNITS_DD=0;
* - CanvasMap.COORDINATES_UNITS_DMS=1;
* - CanvasMap.COORDINATES_UNITS_METERS=2;
* - CanvasMap.COORDINATES_UNITS_FEET=3;
* - CanvasMap.COORDINATE_UNITS_PIXELS=4; // displays the pixel level coordinates for debugging
* - CanvasMap.COORDINATE_UNITS_ZOOM=5; // displays the zoom level for debugging
*/
CanvasMap.prototype.SetCoordinateUnits=function(CoordinateUnits) 
{ 
	this.CoordinateUnits=CoordinateUnits;
};
/**
* Sets the element for the debugging panel to show debuging messages
* @public
* @param NewDebugPanel - DOM element for the text (can just be a div element)
*/
CanvasMap.prototype.SetDebugPanel=function(NewDebugPanel)
{ 
	this.DebugPanel=NewDebugPanel;
};
/**
* Adds the specified HTML content to the debugging panel.
* Remember to clear the debugging panel periodically or this
* function becomes very slow.
* @public
* @param NewHTML - HTML to add to the Debugging panel
*/
CanvasMap.prototype.AddToDebugPanel=function(NewHTML)
{ 
	if (this.DebugPanel!=null)
	{
		this.DebugPanel.innerHTML+=NewHTML+"<br>";
	}
};

//***************************************************************************************
// Element functions
/*
* Function to provide an existnig element in place of the one that CanvasMap 
* will create by default.  The user can also specify "null" which will prevent
* the element from being created.
* @public
* @param ElementIndex - CanvasMap element definition for the element to set (i.e. CanvasMap.MAP_CONTAINER).
* @param Element - the element to replace the standard CanvasMap element
*/
CanvasMap.prototype.SetElement=function(ElementIndex,Element)
{ 
	if (this.Elements==null) this.Elements=new Array(CanvasMap.ELEMENT_DEFS.length);
	
	if (typeof(Element)=="string") // an ID was specified, find the existing element.
	{
		Element=document.getElementById(Element);
	}
	// save the element to replace the default one.
	
	this.Elements[ElementIndex]=Element; 
};
/*
* Get the element from CanvasMap based on the predefined indexes
* @public
* @param ElementIndex - CanvasMap element definition for the element to set (i.e. CanvasMap.MAP_CONTAINER).
* @returns - TheElement the DOM element for the specified element definition or NULL if unavailable.
*/
CanvasMap.prototype.GetElement=function(ElementIndex)
{ 
	return(this.Elements[ElementIndex]); 
};
/*
* Set ExistingElements to true if you want CanvasMap to get Exsiting elements from the DOM.
*/
CanvasMap.prototype.SetExistingElements=function(ExistingElements)
{ 
	this.ExistingElements=ExistingElements;
};
/**
* Helper function to turn off all the elements except the main map
*/
CanvasMap.prototype.SimpleMap=function()
{ 
	this.SetElement(CanvasMap.MAP_HEADER,null); // turn off the header with the map title
	this.SetElement(CanvasMap.TOOL_CONTAINER,null); // turn off the tool bar below the title
	this.SetElement(CanvasMap.NAVIGATION,null); // turn off the nagivation controls in the map 
	this.SetElement(CanvasMap.TAB_CONTAINER,null); // turn off the tab controls to the upper right of the map
	this.SetElement(CanvasMap.LAYER_LIST,null); // hide the list of layers that is below the tab controls
	this.SetElement(CanvasMap.BACKGROUND_LIST,null); // hide the background list
	this.SetElement(CanvasMap.SEARCH_PANEL,null); // hide the search panel
	this.SetElement(CanvasMap.MAP_FOOTER,null); // hide the map footer at the bottom of the map
	
};

//*******************************************************************************
// resize functions

/*
* Set the offset of the map to the right side of the page
*/
CanvasMap.prototype.SetMapRightOffset=function(MapRightOffset)
{ 
	this.MapRightOffset=MapRightOffset;
};
/*
* Set the offset of the map to the bottom of the page
*/
CanvasMap.prototype.SetMapBottomOffset=function(MapBottomOffset)
{ 
	this.MapBottomOffset=MapBottomOffset;
};
/*
* Set the horiziontal margin around the map and between the map and the layer list
*/
CanvasMap.prototype.SetHorizontalMargin=function(HorizontalMargin)
{ 
	this.HorizontalMargin=HorizontalMargin;
};
CanvasMap.prototype.SetResizeFlag=function(Element,Flag) 
{ 
	if (this.ResizeFlags==null) this.ResizeFlags=new Array(CanvasMap.ELEMENT_DEFS.length);
	
	this.ResizeFlags[Element]=Flag; 
};
CanvasMap.prototype.SetMobileSupported=function(MobileSupported) 
{ 
	this.MobileSupported=MobileSupported;
};

//***************************************************************************************
// private functions
//***************************************************************************************
/*
* called by Initialize() below to initialize the entries in the Elements[] array that have
* not already been intialized by the user.
*/
CanvasMap.prototype.Private_CreateElements=function()
{
	// make sure the element array has been created
	
	if (this.Elements==null) this.Elements=new Array(CanvasMap.ELEMENT_DEFS.length);
	
	for (var i=0;i<this.Elements.length;i++) // get or create each of the elements
	{
		if (this.Elements[i]===undefined) // the element has not been initlized
		{
			var ElementID=CanvasMap.ELEMENT_DEFS[i][0]+"_"+this.Index;
			
			if (this.ExistingElements) // look for an existing element in the DOM
			{
				this.Elements[i]=document.getElementById(ElementID);
			}
			if (this.Elements[i]==undefined) // the element has not been created, create it now
			{
				this.Elements[i]=document.createElement(CanvasMap.ELEMENT_DEFS[i][1]);
				this.Elements[i].id=ElementID;
			}
			if (CanvasMap.ELEMENT_DEFS[i][2]!=null)  // set the class
			{
				this.Elements[i].className=CanvasMap.ELEMENT_DEFS[i][2];
			}
		}
	}
};
//***************************************************************************************
// 
//***************************************************************************************
/*
* This is the function to call to initialize the CanvasMap.  It sets up the member variables,
* links the objects together, and sets up the event handlers.
* @public
* @param AllowMouseEvents - optional parameter, if false, distables mouse events for the map elemeents.
*/
CanvasMap.prototype.Initialize=function(AllowMouseEvents)
{
	if (AllowMouseEvents==undefined) AllowMouseEvents=true;
	
	this.Private_CreateElements();
		
	// This is the map container which is provided by the user
	
	var MapContainer=this.Elements[CanvasMap.MAP_CONTAINER];
	MapContainer.TheCanvasMap=this;
	MapContainer.OriginalMouseDown=MapContainer.onmousedown;

	// header
	
	var MapHeader=this.Elements[CanvasMap.MAP_HEADER];
	if  (CMUtilities.IsDefined(MapHeader))
	{
		MapHeader.innerHTML="<div style='margin:10px'>Canvas Maps from HSU</div>";   
		MapContainer.appendChild(MapHeader);
	}
	// tools
	
	var ToolContainer=this.Elements[CanvasMap.TOOL_CONTAINER];
	if  (CMUtilities.IsDefined(ToolContainer))
	{
		MapContainer.appendChild(ToolContainer);
	}
	
	// canvas container
	
	var CanvasContainer=this.Elements[CanvasMap.CANVAS_CONTAINER];
	if  (CMUtilities.IsDefined(CanvasContainer)) MapContainer.appendChild(CanvasContainer);
	
	var Navigation=this.Elements[CanvasMap.NAVIGATION];
	if  (CMUtilities.IsDefined(Navigation)) 
	{
		CanvasContainer.appendChild(Navigation);
		
		// add the buttons to the naviation element
		
		Navigation.innerHTML="	<table cellpadding='0' cellspacing='0'> \
			<tr> \
				<td width='35px' height='35px' align='center' valign='middle' style='border-bottom:thin solid #999'>   \
					<div id='ZoomIn' onClick='TheCanvasMap.ZoomIn();return(false)' > \
					<img class='opacity_img' src='"+this.ImageFolder+"Icon_ZoomIn_Small_17H.png' width='35' height='17' alt='Zoom In'> \
				  </div> \
				  </td> \
			</tr>    \
			<tr> \
				<td width='35px' height='35px' align='center' valign='middle'> \
				<div id='ZoomToMax' onClick='TheCanvasMap.ZoomToMax()'; > \
					<img class='opacity_img' src='"+this.ImageFolder+"Icon_HomeExtent_small_17H.png' width='35' height='17' alt='Home Extent'> \
				</div> \
				 </td> \
			</tr> \
			<tr> \
				<td width='35px' height='35px' align='center' valign='middle' style='border-top:thin solid #999'> \
				 <div id='ZoomOut' onClick='TheCanvasMap.ZoomOut();return(false)'> \
					<img class='opacity_img' src='"+this.ImageFolder+"Icon_ZoomOut_Small_17H.png' width='35' height='17' alt='Zoom Out'> \
				</div>  \
				</td> \
			</tr> \
		</table> ";
	}
	
	var TheCanvas=this.Elements[CanvasMap.CANVAS];
	if  (CMUtilities.IsDefined(TheCanvas)) 
	{
//		TheCanvas.width=500;
//		TheCanvas.height=500;
		CanvasContainer.appendChild(TheCanvas);
	}
	//****************************************************
	// layers

	var LayerList=this.Elements[CanvasMap.LAYER_LIST];
	if  (CMUtilities.IsDefined(LayerList)) 
	{
		MapContainer.appendChild(LayerList);
	}
	var BackgroundList=this.Elements[CanvasMap.BACKGROUND_LIST];
	if  (CMUtilities.IsDefined(BackgroundList)) 
	{
		BackgroundList.innerHTML="Backgrounds";
		MapContainer.appendChild(BackgroundList);
	}
	var SearchPanel=this.Elements[CanvasMap.SEARCH_PANEL];
	if  (CMUtilities.IsDefined(SearchPanel))
	{
		SearchPanel.innerHTML="Search";
		MapContainer.appendChild(SearchPanel);
	}
	//**************************************************
	// Tabs
	
	var TabContainer=this.Elements[CanvasMap.TAB_CONTAINER];
	if  (CMUtilities.IsDefined(TabContainer)) 
	{
		// create the unordered list that will contain the tabs
		
		var ul = document.createElement ("ul");
		ul.id="CM_TabUL";
		ul.className="CM_TabUL";
		
		for (var i=0;i<3;i++) // add each of the tabs
		{
			var li = document.createElement ("li");
			li.id="CM_tab_"+i;
			li.innerHTML=CanvasMap.TabNames[i];
			
			var ContentID=CanvasMap.TabContentIDs[i]+"_"+this.Index;
			li.TheContent=document.getElementById(ContentID);
			li.CanvasMap=this;
			
			li.className="CM_TabLI";
			li.Index=i;
			
			li.onclick=function() // set this as the current tab (and change the content) when clicked on
			{
				this.CanvasMap.SetCurrentTab(this.Index);
			}
			
			ul.appendChild (li);
		}
               
		TabContainer.appendChild(ul);
		
		MapContainer.appendChild(TabContainer);
	}
	
	// footer
	
	var MapFooter=this.Elements[CanvasMap.MAP_FOOTER];
	if  (CMUtilities.IsDefined(MapFooter)) 
	{
		MapContainer.appendChild(MapFooter);
		
		var TheTable= document.createElement("TABLE"); 
//		TheTable.border="1";
		TheTable.width="100%";
		
		// Create an empty <tr> element and add it to the 1st position of the table:
		var TheRow=TheTable.insertRow(0);
		
		// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
		var LeftCell=TheRow.insertCell(0);
		var RightCell=TheRow.insertCell(1);
		
		// Add some text to the new cells:
//		RightCell.innerHTML="Right Cell";
		RightCell.appendChild(this.Elements[CanvasMap.MAP_CREDITS]);
		RightCell.style.align="right";
		
		//******************************************************
		
		var TheTable2=document.createElement("TABLE"); 
//		TheTable2.border="1";
		
		// Create an empty <tr> element and add it to the 1st position of the table:
		var TheRow1=TheTable2.insertRow(0);
		
		// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
		var TopLeftCell=TheRow1.insertCell(0);
//		TopLeftCell.innerHTML="Top left";
		
		TopLeftCell.appendChild(this.Elements[CanvasMap.MAP_COORDINATES]);
		
		if (CMUtilities.IsDefined(this.Elements[CanvasMap.MAP_COORDINATES]))
		{
			var TheRow2=TheTable2.insertRow(1);
			
			var BottomLeftCell=TheRow2.insertCell(0);
			
	//		BottomLeftCell.innerHTML="Spatial Reference";
			
			BottomLeftCell.appendChild(this.Elements[CanvasMap.MAP_SRS]);
		}
		
		LeftCell.appendChild(TheTable2);
		
		MapFooter.appendChild(TheTable);
	}
	//************************************************************************
	// Add the tools container
	// The positioning of the tools is set within the CanvasMap CSS file	
	var ToolContainer=this.Elements[CanvasMap.TOOL_CONTAINER];
	if (CMUtilities.IsDefined(ToolContainer))
	{
		var ToolsTitle=this.Elements[CanvasMap.TOOLS_TITLE];
//		ToolsTitle.style.border="1px solid red"; // for debugging
		ToolsTitle.innerHTML="Toolbar";
		
		ToolContainer.appendChild(ToolsTitle);

		// add the select/arrow tool

		var ToolSelect=this.Elements[CanvasMap.TOOL_SELECT];
		ToolSelect.title='Click to get information on features or drag the map';
		ToolSelect.cursor='pointer';
		ToolSelect.innerHTML="<img id='ArrowImage' class='opacity_img' style='margin:5px 5px 0px 10px' \
		  src='"+this.ImageFolder+"IconArrow_20w_Selected.png' width='20' height='20' alt='ID Marker'>";
		ToolSelect.Message="This is a test";
		
		ToolSelect.TheCanvasMap=this;
		ToolSelect.onclick=function() { this.TheCanvasMap.ClickOnTool(CMView.TOOL_SELECT) };
		
		ToolContainer.appendChild(ToolSelect);
		
		// add the Info tool

		var ToolInfo=this.Elements[CanvasMap.TOOL_INFO];
		ToolInfo.title='Click to get information on features';
		ToolInfo.cursor='pointer';
		ToolInfo.innerHTML="<img id='InfoImage' class='opacity_img' style='margin:5px 5px 0px 10px' \
		  src='"+this.ImageFolder+"Icon_I_Default.png' width='20' height='20' alt='ID Marker'>";
		ToolInfo.Message="This is a test";
		
		ToolInfo.TheCanvasMap=this;
		ToolInfo.onclick=function() { this.TheCanvasMap.ClickOnTool(CMView.TOOL_INFO) };
		
		ToolContainer.appendChild(ToolInfo);
		
		// add the panning tool
		
		var ToolPan=this.Elements[CanvasMap.TOOL_PAN];
		ToolPan.title='Click to drag the map to the desired location';
		ToolPan.cursor='pointer';
		ToolPan.innerHTML="<img id='HandImage' class='opacity_img' style='margin:5px 5px 0px 5px' \
			src='"+this.ImageFolder+"IconHand_20w_Default.png' width='20' height='20' alt='ID Marker'>";
			
		ToolPan.TheCanvasMap=this;
		ToolPan.onclick=function(){ this.TheCanvasMap.ClickOnTool(CMView.TOOL_HAND) };
		
		ToolContainer.appendChild(ToolPan);
	}
	
	//*****************************************************
	// setup the scene and view
	
	this.TheScene=new CMScene(this);
 	this.TheView=new CMView();
	this.TheScene.AddView(this.TheView);
	this.TheView.Setup(this.Elements[CanvasMap.CANVAS]);
	
 	//*****************************************************
	// call jQuery to add the mouse handles to the canvas element
	
	if (AllowMouseEvents)
	{
		this.Elements[CanvasMap.CANVAS].TheView=this.TheView; // required by the mouse functions
		this.Elements[CanvasMap.CANVAS].TheCanvasMap=this; // allows the canvas element to acces this object
		
		this.Elements[CanvasMap.CANVAS].addEventListener("mousedown",function(TheEvent) 
		{
			if (this.TheView!=null)
			{
				this.TheView.MouseDown(TheEvent);	
				TheEvent.stopPropagation(); // stop the document from hidding a popup window
			}
		});
		this.Elements[CanvasMap.CANVAS].addEventListener("mousemove",function(TheEvent) 
		{
			if (this.TheView!=null)
			{
				this.TheView.MouseMove(TheEvent);
				
	//			if (this.TheView.Dragging==false)
				{
					this.TheView.MouseMove(TheEvent);	
					
					// update the status bar
					
					if (this.TheView!=null)
					{
						this.TheCanvasMap.Private_UpdateCoordinates(TheEvent);
					}
				}
			}
		});
		this.Elements[CanvasMap.CANVAS].addEventListener("mouseup",function(TheEvent) 
		{
			if (this.TheView!=null)
			{
				this.TheView.MouseUp(TheEvent);	
			}
		});
		//***************************************************************************************
		// jQuery does not yet support the mouse wheel so we have to do it the old way
		
		var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
		 
		if (this.Elements[CanvasMap.CANVAS].attachEvent) //if IE (and Opera depending on user setting)
		{
			this.Elements[CanvasMap.CANVAS].attachEvent("on"+mousewheelevt, CanvasMap.MouseWheel);
		}
		else
		if (this.Elements[CanvasMap.CANVAS].addEventListener) //WC3 browsers
		{
			this.Elements[CanvasMap.CANVAS].addEventListener(mousewheelevt, CanvasMap.MouseWheel, false);
		}
	}
	//*************************************************************************************
	// set the stickiness of the elements
	
	var LayerListWidth=0;
	var MapFooterHeight=0;

	if (this.Elements[CanvasMap.LAYER_LIST]!=null) // have a layer list
	{
		LayerListWidth=jQuery(this.Elements[CanvasMap.LAYER_LIST]).width(); // this works, other approaches do not
	}
	if (this.Elements[CanvasMap.MAP_FOOTER]!=null) // have a footer
	{
		MapFooterHeight=jQuery(this.Elements[CanvasMap.MAP_FOOTER]).height(); // this works, other approaches do not
	}
	
	var MapMarginRight=LayerListWidth+this.HorizontalMargin;
	
	// stickiness for the right side of the window
	
	this.Private_AddRightSticky(CanvasMap.MAP_CONTAINER,false,this.MapRightOffset); // correct
	this.Private_AddRightSticky(CanvasMap.MAP_HEADER,false,MapMarginRight); // correct
	this.Private_AddRightSticky(CanvasMap.TOOL_CONTAINER,false,MapMarginRight); // correct
	this.Private_AddRightSticky(CanvasMap.CANVAS_CONTAINER,false,MapMarginRight); // correct
	this.Private_AddRightSticky(CanvasMap.CANVAS,false,0); // correct
	
	this.Private_AddRightSticky(CanvasMap.TAB_CONTAINER,true,LayerListWidth); // correct
	
	this.Private_AddRightSticky(CanvasMap.LAYER_LIST,true,LayerListWidth); // correct
	this.Private_AddRightSticky(CanvasMap.BACKGROUND_LIST,true,LayerListWidth); // correct
	this.Private_AddRightSticky(CanvasMap.SEARCH_PANEL,true,LayerListWidth); // correct
	
	this.Private_AddRightSticky(CanvasMap.MAP_FOOTER,false,MapMarginRight); // ID,MoveFlag,
	
	// stickiness for the bottom of the window
	
	this.Private_AddBottomSticky(CanvasMap.MAP_CONTAINER,false,this.MapBottomOffset); // correct
	this.Private_AddBottomSticky(CanvasMap.CANVAS_CONTAINER,false,MapFooterHeight); // correct
	this.Private_AddBottomSticky(CanvasMap.CANVAS,false,0); // correct
	
	this.Private_AddBottomSticky(CanvasMap.LAYER_LIST,false,MapFooterHeight); // correct
	this.Private_AddBottomSticky(CanvasMap.BACKGROUND_LIST,false,MapFooterHeight); // correct
	this.Private_AddBottomSticky(CanvasMap.SEARCH_PANEL,false,MapFooterHeight); // correct
	
	this.Private_AddBottomSticky(CanvasMap.MAP_FOOTER,true,MapFooterHeight); // correct
	
	//*********************************************************
	// setup gesture support using hammer.js
	
	var MapHeader=this.GetElement(CanvasMap.MAP_HEADER);
	var MapContainer=this.GetElement(CanvasMap.CANVAS_CONTAINER);

	if (this.MobileSupported)
	{
		// create a simple instance
		// by default, it only adds horizontal recognizers
		var mc = new Hammer(MapContainer);
		
		// let the pan gesture support all directions.
		// this will block the vertical scrolling on a touch-device while on the element
		mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
		var pinch = new Hammer.Pinch();
		
		mc.add([pinch]);
		
		mc.TheCanvasMap=this;
		
		// listen to events...
		mc.on("pinch panleft panright panup pandown", function(ev)  //  tap press
		{
			var TheView=mc.TheCanvasMap.GetView();
			var RefDistance=TheView.GetRefWidthFromPixelWidth(CanvasMap.GESTURE_PAN);
			var RefCenter=TheView.GetRefCenter();
			var RefX=RefCenter.RefX;
			var RefY=RefCenter.RefY;
	
			MapHeader.innerHTML=ev.type;
			
			if (ev.type=="panup")
			{
				RefY-=RefDistance;
				mc.TheCanvasMap.SetRefCenter(RefX,RefY); // set the center of the map
			}
			else if (ev.type=="pandown")
			{
				RefY+=RefDistance;
				mc.TheCanvasMap.SetRefCenter(RefX,RefY); // set the center of the map
			}
			else if (ev.type=="panleft")
			{
				RefX+=RefDistance;
				mc.TheCanvasMap.SetRefCenter(RefX,RefY); // set the center of the map
			}
			else if (ev.type=="panright")
			{
				RefX-=RefDistance;
				mc.TheCanvasMap.SetRefCenter(RefX,RefY); // set the center of the map
			}
			else if (ev.type=="pinch")
			{
				var ZoomLevel=TheView.GetZoomLevel();
				
				MapHeader.textContent = ev.additionalEvent ;
				if (ev.additionalEvent=="pinchin")
				{
					TheView.ZoomTo(ZoomLevel-CanvasMap.GESTURE_ZOOM);
				}
				else
				{
					TheView.ZoomTo(ZoomLevel+CanvasMap.GESTURE_ZOOM);
				}
			}
		});	 // end of: mc.on("pinch panleft panright panup pandown", function(ev) 
	}
};

//***************************************************************************************
// CanvasMap functions that can be called after initialize()
//***************************************************************************************

//***************************************************************************************
// Stickyness

/*
* Makes an element "sticky" to the right side of the page (i.e. the width will resize)
* @public
* @param TheElement - the element to make sticky
* @param MoveFlag - true to move, false to size
* @param Offset - number of pixels to offset the element from the right side of the frame
*/
CanvasMap.prototype.AddRightSticky=function(TheElement,MoveFlag,Offset) 
{
	if (this.RightSticky==null) this.RightSticky=[];
	
	var TheObject={
		TheElement:TheElement,
		MoveFlag:MoveFlag,
		Offset:Offset};
		
	this.RightSticky.push(TheObject);
};
/*
* Makes an element "sticky" to the bottom of the page (i.e. the height will resize)
* @public
* @param TheElement - the element to make sticky
* @param MoveFlag - true to move, false to size
* @param Offset - number of pixels to offset the element from the bottom of the frame
*/
CanvasMap.prototype.AddBottomSticky=function(TheElement,MoveFlag,Offset) 
{
	if (this.BottomSticky==null) this.BottomSticky=[];
	
	var TheObject={
		TheElement:TheElement,
		MoveFlag:MoveFlag,
		Offset:Offset};
		
	this.BottomSticky.push(TheObject);
};

//***************************************************************************************
// Gets and sets

/**
* Return the scene object that contains the layers for the map
* @public
* @returns TheScene - the current scene for this map.
*/
CanvasMap.prototype.GetScene=function() { return(this.TheScene); };

/**
* Return the view object for the map
* @public
* @returns TheView - the current view for this scene.
*/
CanvasMap.prototype.GetView=function() { return(this.TheView); };

/**
* Set the projection for coordinate conversion
* @public
* @param TheProjector - the projector to use to project coordinates
*/
CanvasMap.prototype.SetProjector=function(TheProjector) { this.TheProjector=TheProjector; };
CanvasMap.prototype.GetProjector=function() { return(this.TheProjector); };

/**
* Set the maximum bounds for the map to be panned to
* @public
* @param TheBounds - bounds defined by { XMin,XMax,YMin,YMax }
*/
CanvasMap.prototype.SetMaxBounds=function(TheBounds) 
{ 
	if (this.TheView==null) { alert("Sorry, CanvasMap.SetMaxBounds() cannot be called until after Initialize() is called()"); }
	else this.TheView.SetMaxBounds(TheBounds); 
};
/**
* Set the minimum and maximum zoom values
* @public
* @param MinZoom
* @param MaxZoom
*/
CanvasMap.prototype.SetZoomRange=function(MinZoom,MaxZoom) 
{ 
	if (this.TheView==null) { alert("Sorry, CanvasMap.SetZoomRange() cannot be called until after Initialize() is called()"); }
	else this.TheView.SetZoomRange(MinZoom,MaxZoom); 
};

/**
* Set the current tool selected for interacting with the map
* @public
* @param NewTool - sets the current tool (e.g. CMView.TOOL_INFO)
*/
CanvasMap.prototype.SelectTool=function(NewTool) 
{ 
	if (this.TheView==null) { alert("Sorry, CanvasMap.SelectTool() cannot be called until after Initialize() is called()"); }
	this.TheView.SetTool(NewTool);
};
/*
* Set the tab that is currently displayed based on an index to the
* tabs from left to right.
* @public
* @param TabIndex - desired tab index (0 for layer list, 1 for backgrounds, 2 for search)
*/
CanvasMap.prototype.SetCurrentTab=function(TabIndex)
{
	// hide the content for all the tabs except the one selected
	
	for (var i=0;i<3;i++)
	{
		if (i!=TabIndex)
		{
			var TheTab1=document.getElementById("CM_tab_"+i);
			
			if (CMUtilities.IsDefined(TheTab1))
			{
				TheTab1.className="CM_TabLI";
				
				if (TheTab1.TheContent!=null) TheTab1.TheContent.style.visibility = 'hidden';
			}
		}
	}
	// make the selected tab highlighted and it's content visible
	
	var TabID="CM_tab_"+TabIndex;
	var TheTab=document.getElementById(TabID);
	
	if (CMUtilities.IsDefined(TheTab))
	{
		TheTab.className="CM_TabLI_Selected";
		
		TheTab.TheContent.style.visibility = 'visible';
	}
};

//***************************************************************************************
// Add layers

/*
* Add a layer to the map.  The layer will be on top of other layers
* @public
* @param NewLayer - CMLayer object to add to the map
*/
CanvasMap.prototype.AddLayer=function(NewLayer) 
{ 
	if (this.TheScene==null) { alert("Sorry, CanvasMap.SetMaxBounds() cannot be called until after Initialize() is called()"); }
	else 
	{
		this.TheScene.AddLayer(NewLayer);
	}
};
/*
* Add background to the list
* @public
* @param NewLayer - CMLayer object to add to the backgrounds.  Only one background will
*  appear and it will always be behind the other layers.
*/
CanvasMap.prototype.AddBackground=function(NewLayer) 
{ 
	if (this.TheScene==null) { alert("Sorry, CanvasMap.SetMaxBounds() cannot be called until after Initialize() is called()"); }
	else 
	{
		this.TheScene.AddBackground(NewLayer);
	}
};
//********************************************************************************
// StartMap function
//********************************************************************************

/*
* StartMap() should be called after all the layers are added to start up the map and
* fill out the layer list.  Layers can be added and removed later as well but the user
* may see them being added.
* @public
* @param ResizeFlag - If true, the map will be resized right away.  Otherwise, the size
*  of the canvas map container will be used for the canvas.
*/
CanvasMap.prototype.StartMap=function(ResizeFlag) 
{
	if (this.Elements[CanvasMap.LAYER_LIST]!=null)
	{
		this.TheScene.AddLayerList(this.Elements[CanvasMap.LAYER_LIST]);
	}
	
	if (this.Elements[CanvasMap.BACKGROUND_LIST]!=null)
	{
//		var BackgroundPanel=document.getElementById(this.BackgroundListID); // image
	
		this.TheScene.AddBackgroundList(this.Elements[CanvasMap.BACKGROUND_LIST]);
	}
	
	if (this.Elements[CanvasMap.SEARCH_PANEL]!=null)
	{
		var SearchPanel=this.Elements[CanvasMap.SEARCH_PANEL];
		
		SearchPanel.innerHTML="Search:";
		
		// create the div for the search rseults but don't add it yet
		
		var SearchResults = document.createElement("DIV");
		SearchResults.id="CM_SearchResults";
		
		// add the text field
		
		var TextField = document.createElement("INPUT");
		TextField.setAttribute("type", "text"); 
		SearchPanel.appendChild(TextField);
		
		// add the search button
		
		var SearchButton = document.createElement("INPUT");
		SearchButton.setAttribute("type", "button"); 
		SearchButton.value="Submit";
		SearchButton.className="CM_SearchButton";
		
		SearchButton.TextField=TextField;
		SearchButton.CanvasMap=this;
		SearchButton.SearchResults=SearchResults;
		
		SearchButton.onclick=function()
		{
			var Text=this.TextField.value;
			
			Text=Text.toLowerCase();
			
			SearchResults.innerHTML="";
			this.CanvasMap.TheScene.GetSearchResults(Text,SearchResults);	
		}
		SearchPanel.appendChild(SearchButton);
		
		// add the results after the button
		
		SearchPanel.appendChild(SearchResults);
	}
	
	if (ResizeFlag) 
	{
		this.Resize();
	}
	else 
	{
		// the canvas aspect ratio is not correct unless we set the "width" and "height" of the element
		// rather than the style.  This must be done or it will display maps distorted
		
		var TheCanvasConatiner=this.GetElement(CanvasMap.CANVAS_CONTAINER);
		var TheCanvas=this.GetElement(CanvasMap.CANVAS);
		
		var ParentWidth=jQuery(TheCanvasConatiner).width();
		TheCanvas.width=ParentWidth;		

		TheCanvas.height=jQuery(TheCanvasConatiner).height();

		this.TheView.Paint();
	}
	this.SetCurrentTab(0);
};
//***************************************************************************************
// Private functions
//***************************************************************************************
/*
* Called to update the scene position when a coordinate did not change
*/
CanvasMap.prototype.Private_UpdateScenePosition=function() 
{
/*	if (this.Elements[CanvasMap.MAP_FOOTER]!=undefined)
	{
		var Text="Zoom: "+this.TheView.ZoomLevel;
	
//		var Output=document.getElementById(this.StatusBarID);

		this.Elements[CanvasMap.MAP_FOOTER].innerHTML=Text;
	}*/
};

CanvasMap.prototype.GetCoordinateString=function(RefX,RefY)
{
	var Text="";

	switch (this.CoordinateUnits)
	{
	case CanvasMap.COORDINATES_UNITS_DD:
		{
			if (this.TheProjector!=null) //Text="Sorry, we need a projector to show geographic coordinates with projected data";
			{
				var GeographicCoordinate=this.TheProjector.ProjectToGeographic(RefX,RefY);
				
				RefX=GeographicCoordinate.Longitude;
				RefY=GeographicCoordinate.Latitude;
			}
			// limit the number of decimal points
			
			RefX=Math.floor(RefX*10000)/10000;
			RefY=Math.floor(RefY*10000)/10000;
							
			var LongitudeSymbol=CMUtilities.GetSymbol(RefX,true);
			var LatitudeSymbol=CMUtilities.GetSymbol(RefY,false);
			
			if (RefX<0) RefX=-RefX;
			if (RefY<0) RefY=-RefY;
			
			Text+=""+RefY+"&deg; "+LatitudeSymbol+" "+RefX+"&deg; "+LongitudeSymbol;
		}
		break;
	case CanvasMap.COORDINATES_UNITS_DMS:
		{
			if (this.TheProjector!=null) //Text="Sorry, we need a projector to show geographic coordinates with projected data";
			{
				var GeographicCoordinate=this.TheProjector.ProjectToGeographic(RefX,RefY);
				
				RefX=GeographicCoordinate.Longitude;
				RefY=GeographicCoordinate.Latitude;
			}
			Text+=CMUtilities.GetDMSFromLonLat(RefX,RefY);
		}
		break;
	case CanvasMap.COORDINATES_UNITS_FEET:
	case CanvasMap.COORDINATES_UNITS_METERS:
		{
			Text+=CMUtilities.GetTextFromEastingNorthing(RefX,RefY);
		}
		break;
	case CanvasMap.COORDINATE_UNITS_PIXELS: // for debugging
		{
			Text+=""+PixelX+", "+PixelY;
		}
		break;
	case CanvasMap.COORDINATE_UNITS_ZOOM:
		{
			var TheView=this.TheScene.GetView(0);
			Text+=TheView.GetZoomLevel();
		}
		break;
	}
	return(Text);
}

CanvasMap.prototype.Private_UpdateCoordinates=function(TheEvent) 
{
	if (CMUtilities.IsDefined(this.Elements[CanvasMap.MAP_COORDINATES]))
	{
		var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.Elements[CanvasMap.CANVAS]);
		var PixelX=Coordinate.x;
		var PixelY=Coordinate.y;

		var RefX=this.TheView.GetRefXFromPixelX(PixelX);
		var RefY=this.TheView.GetRefYFromPixelY(PixelY);
	
		var Text=this.GetCoordinateString(RefX,RefY);
		
		if (Text=="") Text="&nbsp;";
		this.Elements[CanvasMap.MAP_COORDINATES].innerHTML=Text;
	}
};
//***************************************************************************************
// CanvasMap functions that are not typically called by other classes but can be if needed
//***************************************************************************************
/*
* Paints the canvas map area.  The layers will be automatically repainted as needed so this
* does not normally need to be called
*/
/*
CanvasMap.prototype.Paint=function() 
{
	if (this.TheView!=null) // this function can be called before everything is initialized
	{
		this.TheView.Paint();
	}
};*/
//*************************************************************************************
// Functions called by GUI widgets
//*************************************************************************************
/*
* called to zoom the map in by 2x
* @public
*/
CanvasMap.prototype.ZoomIn=function() 
{
	if (this.TheView!=null)
	{
		this.TheView.ZoomIn();
		this.Private_UpdateScenePosition();
		this.TheScene.ZoomLevelChanged();
	}
	return(false);
};
/*
* called to zoom the map out by 2x
* @public
*/
CanvasMap.prototype.ZoomOut=function() 
{
	if (this.TheView!=null)
	{
		this.TheView.ZoomOut();
//		this.Paint();
		this.Private_UpdateScenePosition();
		this.TheScene.ZoomLevelChanged();
	}
};
/**
* Zooms the map to the maximum specified value
* @public
*/
CanvasMap.prototype.ZoomToMax=function() 
{
	var SceneBounds=this.TheScene.GetBounds();
	
	if (SceneBounds!=null)
	{
		this.TheView.ZoomToBounds(SceneBounds);
		
		this.Private_UpdateScenePosition();
		this.TheScene.ZoomLevelChanged();
	}
};
/*
* called to zoom the map to a specific area of the scene.
* @public
* @param TheBounds - boundary object { XMin,XMax,YMin,YMax}
*/
CanvasMap.prototype.ZoomToBounds=function(TheBounds) 
{ 
	if (this.TheView==null) { alert("Sorry, CanvasMap.SetMaxBounds() cannot be called until after Setup() is called()"); }
	else this.TheView.ZoomToBounds(TheBounds); 
	this.Private_UpdateScenePosition();
	this.TheScene.ZoomLevelChanged();
};
/**
* Zooms to the specified zoom level
* @public
* @param ZoomLevel - level to zoom to, 1=1 pixel per map unit, 2=pixels per map unit, etc.)
*/
CanvasMap.prototype.ZoomTo=function(ZoomLevel) 
{ 
	if (this.TheView==null) { alert("Sorry, CanvasMap.SetMaxBounds() cannot be called until after Setup() is called()"); }
	else this.TheView.ZoomTo(ZoomLevel); 
	this.Private_UpdateScenePosition();
	this.TheScene.ZoomLevelChanged();
};
/**
* Centers the map at RefX,RefY
* @public
* @param RefX - Longitude or easting for the center of the map
* @param RefY - Latitude or northing for the center of the map
*/
CanvasMap.prototype.SetRefCenter=function(RefX,RefY) 
{ 
	if (this.TheView==null) { alert("Sorry, CanvasMap.SetMaxBounds() cannot be called until after Setup() is called()"); }
	else this.TheView.SetRefCenter(RefX,RefY); 
	this.Private_UpdateScenePosition();
	this.TheScene.ZoomLevelChanged();
};

/**
* Called to resize the map
* @public
* @param ParentElement - The DOM objet to size the map to.
*/
CanvasMap.prototype.Resize=function(ParentElement) 
{
	CanvasMap.HidePopupWindow();
	
	var DocumentWidth=$(window).width();
	var DocumentHeight=$(window).height(); 

	if (this.RightSticky!=null) 
	{
		for (var i=0;i<this.RightSticky.length;i++)
		{
			var TheSticky=this.RightSticky[i];
			var TheElement=TheSticky.TheElement;
			
			var TheParent=TheElement.parentNode;
			var ParentWidth=jQuery(TheParent).width();
			
			if (i==CanvasMap.MAP_CONTAINER) // jjg=kludge for now as jQuery returns some object's widdth that is the same as the map container
			{
				ParentWidth=DocumentWidth;
			}
			if (TheSticky.MoveFlag)
			{
				var Temp=(ParentWidth-TheSticky.Offset)+"px";
				TheElement.style.left=Temp;
			}
			else // sizing
			{
				var ThePosition=jQuery(TheElement).position(); // strips the "px" off the dimensions
				
//				var Width=(DocumentWidth-TheSticky.Offset-ThePosition.left);
				var Width=(ParentWidth-TheSticky.Offset-ThePosition.left);
				
				if (TheElement.tagName=="CANVAS")
				{
					TheElement.width=Width;
				}
				else
				{
					TheElement.style.width=Width+"px";
				}
			}
		}
	}

	if (this.BottomSticky!=null) 
	{
		for (var i=0;i<	this.BottomSticky.length;i++)
		{
			var TheSticky=this.BottomSticky[i];
			var TheElement=TheSticky.TheElement;
			
			var TheParent=TheElement.parentNode;
			var ParentHeight=jQuery(TheParent).height();

			if (i==CanvasMap.MAP_CONTAINER) // jjg=kludge for now as jQuery returns some object's widdth that is the same as the map container
			{
				ParentHeight=DocumentHeight;
			}
			
			if (TheSticky.MoveFlag)
			{
				TheElement.style.top=(ParentHeight-TheSticky.Offset)+"px";
			}
			else // sizing
			{
				var ThePosition=jQuery(TheElement).position(); // strips the "px" off the dimensions
				
				var Height=(ParentHeight-TheSticky.Offset-ThePosition.top);
				
				if (TheElement.tagName=="CANVAS")
				{
					TheElement.height=Height;
				} 
				{
					TheElement.style.height=Height+"px";
				}
			}
		}
	}
	
	this.TheScene.Resize();
	
	this.TheView.Paint();
};
