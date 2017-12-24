/******************************************************************************************************************
* CMLayer
* This class is the base class for all other layers.  This class contains functions and properties for feature and raster based
* classes.  This is because the CMLayerPyramid supports both raster and vector data.  This also may be a trend with data formats like KML.
*
* @module CMLayer
******************************************************************************************************************/

//*****************************************************************************************************************
// Definitions
//*****************************************************************************************************************

/**
* Definitions for types of marks
* @public, @enum
*/
CMLayer.MARK_CIRCLE=0;
CMLayer.MARK_TRIANGLE=1;
CMLayer.MARK_SQUARE=2;
CMLayer.MARK_STAR=3;

/**
* Array for the types of directions
* @private (may be made public later)
*/
CMLayer.LabelDirections=["TL","T","TR","R","BR","B","BL","L"]; // definitions for the direction a label will be from its point

/**
* Below are the additional settings definitions for STLayers.  Setings for the basic drawing style and text
* style are inherited from STItem
* @public, @settings
*/
CMLayer.SettingDefintions=
{
	Layer:
	{
		InfoText: { Name:"Info Text",Type:CMBase.DATA_TYPE_STRING, Default:"Undefined" },
		MinZoom: { Name:"Min Zoom",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
		MaxZoom: { Name:"Max Zoom",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
	},
	Mark: 
	{ 
		Type: { Name:"Type",Type:CMBase.DATA_TYPE_ENUMERATED, Options:[CMLayer.MARK_CIRCLE,CMLayer.MARK_TRIANGLE,CMLayer.MARK_SQUARE,CMLayer.MARK_STAR],Default:CMLayer.MARK_CIRCLE },
		Size: { Name:"Size",Type:CMBase.DATA_TYPE_FLOAT, Default:3 },
	},
	IconImage:
	{
		URL: { Name:"URL",Type:CMBase.DATA_TYPE_URL, Default:"" },
		TheImage: { Name:"Image",Type:CMBase.DATA_TYPE_IMAGE, Default:null },
		OffsetX: { Name:"Offset X",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
		OffsetY: { Name:"Offset Y",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
	},
	LabelBox:
	{
		Position: { Name:"Position",Type:CMBase.DATA_TYPE_ENUMERATED, Options:["TL","T","TR","R","BR","B","BL","L"],Default:"UR" },
		OffsetX: { Name:"Offset X",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
		OffsetY: { Name:"Offset Y",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
		
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' },
		
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }
	},
	MouseOverStyle:
	{
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,0,0)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' },
		
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }
	},
	SelectedStyle:
	{
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,255)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' },
		
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }
	},
};

//*****************************************************************************************************************
// Constructors
//*****************************************************************************************************************

/**
* Constructor for a layer object.  Layers contain spatial data that appears in a scene
* @public, @constructs
*/
function CMLayer() 
{
	CMItem.call(this);
	
	// general properties
	
	this.TheBounds=null; // the overall bounds (only as good as the information from the layers)

	this.Clickable=true; // false to make the layer so it does nothing when clicked on 
	
	// internally set properties
	
//	this.SelectedFeatureIndex=-1; // array of flags for rows?
//	this.MouseOverFeatureIndex=-1; // array of flags for rows?
	
	this.FeatureBounds=null; // bounds of each feature, cached for speed (jjg move to CMDataset?)
	
	var SettingsDirty=false; // if true, settings need to be updated from attributes
	
	// settings
	
	this.Name=null; // name of the layer, appears in the LAYER_LIST
	
	this.ClickTolerance=8; // jjg setting? number of pixels around the spatial data to see if the mouse was clicked on or moved over the feature
	
	this.InfoWindowWidth=300; // jjg seting?
	
	this.TimeSlices[0].Settings.Layer=	
	{
	};
	this.TimeSlices[0].Settings.Mark=	
	{
	};
	this.TimeSlices[0].Settings.IconImage=
	{
	};
	this.TimeSlices[0].Settings.LabelBox=
	{
	};
	this.TimeSlices[0].Settings.MouseOverStyle=
	{
	};
	this.TimeSlices[0].Settings.SelectedStyle=
	{
		strokeStyle:"rgb(120,100,255)",
		lineWidth:"3",
		fillStyle:"rgba(0,0,0,0)"
	};
	
	/*
	* settings specific to individual features, must be set outside constructor to be unique to each layer. 
	* This is an array.  Each element has the same form as other settings:
	* { Group:
	*    { Key:Value }
	* }
	*/
	this.FeatureSettings=null;  // 
	/*
	*/
	this.SettingsAttributes=null; // objects with {Group:{Key: AttributeName} } with entries for each setting that is coming from an attribute
}

CMLayer.prototype=Object.create(CMItem.prototype); // inherit prototype functions from CMBase()

CMLayer.prototype.contructor=CMLayer; // override the constructor to go to ours

//******************************************************************
// Private functions
//******************************************************************
/**
* Private utility function to update the properties when a different attribute is selected or when
* the data is loaded from the server.  
* @protected, @override
*/
CMLayer.prototype.UpdateSettingsFromAttributes=function()
{
	if (this.SettingsDirty)
	{
		// setup any properties that were set by attributes
		if (this.SettingsAttributes!=null)
		{
			var j=12;
/*			var TheDataset=this.GetDataset();
			
			// go through all the properties that come from attributes
			for (var SettingsGroupKey in this.SettingsAttributes)
			{
				var SettingsGroup=this.SettingsAttributes[SettingsGroupKey];
				
				for (var SettingsKey in SettingsGroup)
				{
					var AttributeName=SettingsGroup[SettingsKey];
					
					// update the attributes
					for (var j=0;j<TheDataset.GetNumAttributeRows();j++)
					{
						var Value=TheDataset.GetAttributeCellByHeading(AttributeName,j);
						
						if ((Value!==undefined)&&(Value!==""))
						{
							if ((SettingsGroupKey=="IconImage")&&(SettingsKey=="URL"))
							{
								var TheImage;  //=JSON.parse(Value); // image object with the URL
								TheImage=new Image(); 
								TheImage.Loaded=false;
								TheImage.TheLayer=this;
								
								TheImage.onload=function() 
								{ 
									this.Loaded=true;
		
									this.TheLayer.Repaint(); 
								};
								TheImage.src=Value; 
							}
							else if ((SettingsGroupKey=="Mark")&&(SettingsKey=="Type"))
							{
								if (Value==="MARK_CIRCLE") Value=CMLayer.MARK_CIRCLE;
								if (Value==="MARK_TRIANGLE") Value=CMLayer.MARK_TRIANGLE;
								if (Value==="MARK_SQUARE") Value=CMLayer.MARK_SQUARE;
								if (Value==="MARK_STAR") Value=CMLayer.MARK_STAR;
							}
							else if ((SettingsGroupKey=="Mark")&&(SettingsKey=="Size"))
							{
								Value=parseInt(Value);
							}
							else // all others are HTML 5 Canvas Styles
							{
								Value=Value;
							}
							this.SetFeatureSetting(SettingsGroupKey,SettingsKey,j,Value);
						}
					}
				}
			}
			this.Repaint();
			this.SettingsDirty=false;
*/		}
	}
}
//******************************************************************
// CMBase Functions
//******************************************************************
/*
* Returns the current name of the layer
* @public
* @returns Name - the name of the layer
*/
CMLayer.prototype.GetName=function()  { return(this.Name); }

//

CMLayer.prototype.CMItem_GetSettingsDefinitions=CMItem.prototype.GetSettingsDefinitions;

CMLayer.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMItem_GetSettingsDefinitions();
	
	for (Key in CMLayer.SettingDefintions)
	{
		Result[Key]=CMLayer.SettingDefintions[Key];
	}

	return(Result); 
}
//******************************************************************
// Functions used by subclasses and not overriden
//******************************************************************

/*
* Set the human-readable name for the layer.  This name will appear
* in the layer list.
* @public
* @param Name - sets the name of the layer.
*/
CMLayer.prototype.SetName=function(Name) 
{
	this.Name=Name;
	if (this.GetScene()!=null) this.GetScene().LayerSettingsChanged(this);
}

/*
* Make the layer clickable or not.  A false value
* disables the mouse down events.
* @public
* @param Clickable - new clickable value, true or false
*/
CMLayer.prototype.SetClickable=function(Clickable) 
{
	if (Clickable!=this.Clickable)
	{
		this.Clickable=Clickable;
	}
};
/*
* Return the clickable value.
* @public
*/
CMLayer.prototype.GetClickable=function() 
{
	return(this.Clickable);
};
/**
* Checks if the layer is visible.  This is different form GetVisible() because it
* also checks for an optional zoom range
* @public
*/
CMLayer.prototype.IsVisible=function()
{
	var Result=this.GetVisible();
	
	if (Result) // may have to check zoom range
	{
		var MinZoom=this.GetSetting("Layer","MinZoom"); // typically this will not be set so this will be fast
		var MaxZoom=this.GetSetting("Layer","MaxZoom"); // typically this will not be set so this will be fast
		
		if (MinZoom!=null) { Result=this.InZoomRange([MinZoom,MaxZoom]); }
	}
	return(Result);
};
/**
* Returns true if the view is within the specified Zoom Range or the zoome range is null
* This is a utility function for the IsVisible() and IsFeatureVisible() functions
* @param ZoomRange - array with [MinZoom,MaxZoom]
* @returns Flag - true if the view is visible in the zoom range, false otherwise.
*/
CMLayer.prototype.InZoomRange=function(ZoomRange)
{
	var Result=true;
	
	var TheScene=this.GetScene();
	
	if ((ZoomRange!=null)&&(TheScene!=null)&&(TheScene.GetView(0)!=null))
	{
		var TheView=TheScene.GetView(0);
		var TheZoom=TheView.GetZoomLevel();
		
		if ((TheZoom<ZoomRange[0])||(TheZoom>ZoomRange[1])) // current zoom is less than min or greater than max
		{
			Result=false;
		}
	}
	return(Result);
}
/**
* Check if the feature is visible in the view.
* @param FeatureIndex - index for the feature to check
* @returns Flag - true if the feature is visible in the view, false otherwise.
*/
CMLayer.prototype.IsFeatureVisible=function(FeatureIndex)
{
	var Result=this.IsVisible();
	
	if (Result) // may have to check zoom range
	{
		var MinZoom=this.GetFeatureSetting("Layer","MinZoom",FeatureIndex); // typically this will not be set so this will be fast
		var MaxZoom=this.GetFeatureSetting("Layer","MaxZoom",FeatureIndex); // typically this will not be set so this will be fast
		
		if (MinZoom!=null) { Result=this.InZoomRange([MinZoom,MaxZoom]); }
	}
	return(Result);
};

/**
* Check if the feature is visible in the view.
* This should be called by subclasses but can also be called to limit a layer's bounds after loading.
* @public
* @param NewBounds - Object for Bounds with format {XMin,XMax,YMin,YMax}
*/
CMLayer.prototype.SetBounds=function(NewBounds) 
{
	this.TheBounds=NewBounds;
}
/**
* Returns the bounds of the data within the layer.  Computed after loading the data.
* @public
* @returns Bounds - with format {XMin,XMax,YMin,YMax}
*/
CMLayer.prototype.GetBounds=function() 
{
	return(this.TheBounds);
}


/**
* Returns the current projector.
* @public
* @returns TheProjector - an STProjector object or null.
*//*
CMLayer.prototype.GetProjector=function() 
{ 
	return(this.TheProjector); 
}
*/
/**
* Returns the Scene the layer is in.
* @public
* @returns TheScene - the scene the layer is contained in or null for none.
*/
CMLayer.prototype.GetScene=function() 
{ 
	var Result=this.GetParent(CMScene);
	return(Result); 
}
/**
* Utility function to get the CanvasMap from a layer in one call.
*/
CMLayer.prototype.GetCanvasMap=function() 
{ 
	var Result=this.GetParent(CMMainContainer);
	return(Result); 
}


/**
* Sets the width of the information window
* @public
* @param NewWidth - Width of the info popup window in pixels
*/
CMLayer.prototype.SetInfoWindowWidth=function(NewWidth) 
{
	this.InfoWindowWidth=NewWidth;
}
/**
* Gets the width of the information window
* @public
* @returns NewWidth - Width of the info popup window in pixels
*/
CMLayer.prototype.GetInfoWindowWidth=function() 
{
	return(this.InfoWindowWidth);
}
/**
* Sets the distance the mouse can be clicked before a feature is selected
* @public
* @returns NewClickTolerance - Click tolerance in pixels
*/
CMLayer.prototype.SetClickTolerance=function(NewClickTolerance)
{
	this.ClickTolerance=NewClickTolerance;
}
//******************************************************************
// Functions used by subclasses and not overriden
//******************************************************************
/**
* Sets up a projector for layer data to be projected on loading the data.
* @public
* @param NewProjector - an STProjector object to project layer data after it is loaded.
*/
CMLayer.prototype.SetProjector=function(NewProjector)
{
	if (this.TheDataset!=null) 
	{
		this.GetDataset().SetProjector(NewProjector); // jjg temp kludge
	}
}
//******************************************************************
// Feature-based functions
//******************************************************************

/**
* Sets the feature that is selected
* @public
* @param NewFeatureIndex - >=0 indicates a feature, -1 is for none.
*/
CMLayer.prototype.SetSelectedFeature=function(New) 
{
	if ((this.TheDataset!=null)&&(New!=this.TheDataset.GetSelectedFeature()))
	{
		this.TheDataset.SetSelectedFeature(New); // sends message
		
		// call the scene to let everyone know the selection changed
		var TheScene=this.GetParent(CMScene);
		
		TheScene.SelectionChanged(this);
	}
}
/**
* Unselects all features in the layer.  
* @public
*/
CMLayer.prototype.CMItem_UnselectAll=CMItem.prototype.UnselectAll;

CMLayer.prototype.UnselectAll=function(SendMessageFlag) 
{
	this.CMItem_UnselectAll(SendMessageFlag);
	
	if ((this.TheDataset!=null)&&(this.TheDataset.GetSelectedFeature()!=-1)) // something is selected
	{ 
//		this.SelectedFeatureIndex=-1;
		this.TheDataset.SetSelectedFeature(-1);
		
		if (SendMessageFlag) // call the scene to let everyone know the selection changed
		{
			// call the scene to let everyone know the selection changed
			var TheScene=this.GetParent(CMScene);
			TheScene.SelectionChanged(this);
		}
	}
}
/**
* Sets the current feature that the mouse is over
* @public
* @param NewFeatureIndex - index to the feature the mouse is over (typcially returned by In())
*/
CMLayer.prototype.SetMouseOverFeature=function(New) 
{
	if ((this.TheDataset!=null)&&(this.TheDataset.GetMouseOverFeature()!=New)) // something is selected
	{ 
		this.TheDataset.SetMouseOverFeature(New);
	}
}
/**
* Returns the current feature that the mouse is over
* @public
* @returns FeatureIndex - index to the feature the mouse is over (typcially returned by In()), or -1 for none
*/
CMLayer.prototype.ResetMouseOverFeature=function() 
{
	if ((this.TheDataset!=null)&&(this.TheDataset.GetMouseOverFeature()!=-1)) // something is selected
	{ 
		this.TheDataset.SetMouseOverFeature(-1);
	}
}

//******************************************************************
// Property Gets and Sets
//******************************************************************
/**
* Set the attribute column to obtain property values for features from
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param Value - Heading of the column to extract values from.
*/
CMLayer.prototype.SetSettingAttribute=function(Group,Key,AttributeName)
{
	// allocate the settings object if needed
	if (this.SettingsAttributes==null) this.SettingsAttributes={};

	// add the group if needed
	if ((Group in this.SettingsAttributes)==false) this.SettingsAttributes[Group]={}
	
	// save the key and name of the attribute column for this setting
	this.SettingsAttributes[Group][Key]=AttributeName;
	
	// make sure the settings are updated
	this.SettingsDirty=true;
}
/**
* Get the attribute column to obtain property values for features from
* @public
* @param Group - 
* @param Key - 
* @returns Value - Heading of the column to extract values from.
*/
CMLayer.prototype.GetSettingsAttribute=function(Group,Key)
{
	var Result=null;
	
	if (this.SettingsAttributes!==null)
	{
		if (Group in this.SettingsAttributes) { Result=this.SettingsAttributes[Group][Key]; }
	}
	return(Result);
}
/**
* Set the feature settings into an array indexed by FeatureIndexes
* @public
* @param FeatureIndex - Index to the feature
* @param FeatureProperties - array of properties indexed by the feature indexes
*/
CMLayer.prototype.SetFeatureSettings=function(FeatureIndex,OneFeaturesSettings)
{
	if (this.FeatureSettings==null)
	{
		this.FeatureSettings=new Array();
	}
	this.FeatureSettings[FeatureIndex]=OneFeaturesSettings;
}
CMLayer.prototype.GetFeatureSettings=function(FeatureIndex,TheDefault)
{
	this.UpdateSettingsFromAttributes();
		
	var Result=TheDefault;
	
	if (this.FeatureSettings!=null)
	{
		Result=this.FeatureSettings[FeatureIndex];
	}
	return(Result);
}
CMLayer.prototype.SetFeatureSettingGroup=function(Group,FeatureIndex,OneFeaturesSettingGroup)
{
	if (this.FeatureSettings==null)
	{
		this.FeatureSettings=new Array();
	}
	if (this.FeatureSettings[FeatureIndex]==undefined) this.FeatureSettings[FeatureIndex]={};
	
	if (this.FeatureSettings[FeatureIndex][Group]==undefined) this.FeatureSettings[FeatureIndex][Group]={};
	
	this.FeatureSettings[FeatureIndex][Group]=OneFeaturesSettingGroup;
}
CMLayer.prototype.GetFeatureSettingGroup=function(Group,FeatureIndex,Default)
{
	this.UpdateSettingsFromAttributes();
		
	var Result=Default;
	
	if (this.FeatureSettings!=null)
	{
		if (this.FeatureSettings[FeatureIndex]!=undefined)
		{
			if (this.FeatureSettings[FeatureIndex][Group]!=undefined) Result=this.FeatureSettings[FeatureIndex][Group];
		}
	}
	return(Result);
}

/**
* Set an individual feature property based on it's FeatureIndex
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param FeatureIndex - Feature to apply the property to
* @param Value - value for the property for the feature
*/
CMLayer.prototype.SetFeatureSetting=function(Group,Key,FeatureIndex,Value)
{
	if (this.FeatureSettings==null) this.FeatureSettings=new Array();

	if (this.FeatureSettings[FeatureIndex]==undefined) this.FeatureSettings[FeatureIndex]={};
	
	if ((Group in this.FeatureSettings[FeatureIndex])==false) this.FeatureSettings[FeatureIndex][Group]={};
	
	this.FeatureSettings[FeatureIndex][Group][Key]=Value;
}
/**
* Returns a property for a specific feature.  Returns null if the property
* is not specified for the feature.
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param FeatureIndex - Feature to apply the property to
* @param Default - The default value to return if the property has not been specified.
* @returns Value - value for the property for the feature
*/
CMLayer.prototype.GetFeatureSetting=function(Group,Key,FeatureIndex,Default)
{
	this.UpdateSettingsFromAttributes();
		
	var Result=this.GetSetting(Group,Key,Default);
	
	if (this.FeatureSettings!==null)
	{
		var TheFeaturesSettings=this.FeatureSettings[FeatureIndex];
		
		if (TheFeaturesSettings!=undefined)
		{
			if (Group in TheFeaturesSettings)
			{
				var Result=this.FeatureSettings[FeatureIndex][Group][Key];
			}
		}
	}
	return(Result);
}

//******************************************************************
// Painting Style functions
//******************************************************************

/**
* Icon for point features
* @public
* @param TheURL - the URL of the image to use for all features
* @param OffsetX - horizontal offset in pixels to go from the upper left of the image to the hot spot
* @param OffsetY - vertical offset in pixels to go from the upper left of the image to the hot spot
*/
CMLayer.prototype.SetIconImage=function(TheURL,OffsetX,OffsetY) 
{
	var TheImage=new Image(); 
	TheImage.Loaded=false;
	TheImage.TheURL=TheURL;
	TheImage.TheLayer=this;
	TheImage.OffsetX=OffsetX;
	TheImage.OffsetY=OffsetY;
	
	TheImage.onload=function() 
	{ 
		this.Loaded=true;
		
		this.TheLayer.SetSetting("IconImage","URL",this.TheURL);
		this.TheLayer.SetSetting("IconImage","TheImage",this);
		this.TheLayer.SetSetting("IconImage","OffsetX",this.OffsetX);
		this.TheLayer.SetSetting("IconImage","OffsetY",this.OffsetY);
		
		this.TheLayer.Repaint(); 
	};
	
	TheImage.src=TheURL; // triggers the load
};
/**
* Icon for point features
* @public
* @param TheURL - the URL of the image to use for all features
* @param OffsetX - horizontal offset in pixels to go from the upper left of the image to the hot spot
* @param OffsetY - vertical offset in pixels to go from the upper left of the image to the hot spot
*/
CMLayer.prototype.SetFeatureIconImage=function(FeatureIndex,TheURL,OffsetX,OffsetY) 
{
	var TheImage=new Image(); 
	TheImage.FeatureIndex=FeatureIndex;
	TheImage.Loaded=false;
	TheImage.TheLayer=this;
	TheImage.OffsetX=OffsetX;
	TheImage.OffsetY=OffsetY;
	
	TheImage.onload=function() 
	{ 
		this.Loaded=true;
		
		this.TheLayer.SetFeatureSetting("IconImage","URL",this.FeatureIndex,this.TheURL);
		this.TheLayer.SetFeatureSetting("IconImage","TheImage",this.FeatureIndex,this);
		this.TheLayer.SetFeatureSetting("IconImage","OffsetX",this.FeatureIndex,this.OffsetX);
		this.TheLayer.SetFeatureSetting("IconImage","OffsetY",this.FeatureIndex,this.OffsetY);
		
		this.TheLayer.Repaint(); 
	};
	
	TheImage.src=TheURL; // triggers the load
};


//******************************************************************
// Functions for subclasses to call (protected)
//******************************************************************

/**
* Utility function to set the label font into the context and to return
* the current font size for bounds calculations.
* @protected
* @param TheView - the view to paint into
* @param FeatureIndex - the feature to paint
* @param RefX - X reference coordinate value
* @param RefY - Y reference coordinate value
* @param TheIconImage
*/
CMLayer.prototype.SetupLabelFont=function(TheView,FeatureIndex)
{
	//************************
	// get font size to determine the width of the text to place the label
	
	var LabelFont=this.GetFeatureSetting("Text","font",FeatureIndex,"Arial 12px");
	var FontFace="Arial";
	var FontSize="20";
	
	if ((LabelFont!=null)&&(LabelFont!=undefined)) // make sure we strip "px" off the size
	{
		var Index=LabelFont.indexOf("px");
		if (Index!=-1)
		{
			var Temp=LabelFont.substring(0,Index);
			var Index2=Temp.lastIndexOf(" ");
			if (Index2!=-1) Temp=Temp.substring(Index2+1);
			FontSize=parseInt(Temp);
		}
	}
	// setup the font
	var TheContext=TheView.GetContext();
	
	TheContext.font = LabelFont;
	
	return(FontSize); // this is returned so calling code does not have to deal with it.
}
/**
* Utility function to paint a point at a reference coordinate
* @protected
* @param TheView - the view to paint into
* @param FeatureIndex - the feature to paint
* @param RefX - X reference coordinate value
* @param RefY - Y reference coordinate value
* @param SelectedOnly - false unless we are drawing the selected point on top of everything else
*/
CMLayer.prototype.PaintPoint=function(TheView,FeatureIndex,RefX,RefY,SelectedOnly)
{
	if (this.IsFeatureVisible(FeatureIndex))
	{
		this.UpdateSettingsFromAttributes();
		
		// convert the ref coordinate to pixels
		
		var Result=TheView.GetPixelFromRef(RefX,RefY);
		var PixelX=Result.PixelX;
		var PixelY=Result.PixelY;
	
		// find the correct image for this point, if any
		
		var TheFeatureImage=this.GetSettingGroup("IconImage");
		
		var TheFeatureImage=this.GetFeatureSettingGroup("IconImage",FeatureIndex,TheFeatureImage);
		
		//
		
		if (TheFeatureImage.TheImage!==undefined) // there is an icon image
		{
			var Bounds={
				XMin:PixelX+TheFeatureImage.OffsetX,
				XMax:PixelX+TheFeatureImage.OffsetX+TheFeatureImage.TheImage.width,
				YMin:PixelY+TheFeatureImage.OffsetY,
				YMax:PixelY+TheFeatureImage.OffsetY+TheFeatureImage.TheImage.height
			};
			if (TheView.CheckCollision(Bounds)==false)
			{
				TheView.AddToCollisions(Bounds);
				
				TheView.PaintImage(TheFeatureImage.TheImage,PixelX+TheFeatureImage.OffsetX,PixelY+TheFeatureImage.OffsetY);
			}
		}
		else // must be a mark
		{
			var TheStyle=this.GetStyle(TheView);
			
			var TheFeatureStyle=this.GetFeatureSettingGroup("Style",i,TheStyle);
				
			if (TheFeatureStyle!==null) { TheView.SetStyle(TheFeatureStyle,false); }
			
			// draw the mark
			
			var TheSize=this.GetFeatureSetting("Mark","Size",FeatureIndex,5);
			var TheType=this.GetFeatureSetting("Mark","Type",FeatureIndex,CMLayer.MARK_CIRCLE);
			
			var HalfSize=TheSize/2;
			
			var Bounds={
				XMin:PixelX-HalfSize,
				XMax:PixelX+HalfSize,
				YMin:PixelY-HalfSize,
				YMax:PixelY+HalfSize
			};
			if (TheView.CheckCollision(Bounds)==false)
			{
				TheView.AddToCollisions(Bounds);
			
				switch (TheType)
				{
				case CMLayer.MARK_CIRCLE:
					TheView.PaintCircle(PixelX,PixelY,HalfSize);
					break;
				case CMLayer.MARK_SQUARE:
					TheView.PaintRect(PixelX-HalfSize,PixelX+HalfSize,PixelY-HalfSize,PixelY+HalfSize);
					break;
				case CMLayer.MARK_TRIANGLE:
					{
						var TheRefSize=TheView.GetRefWidthFromPixelWidth(TheSize);
						
						var Triangle=CMUtilities.GetRegularPolygon(3,TheRefSize/2,RefX,RefY, 180);
						TheView.PaintRefPoly2(Triangle[0],Triangle[1],true,true);
					}
					break;
				case CMLayer.MARK_STAR:
					{
						var TheRefSize=TheView.GetRefWidthFromPixelWidth(TheSize);
						
						var Star=CMUtilities.GetStar(5,TheRefSize,RefX,RefY, 0);
						TheView.PaintRefPoly2(Star[0],Star[1],true,true);
					}
					break;
				}
			}
		}
		
		// see if there is a label
		var TheLabel=this.GetFeatureSetting("Text","Text",FeatureIndex,null);
		
		if (TheLabel!=null) // draw the label if there is one
		{
			var LabelStyle=this.GetStyle(TheView,0,"Text") ;
			
			if (LabelStyle!=undefined) TheView.SetStyle(LabelStyle);
			
			var FontSize=this.SetupLabelFont(TheView,FeatureIndex);
			
			var TheContext=TheView.GetContext();
			
			// setup the parameters for drawing
			var OffsetX=10;
			var OffsetY=10;
			var Direction=null;
			
			var LabelPosition=this.GetFeatureSetting("LabelBox","Position",FeatureIndex,null);
			if (LabelPosition!=null) 
			{
				OffsetX=LabelPosition.OffsetX;
				OffsetY=LabelPosition.OffsetY;
				Direction=LabelPosition.Direction;
			}
			
			// find the array of lines
			
			var Lines=TheLabel.split("<br>");
			
			// find the dimensions
			
			var Height=Lines.length*FontSize;
			var LineWidths=[];
			
			var MaxWidth=0;
			for (var i=0;i<Lines.length;i++)
			{
				Lines[i]=Lines[i].trim(); // remove any white space
				
				LineWidths.push(TheContext.measureText(Lines[i]).width);
				
				if (LineWidths[i]>MaxWidth) MaxWidth=LineWidths[i];
			}
			
			// find the x start position
			
			var PixelLeft=0;
			
			switch (Direction)
			{
			case "TL":
			case "L":
			case "BL":
				PixelLeft=PixelX-OffsetX-MaxWidth;
				break;
			case "T":
			case "B":
			default: // centered
				PixelLeft=PixelX-MaxWidth/2;
				break;
			case "BR":
			case "TR":
			case "R":
				PixelLeft=PixelX+OffsetY;
				break;
			}
			
			// find the y start position
			
			var PixelTop=0;

			switch (Direction)
			{
			case "TL":
			case "T":
			case "TR":
				PixelTop=PixelY-OffsetY-Height;
				break;
			case "R":
			case "L":
			default: // centered
				PixelTop=PixelY-Height/2;
				break;
			case "BR":
			case "B":
			case "BL":
				PixelTop=PixelY+OffsetY;
				break;
			}
			
			// find the x start position
			
			var X=PixelLeft;
			var Y=PixelTop+FontSize; // move to the first baseline
			
			var Bounds={
				XMin:X,
				XMax:X+MaxWidth,
				YMin:Y-Height,
				YMax:Y
			};

			if (TheView.CheckCollision(Bounds)==false)
			{
				TheView.AddToCollisions(Bounds);
			
				TheContext.textBaseline="bottom"; 
				
				for (var i=0;i<Lines.length;i++)
				{
					switch (Direction)
					{
					case "TL":
					case "L":
					case "BL":
						X=PixelLeft+MaxWidth-LineWidths[i];
						break;
					case "T":
					case "B":
					default: // centered
						X=PixelLeft+((MaxWidth-LineWidths[i])/2);
						break;
					case "BR":
					case "TR":
					case "R":
						X=PixelLeft;
						break;
					}
					TheContext.fillText(Lines[i],X,Y);
					TheContext.strokeText(Lines[i],X,Y);
						
					Y+=FontSize;
				}
			} // end if collision
			
			if (LabelStyle!=undefined) TheView.RestoreStyle();
			
		}
	}
};
/*
*
*/
CMLayer.prototype.PaintPoly=function(TheView,FeatureIndex,TheCoordinates,Closed,SelectedOnly)
{
	if (this.IsFeatureVisible(FeatureIndex))
	{
		if (SelectedOnly)
		{
			var TheSelectedStyle=this.GetStyle(TheView,0,"SelectedStyle");
			
			if (TheSelectedStyle!==null) { TheView.SetStyle(TheSelectedStyle,true); }
		
			TheView.PaintRefPoly(TheCoordinates,Closed)
			
			if (TheSelectedStyle!==null) { TheView.RestoreStyle(TheSelectedStyle); }
		}
		else
		{
			var TheFeatureStyle=this.GetFeatureSettingGroup("Style",FeatureIndex,null);
			
			if (TheFeatureStyle!==null) { TheView.SetStyle(TheFeatureStyle,true); }
		
			TheView.PaintRefPoly(TheCoordinates,Closed)
			
			if (TheFeatureStyle!==null) { TheView.RestoreStyle(TheFeatureStyle); }
		}
	}
}



/**
* Should be called by default after a data set is loaded so the layer can have it's properties setup
* that are based on attributes.  Can be overriden by a caller or subclass.
* @override, @public
*/
CMLayer.prototype.OnLoad=function() 
{
	this.UpdateSettingsFromAttributes();
	
	if (this.GetScene()==null)
	{
		alert("Sorry, you'll need to add the layer to the CanvasMap before you can all 'SetURL()'.");
	}
	else 
	{
		this.GetScene().SetBoundsDirty();
	}
}

//******************************************************************
// These are for more advanced layers (like pyramids) so they can
// reload images before a paint occurs.
//******************************************************************

CMLayer.prototype.ViewMoved=function(TheView) 
{
}

//******************************************************************
// Mouse event handling
//******************************************************************
/*
* returns the feature index for the coordinate in projected space
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @returns FeatureIndex - -1 if the coordinate is not in a feature
*/
CMLayer.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
	if (this.TheDataset!=null)
	{
		var NumFeatures=this.TheDataset.GetNumFeatures();
		
		for (var i=0;(i<NumFeatures)&&(FeatureIndex==-1);i++)
		{
			if (this.TheDataset.InFeature(TheView,RefX,RefY,i)) // coordinate is in the feature
			{
				// make sure the feature is visible in the layer
				if (this.IsFeatureVisible(i)) FeatureIndex=i;
			}
		}
	}
	return(FeatureIndex);
};
/**
* Called when the mouse button is pressed down in a canvas.
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @returns Used - true if the event was used, false otherwise.
*/
CMLayer.prototype.MouseDown=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	if ((this.IsVisible())&&(this.GetClickable())&&
		((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT))) // check if we where clicked in
	{
		var FeatureIndex=this.In(TheView,RefX,RefY);
		
		if (FeatureIndex!=-1)
		{
			this.SetSelectedFeature(FeatureIndex);
			
			this.ShowInfoWindow(FeatureIndex,TheView,RefX,RefY);
			
			Used=true;
		}
	}
	return(Used);
};

/**
* Called when the mouse is moved over the canvas.  The layer should check if it
* can use the mouse over event and then return "true" if it used the event and
* "false" if it wants other layers to examine the event.
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @param FeatureIndex - the feature the mouse has moved over.
*/
CMLayer.prototype.MouseMove=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	if (this.Clickable)
	{
		var FeatureIndex=this.In(TheView,RefX,RefY);
		
		if (FeatureIndex!==-1) this.MouseOver(TheView,RefX,RefY,FeatureIndex);
		else this.ResetMouseOverFeature();
	}
	return(Used);
};
/**
* Called when the mouse button is released.
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @returns Used - true if the event was used, false otherwise.
*/
CMLayer.prototype.MouseUp=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	return(Used);
};
/**
* Called when the mouse is moved over a feature.  Returns "true" if it used the event and
* "false" if it wants other layers to examine the event.
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @param FeatureIndex - the feature the mouse has moved over.
* @returns Used - true if the event was used, false otherwise.
*/
CMLayer.prototype.MouseOver=function(TheView,RefX,RefY,FeatureIndex) 
{
	var Used=false;
	
	this.SetMouseOverFeature(FeatureIndex);
	
	return(Used);
};

//******************************************************************
// Painting
//******************************************************************
/**
* Called when the layer is resized
* @override
* @param TheView - the view with the size of the canvas.
*/
CMLayer.prototype.Resize=function(TheView) 
{
}
/*
* Paints a layer into the canvas.  This function is provided for 
* subclasses to override.  The code below shows the sequence of steps
* a layer class should take to paint itself into the canvas.
* @override
* @param TheView - the view to paint into.
*/
CMLayer.prototype.Paint=function(TheView) 
{
	if ((this.IsVisible())&&(this.TheDataset!=null))
	{
	if (this.GetName()=="Campus0")
		{
			var j=12;
		}
		var TheStyle=this.GetStyle(TheView);
		
		if (TheStyle!==null) { TheView.SetStyle(TheStyle); }
		
		this.TheDataset.Paint(this,TheView,false);
		
		if (TheStyle!==null) { TheView.RestoreStyle(); }
	}
}
/**
* Just paint the selected features.  This is called after all the other features have
* been painted to paint the selected features on top
* @override
* @param TheView - the view to paint into.
*/
CMLayer.prototype.PaintSelected=function(TheView) 
{
	if ((this.GetVisible())&&(this.TheDataset!=null))
	{
		// paint mouse over
		
		var TheStyle=this.GetStyle(TheView,undefined,"MouseOverStyle");
		
		if (CMUtilities.IsDefined(TheStyle)) 
		{ 
			TheView.SetStyle(TheStyle);
		
			this.TheDataset.Paint(this,TheView,false,true);
		
			TheView.RestoreStyle();
		}
		// paint the selected features
		var TheStyle=this.GetStyle(TheView,undefined,"SelectedStyle");
		
		if (CMUtilities.IsDefined(TheStyle)) 
		{ 
			TheView.SetStyle(TheStyle);
		
			this.TheDataset.Paint(this,TheView,true);
		
			TheView.RestoreStyle(); 
		}
	}
}
/*
* Requests search results from a layer.  The scene calls this function
* @override
* @param SearchPhrase - the phrase to search for in the layer's features
* @param ResultsPanel - the DOM element to put the results of the search into (i.e. set innerHTML)
*/
CMLayer.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
	if (this.TheDataset!=null)
	{
		this.TheDataset.GetSearchResults(SearchPhrase,ResultsPanel);
	}
}
CMLayer.prototype.ShowInfoWindow=function(FeatureIndex,TheView,RefX,RefY) 
{
	var TheHTML=this.GetFeatureSetting("Layer","InfoText",FeatureIndex,null);
	
	if (TheHTML!=null)
	{
		var InfoWindow=TheView.CreateInfoWindow("CMLayer.InfoWindow",RefX,RefY,this.GetInfoWindowWidth(),30,TheHTML);
		
		CMMainContainer.SetPopupWindow(InfoWindow);
	}
};

/*
* Allows the layer to customize the popup menu that apperas when the user right-clicks on the layer in the layer list
* @override
* @protected
* @param ThePopupMenu - 
*/
CMLayer.prototype.FillPopupMenu=function(ThePopupMenu)
{
	//********************************************
	// create the delete menu item
	var DeleteElement=document.createElement('div');
	DeleteElement.setAttribute("id","CM_DeleteElementMenuItem");
	DeleteElement.className="CM_LayerListPopupMenuItem";
	
	DeleteElement.innerHTML="Delete";
	
	DeleteElement.TheLayer=this;
	DeleteElement.ThePopupMenu=ThePopupMenu;
	
	DeleteElement.addEventListener('click', function(event)
	{
		var TheScene=this.TheLayer.GetParent(CMScene);
		
		this.ThePopupMenu.style.visibility= "hidden";
		var LayerIndex=TheScene.GetLayerIndex(this.TheLayer);
		TheScene.DeleteLayer(LayerIndex);
			
		event.stopPropagation();
	});
	
	ThePopupMenu.appendChild(DeleteElement);
	
	//********************************************
	// See if we should add the "Zoom to" option
	
	if (this.GetBounds()!=null)
	{
		var ZoomToElement=document.createElement('div');
		ZoomToElement.className="CM_LayerListPopupMenuItem";
		ZoomToElement.setAttribute("id","CM_ZoomToExtentMenuItem");
		ZoomToElement.innerHTML="Zoom To This Layer";
		
		ZoomToElement.TheLayer=this;
		
		ZoomToElement.ThePopupMenu=ThePopupMenu;
		
		ZoomToElement.addEventListener('click', function(event)
		{
			this.ThePopupMenu.style.visibility="hidden";
			
			var TheBounds=this.TheLayer.GetBounds();
			
			var TheScene=this.TheLayer.GetParent(CMScene);
												 
			var TheView=TheScene.GetView(0);
			
			TheView.ZoomToBounds(TheBounds);
			
			event.stopPropagation();
		});
		ThePopupMenu.appendChild(ZoomToElement);
	}
	
	//********************************************
	// See if we should add the "Attribute Table" option
	
/*	var TheCanvasMap=this.GetParent(CMMainContainer);
	
	var AttributePanelElement=TheCanvasMap.GetElement(CanvasMap.ATTRIBUTE_PANEL);
	var NumRows=this.GetNumAttributeRows();
	
	if ((AttributePanelElement!=null)&&(NumRows>0))
	{
		var AttributeMenuItemElement=document.createElement('div');
		AttributeMenuItemElement.className="CM_LayerListPopupMenuItem";
		AttributeMenuItemElement.setAttribute("id","CM_AttributeMenuItem");
		AttributeMenuItemElement.innerHTML="Attribute Table";
		
		AttributeMenuItemElement.TheLayer=this;
		AttributeMenuItemElement.ThePopupMenu=ThePopupMenu;
		AttributeMenuItemElement.AttributePanelElement=AttributePanelElement;
		
		AttributeMenuItemElement.addEventListener('click', function(event)
		{
			this.ThePopupMenu.style.visibility="hidden";
			
			var TheCanvasMap=this.TheLayer.GetParent(CMMainContainer);
			 
			this.TheLayer.UpdateAttributeTable(this.AttributePanelElement);
			
			event.stopPropagation();
		});
		ThePopupMenu.appendChild(AttributeMenuItemElement);
	}*/
}
//******************************************************************
// Public CMLayer functions
//******************************************************************

/**
* Add a new point to the GeoJSON data
*/
CMLayer.prototype.AddPoint=function(X,Y)
{
	if (this.TheDataset!=null)
	{
		this.TheDataset.AddPoint(X,Y);
	}
	

}
