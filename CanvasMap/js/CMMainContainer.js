/***************************************************************************************
* CMMainContainer Class
*
* Main class to contain the other elements and objects that make up a CMMainContainer.
*
* The elements for a CMMainContainer are held in an array, 
* @module CMMainContainer
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
	
	if (CMMainContainer.PopupWindow!==null) 
	{
		TargetContainedInPopupWindow=jQuery.contains( CMMainContainer.PopupWindow, TheEvent.target ) ;
	}
	var TargetIsPopupWindow=false;
	if (TheEvent.target===CMMainContainer.PopupWindow) { TargetIsPopupWindow=true; }
	
	if ((TargetContainedInPopupWindow===false)&&(TargetIsPopupWindow===false))
	{
	   CMMainContainer.HidePopupWindow();	
	}
};

/**
* Sets the current popup window and hides any existing windows
* @public
* @param NewPopupWindow - the DOM element with the visible window
*/
CMMainContainer.SetPopupWindow=function(NewPopupWindow)
{ "use strict";
	CMMainContainer.HidePopupWindow();
	CMMainContainer.PopupWindow=NewPopupWindow;
};

/**
* Sets the current popup window and hides any existing windows
* @public
*/
CMMainContainer.HidePopupWindow=function() 
{ "use strict";
	if (CMMainContainer.PopupWindow!==null)
	{
		CMMainContainer.PopupWindow.style.visibility="hidden";
	}
	CMMainContainer.PopupWindow=null;
};

//***************************************************************************************
// Definitions
// The following definitions should be treated as "static" and should not be 
// modified by users of CMMainContainer
//***************************************************************************************

/**
* Defniitions for the DOM elements within a CMMainContainer
* Indexes into the CMMainContainer.ELEMENT_DEFS array
* @public, @enum
*/
CMMainContainer.MAP_CONTAINER=0; // main container with all the panels

CMMainContainer.TOOL_CONTAINER=1; // tools above map
CMMainContainer.TOOL_EDIT=2; // arrow tool
CMMainContainer.TOOL_INFO=3; /// "i" tool
CMMainContainer.TOOL_PAN=4; // hand tool

CMMainContainer.CANVAS_CONTAINER=5; // container for the canvas object
CMMainContainer.CANVAS=6; 
CMMainContainer.LAYER_LIST=7; // list of layers contained within the TAB_CONTAINER
CMMainContainer.MAP_FOOTER=8; // footer with coordinates, SRS, and authors
CMMainContainer.MAP_COORDINATES=9;
CMMainContainer.MAP_SRS=10; // 
CMMainContainer.MAP_CREDITS=11; // 
CMMainContainer.NAVIGATION=12; // navigvation buttons (jjg no longer used)

CMMainContainer.BACKGROUND_LIST=13;
CMMainContainer.SEARCH_PANEL=14;
CMMainContainer.VERTICAL_TAB_CONTAINER=15;
CMMainContainer.HORIZIONAL_TAB_CONTAINER=16;
CMMainContainer.SETTINGS_PANEL=17;
CMMainContainer.TIME_EDITOR_PANEL=18;
CMMainContainer.ATTRIBUTE_PANEL=19;
CMMainContainer.TIME_SLIDER_PANEL=20;

CMMainContainer.NUM_ELEMENTS=21;
/**
* Definitions for the mobile device gesture events
*/
CMMainContainer.GESTURE_ZOOM=0.2; // how much to add to the zoom on a pinch event
CMMainContainer.GESTURE_PAN=8; // how many pixels to move the map on a pan event

// Global variable to count the total number of maps created on one web page.
// This value is saved as the index into each CMMainContainer and then incremented each time a map is created. 
// The value is also added to the end of all ElementIDs to make them unique for each map.

CMMainContainer.NumMaps=0; 

// keeps track of a popup window that is currently displayed so it can be hidden if the
// user clicks anywhere in the document

CMMainContainer.PopupWindow=null;

/**
* Definitions for the elements within the CMMainContainer.  
* @private
*/
CMMainContainer.ELEMENT_DEFS=[
	// ID_0							HTML tag		css className
	["CM_MapContainer",				"div",			"CM_MapContainer"], // 0
	["CM_ToolContainer",			"div",			"CM_ToolContainer"], // 1
	["CM_ToolEdit",					"div",			"CM_Tool"], // 2
	["CM_ToolInfo",					"div",			"CM_Tool"], // 3
	["CM_ToolPan",					"div",			"CM_Tool"], // 4
	["CM_CanvasContainer",			"div",			"CM_CanvasContainer"], // 5
	["CM_Canvas",					"CANVAS",		"CM_Canvas"], // 6
	["CM_LayerList",				"div",			"CM_TabContent"], // 7
	["CM_MapFooter",				"div",			"CM_MapFooter"], // 8
	["CM_MapCoordinates",			"div",			"CM_Credits"], // 9
	["CM_SRS",						"div",			"CM_Credits"], // 10
	["CM_Credits",					"div",			"CM_Credits"], // 11
	["CM_Navigation",				"div",			"CM_Navigation"], // 12
	["CM_BackgroundList",			"div",			"CM_TabContent"], // 13
	["CM_SearchPanel",				"div",			"CM_TabContent"], // 14
	["CM_TabContainer",				"div",			"CM_TabContainer"], //  15
	["CM_HorizontalTabContainer",	"div",			"CM_HorizontalTabContainer"], //  16
	["CM_SettingsPanel",			"div",			"CM_TabContent"], // 17
	["CM_TimeEditPanel",			"div",			"CM_TimeEditPanel"], // 18
	["CM_AttributePanel",			"div",			"CM_AttributePanel"], // 19
	["CM_TimeSliderPanel",			"div",			"CM_TimeSliderPanel"] // 20
];

//***************************************************************************************
// Constructors
//***************************************************************************************
/**
* Constructor for the main CMMainContainer object
* @public, @constructs
*/
function CMMainContainer() 
{ "use strict";

	//*****************************
	// settings (move into settings
	
//	this.ResizeFlags=null; // object containing flags (true/false) for if we should resize an element
	this.ExistingElements=true; // true when we need to search for existing elements in the DOM
	
	this.ImageFolder="../Images/";
	
	// dimensional settings
	
//	this.MapRightOffset=30;
//	this.MapBottomOffset=30;
	this.HorizontalMargin=10;
	
	this.MobileSupported=false;
	
	//*****************************
	// other properties
	
	this.Index=CMMainContainer.NumMaps; // set the index for this map
	CMMainContainer.NumMaps++; // increment the index for the next map
	
	this.TheScene=null; // child?
	
	// Array for the elements in the CMMainContainer.  The array entrie will be initialized to undefined
	// when first used.  The user can set the entries to null to prevent an element from being created.
	this.Elements=null;
	
	this.Test=false; // flag for Jim to test stuff without breaking the map
	
	// panel objects for managing the map elements
	
	this.DebugPanel=null;
	this.ToolPanel=null;
	this.PanelFooter=null;

	this.PanelSettings=null;
	this.PanelLayerList=null;
	this.PanelBackgrounds=null;
	this.PanelSearch=null;
}
CMMainContainer.prototype=Object.create(CMBase.prototype); // inherit prototype functions from PanelBase()

CMMainContainer.prototype.contructor=CMMainContainer; // override the constructor to go to ours

CMMainContainer.prototype.SetTest=function(New) { this.Test=New; };

//***************************************************************************************
// Private functions 
//***************************************************************************************
/*
* Takes over the mouse wheel.  CMMainContainer adds this as an event handler on initialization.
* @private
*/
CMMainContainer.MouseWheel=function(TheEvent)
{ "use strict";
	var Result; // return result is undefined typically
	
	CMMainContainer.HidePopupWindow(); // static function
	
	var TheEvent=window.event || TheEvent // grab the event passed in or globally (IE compatibility)
	
	var Result=this.TheCanvasMap.TheScene.GetView(0).MouseWheel(TheEvent);
		
	return(Result);
};
/*
* called by Initialize() below to initialize the entries in the Elements[] array that have
* not already been intialized by the user.
* @private
*/
CMMainContainer.prototype.Private_CreateElements=function()
{
	// make sure the element array has been created
	
	if (this.Elements==null) this.Elements=new Array(CMMainContainer.NUM_ELEMENTS);
	
	for (var i=0;i<this.Elements.length;i++) // get or create each of the elements
	{
		if (this.Elements[i]===undefined) // the element has not been initlized
		{
			var ElementID=CMMainContainer.ELEMENT_DEFS[i][0]+"_"+this.Index;
			
			if (this.ExistingElements) // look for an existing element in the DOM
			{
				this.Elements[i]=document.getElementById(ElementID);
			}
			if (this.Elements[i]==undefined) // the element has not been created, create it now
			{
				this.Elements[i]=document.createElement(CMMainContainer.ELEMENT_DEFS[i][1]);
				this.Elements[i].id=ElementID;
			}
			if (CMMainContainer.ELEMENT_DEFS[i][2]!=null)  // set the class
			{
				this.Elements[i].className=CMMainContainer.ELEMENT_DEFS[i][2];
			}
		}
	}
};
//***************************************************************************************
// CMMainContainer functions to be called before Initialize() is called.  These functions setup
// connections with the DOM objects and set the behavior of the map.
//***************************************************************************************

/**
* Sets the folder containing the images for the CMMainContainer interface
* @public
* @param ImageFolder - path to the folder with the images
*/
CMMainContainer.prototype.SetImageFolder=function(ImageFolder)
{  "use strict";
	this.ImageFolder=ImageFolder; 
};
/** 
* Changes the coordinate units
* @public
* @param CoordinateUnits - one of the coordinate definitions:
* - CMUtilities.COORDINATE_UNITS_DD=0;
* - CMUtilities.COORDINATE_UNITS_DMS=1;
* - CMUtilities.COORDINATE_UNITS_METERS=2;
* - CMUtilities.COORDINATE_UNITS_FEET=3;
* - CMUtilities.COORDINATE_UNITS_PIXELS=4; // displays the pixel level coordinates for debugging
* - CMUtilities.COORDINATE_UNITS_ZOOM=5; // displays the zoom level for debugging
*/
CMMainContainer.prototype.SetCoordinateUnits=function(CoordinateUnits) 
{ 
	if (this.PanelFooter!=null)
	{
		this.PanelFooter.CoordinateUnits=CoordinateUnits;
	}
};
/**
* Sets the element for the debugging panel to show debuging messages
* @public
* @param NewDebugPanel - DOM element for the text (can just be a div element)
*/
CMMainContainer.prototype.SetDebugPanel=function(NewDebugPanel)
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
CMMainContainer.prototype.AddToDebugPanel=function(NewHTML)
{ 
	if (this.DebugPanel!=null)
	{
		this.DebugPanel.innerHTML+=NewHTML+"<br>";
	}
};

//***************************************************************************************
// Element functions
/*
* Function to provide an existnig element in place of the one that CMMainContainer 
* will create by default.  The user can also specify "null" which will prevent
* the element from being created.
* @public
* @param ElementIndex - CMMainContainer element definition for the element to set (i.e. CMMainContainer.MAP_CONTAINER).
* @param Element - the element to replace the standard CMMainContainer element
*/
CMMainContainer.prototype.SetElement=function(ElementIndex,Element)
{ 
	if (this.Elements==null) this.Elements=new Array(CMMainContainer.NUM_ELEMENTS);
	
	if (typeof(Element)=="string") // an ID was specified, find the existing element.
	{
		Element=document.getElementById(Element);
	}
	// save the element to replace the default one.
	
	this.Elements[ElementIndex]=Element; 
};
/*
* Get the element from CMMainContainer based on the predefined indexes
* @public
* @param ElementIndex - CMMainContainer element definition for the element to set (i.e. CMMainContainer.MAP_CONTAINER).
* @returns - TheElement the DOM element for the specified element definition or NULL if unavailable.
*/
CMMainContainer.prototype.GetElement=function(ElementIndex)
{ 
	return(this.Elements[ElementIndex]); 
};
/*
* Set ExistingElements to true if you want CMMainContainer to get Exsiting elements from the DOM.
*//*
CMMainContainer.prototype.SetExistingElements=function(ExistingElements)
{ 
	this.ExistingElements=ExistingElements;
};*/
/**
* Helper function to turn off all the elements except the main map
*/
CMMainContainer.prototype.SimpleMap=function()
{ 
	this.SetElement(CMMainContainer.TOOL_CONTAINER,null); // turn off the tool bar below the title
	this.SetElement(CMMainContainer.NAVIGATION,null); // turn off the nagivation controls in the map 
	this.SetElement(CMMainContainer.VERTICAL_TAB_CONTAINER,null); // turn off the tab controls to the upper right of the map
	this.SetElement(CMMainContainer.LAYER_LIST,null); // hide the list of layers that is below the tab controls
	this.SetElement(CMMainContainer.BACKGROUND_LIST,null); // hide the background list
	this.SetElement(CMMainContainer.SEARCH_PANEL,null); // hide the search panel
	this.SetElement(CMMainContainer.SETTINGS_PANEL,null); // hide the search panel
	this.SetElement(CMMainContainer.MAP_FOOTER,null); // hide the map footer at the bottom of the map
};

//*******************************************************************************
// resize functions

/*
* Set the offset of the map to the right side of the page
*//*
CMMainContainer.prototype.SetMapRightOffset=function(MapRightOffset)
{ 
	this.MapRightOffset=MapRightOffset;
};*/
/*
* Set the offset of the map to the bottom of the page
*//*
CMMainContainer.prototype.SetMapBottomOffset=function(MapBottomOffset)
{ 
	this.MapBottomOffset=MapBottomOffset;
};*/
/*
* Set the horiziontal margin around the map and between the map and the layer list
*//*
CMMainContainer.prototype.SetHorizontalMargin=function(HorizontalMargin)
{ 
	this.HorizontalMargin=HorizontalMargin;
};*//*
CMMainContainer.prototype.SetResizeFlag=function(Element,Flag) 
{ 
	if (this.ResizeFlags==null) this.ResizeFlags=new Array(CMMainContainer.NUM_ELEMENTS);
	
	this.ResizeFlags[Element]=Flag; 
};*/
CMMainContainer.prototype.SetMobileSupported=function(MobileSupported) 
{ 
	this.MobileSupported=MobileSupported;
};


//***************************************************************************************
// 
//***************************************************************************************

/*
* This is the function to call to initialize the CMMainContainer.  It sets up the member variables,
* links the objects together, and sets up the event handlers.
* @public 
* @param AllowMouseEvents - optional parameter, if false, distables mouse events for the map elemeents.
*/
CMMainContainer.prototype.Initialize=function(AllowMouseEvents,Create3DScene)
{
	if (AllowMouseEvents==undefined) AllowMouseEvents=true;
	
	this.Private_CreateElements();
		
	//*****************************************************
	// setup the scene and view
	
	var TheView;
	
	if (Create3DScene===true) // create a 3D view
	{
		this.TheScene=new CMScene3D();
		TheView=new CMView3D( );
	}
	else
	{
		this.TheScene=new CMScene(this);
		TheView=new CMView2D();
	}
	this.TheScene.SetParent(this);
	
	this.TheScene.AddView(TheView);
	
	TheView.Setup(this.Elements[CMMainContainer.CANVAS_CONTAINER],this.Elements[CMMainContainer.CANVAS]);
	
	// This is the map container which is provided by the user
	
	var MapContainer=this.Elements[CMMainContainer.MAP_CONTAINER];
	MapContainer.TheCanvasMap=this;
	MapContainer.OriginalMouseDown=MapContainer.onmousedown;

	var CanvasContainer=this.Elements[CMMainContainer.CANVAS_CONTAINER];
	if  (CMUtilities.IsDefined(CanvasContainer)) 
	{
		MapContainer.appendChild(CanvasContainer);
	}
	var TheCanvasElement=this.Elements[CMMainContainer.CANVAS];
	if  (CMUtilities.IsDefined(TheCanvasElement)) 
	{
		CanvasContainer.appendChild(TheCanvasElement);
	}
	
	//******************************************************
	// tools
	
	var ToolContainer=this.Elements[CMMainContainer.TOOL_CONTAINER];
	if  (CMUtilities.IsDefined(ToolContainer))
	{
		MapContainer.appendChild(ToolContainer);
	}
	
	//**************************************************
	// Tabs
	
	var TabContainer=this.Elements[CMMainContainer.VERTICAL_TAB_CONTAINER];
	if  (CMUtilities.IsDefined(TabContainer)) 
	{
		this.TabPanel=new CMPanelTabs(this);
		
		this.TabPanel.SetElement(TabContainer);
	
		MapContainer.appendChild(TabContainer);
		
		// panel for layers
		
		var LayerListElement=this.Elements[CMMainContainer.LAYER_LIST];
		if  (CMUtilities.IsDefined(LayerListElement)) 
		{
			this.PanelLayerList=new CMPanelLayerList(this);
		
			var TheLayerListTab=this.TabPanel.AddTab("Layers","Layers",undefined,LayerListElement);
			
			this.PanelLayerList.SetElement(LayerListElement); // connect the settings panel to it's DIV element
		}
		
		// panel for settings
		
		var SettingsPanelElement=this.Elements[CMMainContainer.SETTINGS_PANEL];
		if  (CMUtilities.IsDefined(SettingsPanelElement)) 
		{
			this.PanelSettings=new CMPanelSettings(this);
		
			var TheSettingsTab=this.TabPanel.AddTab("Settings","Settings",null,SettingsPanelElement);
			
			this.PanelSettings.SetElement(SettingsPanelElement); // connect the settings panel to it's DIV element
		}
	
		// panel for background layers
		
		var PanelBackgroundsElement=this.Elements[CMMainContainer.BACKGROUND_LIST];
		if  (CMUtilities.IsDefined(PanelBackgroundsElement)) 
		{
			this.PanelBackgrounds=new CMPanelBackgrounds(this);
		
			var TheBackgroundsTab=this.TabPanel.AddTab("Background","Background",null,PanelBackgroundsElement);
			
			this.PanelBackgrounds.SetElement(PanelBackgroundsElement); // connect the settings panel to it's DIV element
		}
		
		// panel for search
		
		var SearchPanelElement=this.Elements[CMMainContainer.SEARCH_PANEL];
		if  (CMUtilities.IsDefined(SearchPanelElement)) 
		{
			this.PanelSearch=new CMPanelSearch(this);
		
			var TheSearchTab=this.TabPanel.AddTab("Search","Search",null,SearchPanelElement);
			
			this.PanelSearch.SetElement(SearchPanelElement); // connect the settings panel to it's DIV element
		}
	}

	//************************************************************************
	// Add the tools container
	// The positioning of the tools is set within the CMMainContainer CSS file	
	var ToolContainer=this.GetElement(CMMainContainer.TOOL_CONTAINER);
	if (CMUtilities.IsDefined(ToolContainer))
	{
		// create the tool panel object and link it to its DIV element
		
		this.ToolPanel=new CMPanelTool(this);
		
		this.ToolPanel.SetElement(ToolContainer);
		
		// add the select/arrow tool

		var EditTool=this.GetElement(CMMainContainer.TOOL_EDIT);
		
		if (CMUtilities.IsDefined(EditTool))
		{
			var TheTool=this.ToolPanel.AddTool(EditTool,this.ImageFolder+"IconArrow_20w_Default.png",
				this.ImageFolder+"IconArrow_20w_Selected.png",this,
				'Click to get information on features or drag the map',function(TheCanvasMap) 
			{ 
				TheCanvasMap.SelectTool(CMView.TOOL_SELECT); // create a new select tool
			});
			TheTool.CMMainContainer=this;
		}
		
		// add the select/arrow tool
		
		var PanTool=this.GetElement(CMMainContainer.TOOL_PAN);
		
		if (CMUtilities.IsDefined(PanTool))
		{
			var TheTool=this.ToolPanel.AddTool(PanTool,this.ImageFolder+"IconHand_20w_Default.png",
				this.ImageFolder+"IconHand_20pixels_Selected.png",this,
				'Click to get information on features or drag the map',function(TheCanvasMap) 
			{ 
				TheCanvasMap.SelectTool(CMView.TOOL_HAND); // create a new select tool
			});
			TheTool.CMMainContainer=this;
		}
		
		// add the select/arrow tool
		
		var InfoTool=this.GetElement(CMMainContainer.TOOL_INFO);
		
		if (CMUtilities.IsDefined(InfoTool))
		{
			var TheTool=this.ToolPanel.AddTool(InfoTool,this.ImageFolder+"Icon_I_Default.png",
				this.ImageFolder+"Icon_I_Selected.png",this,
				'Click to get information on features or drag the map',function(TheCanvasMap) 
			{ 
				TheCanvasMap.SelectTool(CMView.TOOL_INFO); // create a new select tool
			});
			TheTool.CMMainContainer=this;
		}
		this.ToolPanel.MakeToolGroup([EditTool,PanTool,InfoTool]);
		
		// add zoom in tool
		
		var ZoomInButton=document.createElement("DIV");
		ZoomInButton.id="ZoomIn_0";
		ZoomInButton.className="CM_Tool";
		
		var TheTool=this.ToolPanel.AddTool(ZoomInButton,this.ImageFolder+"Icon_ZoomIn_Small_17H.png",
			this.ImageFolder+"Icon_ZoomIn_Small_17H.png",this,
			'Click to zoom into the map',function(TheCanvasMap) 
		{ 
			this.CMMainContainer.GetScene().GetView(0).ZoomIn();
		});
		TheTool.CMMainContainer=this;
		
		// add home button
		
		var HomeButton=document.createElement("DIV");
		HomeButton.id="Home_0";
		HomeButton.className="CM_Tool";
		
		var TheTool=this.ToolPanel.AddTool(HomeButton,this.ImageFolder+"Icon_HomeExtent_small_17H.png",
			this.ImageFolder+"Icon_HomeExtent_small_17H.png",this,
			'Click to zoom into the map',function(TheCanvasMap) 
		{ 
			this.CMMainContainer.GetScene().GetView(0).ZoomToMaxBounds();
		});
		TheTool.CMMainContainer=this;
		
		// add zoom out tool
		
		var ZoomOutButton=document.createElement("DIV");
		ZoomOutButton.id="ZoomOut_0";
	//	ZoomOutButton.className="CM_Tool";
		
		var TheTool=this.ToolPanel.AddTool(ZoomOutButton,this.ImageFolder+"Icon_ZoomOut_Small_17H.png",
			this.ImageFolder+"Icon_ZoomOut_Small_17H.png",this,
			'Click to zoom into the map',function(TheCanvasMap) 
		{ 
			this.CMMainContainer.GetScene().GetView(0).ZoomOut();
		});
		TheTool.CMMainContainer=this;
		
		this.ToolPanel.MakeToolGroup([ZoomInButton,HomeButton,ZoomOutButton]);
	}
	
	// footer
	
	var MapFooter=this.Elements[CMMainContainer.MAP_FOOTER];
	if  (CMUtilities.IsDefined(MapFooter)) 
	{
		// create the tool panel object and link it to its DIV element
		
		this.PanelFooter=new CMPanelFooter(this);
		
		this.PanelFooter.SetElement(MapFooter);
		
		MapContainer.appendChild(MapFooter);
	}
	// horiziontal tab container
	
 	var HoriziontalTabContainerElement=this.Elements[CMMainContainer.HORIZIONAL_TAB_CONTAINER];
	if  (CMUtilities.IsDefined(HoriziontalTabContainerElement)) 
	{
		// create the horizontal tab panel container
		
		this.HoriziontalTabContainer=new CMPanelTabs(this);
		this.HoriziontalTabContainer.SetElement(HoriziontalTabContainerElement);
		
		// time editor
		var TimeEditorPanelElement=this.Elements[CMMainContainer.TIME_EDITOR_PANEL];
		if  (CMUtilities.IsDefined(TimeEditorPanelElement)) 
		{
			this.PanelTimeline=new CMPanelTime(this);
			this.PanelTimeline.SetElement(TimeEditorPanelElement);
		
			var TimeEditorTab=this.HoriziontalTabContainer.AddTab("Timeline","Timeline",null,TimeEditorPanelElement);
		
			// link the settings panel to the TimeEditorPanal (jjg - use messages instead?)
			
			var TheSettingsPanel=this.GetPanelSettings();
			this.PanelTimeline.SetSettingsPanel(TheSettingsPanel); // connect the settings panel to the time editor panel
		}
		// attributes
		
	 	var AttributePanelElement=this.Elements[CMMainContainer.ATTRIBUTE_PANEL];
		if  (CMUtilities.IsDefined(AttributePanelElement)) 
		{
			var TheAttributePanel=new CMPanelAttributes(this);
			TheAttributePanel.SetElement(AttributePanelElement);
		
			var TimeEditorTab=this.HoriziontalTabContainer.AddTab("Attributes","Attributes",null,AttributePanelElement);
		}
		
	}
	
	
	//*****************************************************
	// call jQuery to add the mouse handles to the canvas element
	
	if (AllowMouseEvents)
	{
		TheView.AddMouseEventHandlers();
		
	}
		
	//*************************************************************************************
	// set the stickiness of the elements
	
	var LayerListWidth=0;
	var MapFooterHeight=0;

	if (this.Elements[CMMainContainer.VERTICAL_TAB_CONTAINER]!=null) // have a layer list
	{
		LayerListWidth=jQuery(this.Elements[CMMainContainer.VERTICAL_TAB_CONTAINER]).width(); // this works, other approaches do not
	}
	if (this.Elements[CMMainContainer.MAP_FOOTER]!=null) // have a footer
	{
		MapFooterHeight=jQuery(this.Elements[CMMainContainer.MAP_FOOTER]).height(); // this works, other approaches do not
	}
	
	var MapMarginRight=LayerListWidth+this.HorizontalMargin;
	
	//*********************************************************
	// setup gesture support using hammer.js
	
//	var MapHeader=this.GetElement(CMMainContainer.MAP_HEADER);
	var CanvasContainer=this.GetElement(CMMainContainer.CANVAS_CONTAINER);

	if (this.MobileSupported)
	{
		TheView.AddMobileEvents();
		// create a simple instance
		// by default, it only adds horizontal recognizers
/*		var mc = new Hammer(CanvasContainer);
		
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
			var RefDistance=TheView.GetRefWidthFromPixelWidth(CMMainContainer.GESTURE_PAN);
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
					TheView.ZoomTo(ZoomLevel-CMMainContainer.GESTURE_ZOOM);
				}
				else
				{
					TheView.ZoomTo(ZoomLevel+CMMainContainer.GESTURE_ZOOM);
				}
			}
		});	 // end of: mc.on("pinch panleft panright panup pandown", function(ev) 
*/	}
};

//***************************************************************************************
// CMMainContainer functions that can be called after initialize()
//***************************************************************************************

//***************************************************************************************
// Gets and sets

/**
* Get the scene object that contains the layers for the map
* @public
* @returns TheScene - the current scene for this map.
*/
CMMainContainer.prototype.GetScene=function() { return(this.TheScene); };

/**
* Get the view for the CMMainContainer.  When using more than one view, 
* get the scene and then use the Scene's GetNumViews() and GetView(Index)
* functions.
*
* @public
* @returns TheView - the current view for this scene.
*/
CMMainContainer.prototype.GetView=function() { return(this.TheScene.GetView(0)); };

CMMainContainer.prototype.GetToolPanel=function() { return(this.ToolPanel); };

CMMainContainer.prototype.GetPanelFooter=function() { return(this.PanelFooter); };

CMMainContainer.prototype.GetPanelSettings=function() { return(this.PanelSettings); };

CMMainContainer.prototype.SetPanelSettings=function(NewPanelSettings) { this.PanelSettings=NewPanelSettings; };

CMMainContainer.prototype.GetPanelTimeline=function() { return(this.PanelTimeline); };


/**
* Set the projection for coordinate conversion
* @public
* @param TheProjector - the projector to use to project coordinates
*/
CMMainContainer.prototype.SetProjector=function(TheProjector) { this.TheScene.SetProjector(TheProjector); };
CMMainContainer.prototype.GetProjector=function() { return(this.TheScene.GetProjector()); };

/**
* Set the maximum bounds for the map to be panned to
* @public
* @param TheBounds - bounds defined by { XMin,XMax,YMin,YMax }
*//*
CMMainContainer.prototype.SetMaxBounds=function(TheBounds) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.SetMaxBounds() cannot be called until after Initialize() is called()"); }
	else this.TheScene.GetView(0).SetMaxBounds(TheBounds); 
};*/
/**
* Set the minimum and maximum zoom values
* @public
* @param MinZoom
* @param MaxZoom
*//*
CMMainContainer.prototype.SetZoomRange=function(MinZoom,MaxZoom) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.SetZoomRange() cannot be called until after Initialize() is called()"); }
	else this.TheScene.GetView(0).SetZoomRange(MinZoom,MaxZoom); 
};
*/
/**
* Set the current tool selected for interacting with the map
* @public
* @param ViewToolDef - sets the current tool (e.g. CMView.TOOL_INFO)
*/
CMMainContainer.prototype.SelectTool=function(ViewToolDef) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.SelectTool() cannot be called until after Initialize() is called()"); }
	this.TheScene.GetView(0).SetTool(ViewToolDef);
};
//***************************************************************************************
// Add layers

/*
* Add a layer to the map.  The layer will be on top of other layers
* @public
* @param NewLayer - CMLayer object to add to the map
*/
CMMainContainer.prototype.AddLayer=function(NewLayer) 
{ 
	var LayerIndex=-1;
	
	if (this.TheScene==null) { alert("Sorry, CMMainContainer.AddLayer() cannot be called until after Initialize() is called()"); }
	else 
	{
		LayerIndex=this.TheScene.AddLayer(NewLayer);
	}
	return(LayerIndex);
};
/*
* Add background to the list
* @public
* @param NewLayer - CMLayer object to add to the backgrounds.  Only one background will
*  appear and it will always be behind the other layers.
*/
CMMainContainer.prototype.AddBackground=function(NewLayer) 
{ 
	if (this.TheScene==null) { alert("Sorry, CMMainContainer.AddBackground() cannot be called until after Initialize() is called()"); }
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
CMMainContainer.prototype.StartMap=function(ResizeFlag) 
{
	// select layers tab to start
	
	if  (CMUtilities.IsDefined(this.TabPanel)) 
	{
		this.TabPanel.SelectTab("Layers");
	}
	// setup resize
	
	if (ResizeFlag) 
	{
		this.Resize();
	}
	else 
	{
		// the canvas aspect ratio is not correct unless we set the "width" and "height" of the element
		// rather than the style.  This must be done or it will display maps distorted
		
		this.TheScene.Resize();
	}
};

//*************************************************************************************
// Functions called by GUI widgets
//*************************************************************************************
/*
* called to zoom the map in by 2x
* @public
*/
CMMainContainer.prototype.ZoomIn=function() 
{
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.ZoomIn() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).ZoomIn();
};
/*
* called to zoom the map out by 2x
* @public
*/
CMMainContainer.prototype.ZoomOut=function() 
{
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.ZoomOut() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).ZoomOut();
};
/**
* Zooms the map to the maximum specified value
* @public
*/
CMMainContainer.prototype.ZoomToMax=function() 
{
	var SceneBounds=this.TheScene.GetBounds();
	
	if (SceneBounds!=null)
	{
		this.TheScene.GetView(0).ZoomToBounds(SceneBounds);
	}
};
/*
* called to zoom the map to a specific area of the scene.
* @public
* @param TheBounds - boundary object { XMin,XMax,YMin,YMax}
*/
CMMainContainer.prototype.ZoomToBounds=function(TheBounds) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.ZoomToBounds() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).ZoomToBounds(TheBounds); 
};
/**
* Zooms to the specified zoom level
* @public
* @param ZoomLevel - level to zoom to, 1=1 pixel per map unit, 2=pixels per map unit, etc.)
*/
CMMainContainer.prototype.ZoomTo=function(ZoomLevel) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.ZoomTo() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).ZoomTo(ZoomLevel); 
};
/**
* Centers the map at RefX,RefY in the first view
* @public
* @param RefX - Longitude or easting for the center of the map
* @param RefY - Latitude or northing for the center of the map
*/
CMMainContainer.prototype.SetRefCenter=function(RefX,RefY) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.SetRefCenter() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).SetRefCenter(RefX,RefY); 
};

/**
* Called to resize the map when the window size changes.  
* The only reason this is needed is because
* we have to use JavaScript to resize the Canvas HTML element, CSS does not work.
* @public
*/
CMMainContainer.prototype.Resize=function() 
{
	CMMainContainer.HidePopupWindow();
	
	this.TheScene.Resize();
};
