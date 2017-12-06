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
* @enum
*/
CMLayer.MARK_CIRCLE=0;
CMLayer.MARK_TRIANGLE=1;
CMLayer.MARK_SQUARE=2;
CMLayer.MARK_STAR=3;

/**
* Global defintions for the optional properties (general and feature)
* @enum
*/
CMLayer.INFO=0; // Information when clicking on any feature or a specific feature
CMLayer.FEATURE_STYLE=1; // style for all features or each feature
CMLayer.MOUSE_OVER_STYLE=2; // mouse over style for all features or each feature
CMLayer.SELECTED_STYLE=3; 
CMLayer.ICON_IMAGE=4; // image object for points of the form: {TheImage:Image Object,OffsetX:OffsetX,OffsetY:OffsetY}
CMLayer.MARK_TYPE=5; // mark type used for points
CMLayer.MARK_SIZE=6; // mark size for points
CMLayer.ZOOM_RANGE=7; // zoom range of the form [MinZoomLevel,MaxZoomLevel]

CMLayer.LABEL_STYLE=8; // style for text labels
CMLayer.LABEL=9; // attribute column, text or array for the labels for the cities
CMLayer.LABEL_POSITION=10; // {Direction:TL,OffsetX,OffsetY}
CMLayer.LABEL_FONT=11; // style for text labels

CMLayer.LabelDirections=["TL","T","TR","R","BR","B","BL","L"]; // definitions for the direction a label will be from its point

//*****************************************************************************************************************
// Constructors
//*****************************************************************************************************************

/**
* Constructor for a layer object.  Layers contain spatial data that appears in a scene
* @public, @constructs
*/
function CMLayer() 
{
	// general properties
	
	this.TheScene=null; // this allows the layer to let the scene know when it has changed
	
	this.TheBounds=null; // the overall bounds (only as good as the information from the layers)
	 
	this.Visible=true; // false to hide the layer in the view
	this.Clickable=true; // fale to make the layer so it does nothing when clicked on 
	
	this.Name=''; // name of the layer, appears in the LAYER_LIST
	
	// optional properties 
	
	this.Properties=null;  // general properties for all features, must be set outside constructor to be unique to each layer 
	this.FeatureProperties=null;  // properties specific to individual features, must be set outside constructor to be unique to each layer 
	this.PropertyAttributes=null; // names of attributes to use with properties Key is the property and Value is the name of the attribute
	
	this.ClickTolerance=8; // number of pixels around the spatial data to see if the mouse was clicked on or moved over the feature
	
	this.InfoWindowWidth=300;
	
	this.TheProjector=null; // optional projector to have data projected when it loads
	
	// internally set properties
	
	this.SelectedFeatureIndex=-1; // array of flags for rows? (move to CMLayer)
	this.MouseOverFeatureIndex=-1; // array of flags for rows? (move to CMLayer)
	
	this.FeatureBounds=null; // bounds of each feature, cached for speed
}
//******************************************************************
// Private functions
//******************************************************************
/**
* Private utility function to update the properties when a different attribute is selected or when
* the data is loaded from the server.
* @private
*/
CMLayer.prototype.UpdatePropertiesFromAttributes=function()
{
	// setup any properties that were set by attributes
	if (this.PropertyAttributes!=null)
	{
		// go through all the properties that come from attributes
		for (var PropertyID=0;PropertyID<this.PropertyAttributes.length;PropertyID++)
		{
			var AttributeName=this.PropertyAttributes[PropertyID];
			
			// when we have a valid attribute name for a proeprty
			if (AttributeName!==undefined)
			{
				// update the attributes
				for (var j=0;j<this.GetNumAttributeRows();j++)
				{
					var Value=this.GetAttributeCellByHeading(AttributeName,j);
					
					if ((Value!==undefined)&&(Value!==""))
					{
						if ((PropertyID==CMLayer.FEATURE_STYLE)
							 ||(PropertyID==CMLayer.MOUSE_OVER_STYLE)
							 ||(PropertyID==CMLayer.SELECTED_STYLE)
							 ||(PropertyID==CMLayer.ZOOM_RANGE))
						{
							Value=JSON.parse(Value);
						}
						else if ((PropertyID==CMLayer.ICON_IMAGE))
						{
							Value=JSON.parse(Value); // image object with the "src", "XOffset", and "YOffset"
							Value.TheImage=new Image(); 
							Value.TheLayer=this;
							
							Value.TheImage.onload=function() 
							{ 
								this.TheLayer.Repaint(); 
							};
						}
						else if ((PropertyID==CMLayer.MARK_TYPE))
						{
							if (Value==="MARK_CIRCLE") Value=CMLayer.MARK_CIRCLE;
							if (Value==="MARK_TRIANGLE") Value=CMLayer.MARK_TRIANGLE;
							if (Value==="MARK_SQUARE") Value=CMLayer.MARK_SQUARE;
							if (Value==="MARK_STAR") Value=CMLayer.MARK_STAR;
						}
						else if ((PropertyID==CMLayer.MARK_SIZE))
						{
							Value=parseInt(Value);
						}
						else // all that is left is "INFO" and "LABEL" and it does not change
						{
						}
					}
					else // not attribute value found, reset the feature property so the general proprerty is used.
					{
						Value=null;
					}
					this.SetFeatureProperty(PropertyID,j,Value);
				}
			}
		}
		this.Repaint();
	}

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
	if (this.TheScene!=null) this.TheScene.LayerSettingsChanged(this);
}
/*
* Returns the current name of the layer
* @public
* @returns Name - the name of the layer
*/
CMLayer.prototype.GetName=function()  { return(this.Name); }

/*
* Make the layer visible or invisible (hidden)
* the scene will be repainted right after this call.
* @public
* @param Visible - true to make the layer visible, false for hidden
*/
CMLayer.prototype.SetVisible=function(Visible) 
{
	if (Visible!=this.Visible)
	{
		this.Visible=Visible;
		if (this.TheScene!=null) this.TheScene.Repaint();
	}
};
/*
* Returns if the layer is visible
* @public
* @returns Visible - true or false
*/
CMLayer.prototype.GetVisible=function() 
{
	return(this.Visible);
};
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
	var Result=this.Visible;
	
	if (this.Visible) // may have to check zoom range
	{
		var ZoomRange=this.GetProperty(CMLayer.ZOOM_RANGE); // typically this will not be set so this will be fast
		
		if (ZoomRange!=null) { Result=this.InZoomRange(ZoomRange); }
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
	
	if ((ZoomRange!=null)&&(this.TheScene!=null)&&(this.TheScene.GetView(0)!=null))
	{
		var TheView=this.TheScene.GetView(0);
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
		var ZoomRange=this.GetFeatureProperty(CMLayer.ZOOM_RANGE,FeatureIndex); // typically this will not be set so this will be fast
		
		if (ZoomRange!=null) { Result=this.InZoomRange(ZoomRange); }
	}
	return(Result);
};

/**
* Check if the feature is visible in the view.
* This should be called by subclasses but can also be called to limit a layer's bounds after loading.
* @public
* @param NewBounds - Bounds with format {XMin,XMax,YMin,YMax}
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
* Set the attribute that will be used for a popup-information window
* This function will be depricated in favor of the SetProperty(...) function
*/
CMLayer.prototype.SetHTMLAttribute=function(HTMLAttribute) 
{ 
	this.SetPropertyAttribute(CMLayer.INFO,HTMLAttribute); 
}
/**
* Gets the attribute that will be used for a popup-information window
* This function will be depricated in favor of the SetProperty(...) function
*/
CMLayer.prototype.GetHTMLAttribute=function() 
{ 
	var Result=this.GetPropertyAttribute(CMLayer.INFO); 

	return(Result); 
}
/**
* Sets up a projector for layer data to be projected on loading the data.
* @public
* @param NewProjector - an STProjector object to project layer data after it is loaded.
*/
CMLayer.prototype.SetProjector=function(NewProjector)
{
	this.TheProjector=NewProjector;
}
/**
* Returns the current projector.
* @public
* @returns TheProjector - an STProjector object or null.
*/
CMLayer.prototype.GetProjector=function() 
{ 
	return(this.TheProjector); 
}
/**
* Set the scene that the layer is in.  This is used by CanvasMap to link the layer to it's scene
*/
CMLayer.prototype.SetScene=function(NewScene) 
{ 
	this.TheScene=NewScene; 
}
/**
* Returns the Scene the layer is in.
* @public
* @returns TheScene - the scene the layer is contained in or null for none.
*/
CMLayer.prototype.GetScene=function() { return(this.TheScene); }
/**
* Utility function to get the CanvasMap from a layer in one call.
*/
CMLayer.prototype.GetCanvasMap=function() 
{ 
	var Result=null;
	if (this.TheScene!=null) Result=this.TheScene.TheCanvasMap;
	return(Result); 
}
/**
* Set the style to use for painting the content of the layer
* @public
* @param NewStyle - An HTML 5 Canvas style set
*/
CMLayer.prototype.SetStyle=function(NewStyle) 
{
//	this.TheStyle=NewStyle;
	this.SetProperty(CMLayer.FEATURE_STYLE,NewStyle);
	if (this.TheScene!=null) this.TheScene.LayerSettingsChanged(this);
}
/**
* Returns the style to use for painting the content of the layer
* @public
* @returns TheStyle - An HTML 5 Canvas style set or null
*/
CMLayer.prototype.GetStyle=function() 
{
	var TheStyle=this.GetProperty(CMLayer.FEATURE_STYLE,null);

	return(TheStyle);
}
// not used
/*
CMLayer.prototype.SetLabelStyle=function(NewLabelStyle) 
{
	this.TheLabelStyle=NewLabelStyle;
}
CMLayer.prototype.GetLabelStyle=function() 
{
	return(this.TheLabelStyle);
}*/
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
	this.ClickTolerance=ClickTolerance;
}
//******************************************************************
// Functions used by subclasses and not overriden
//******************************************************************
/**
* Sets the feature that is selected
* @public
* @param NewFeatureIndex - >=0 indicates a feature, -1 is for none.
*/
CMLayer.prototype.SetSelectedFeature=function(New) 
{
	if (New!=this.SelectedFeatureIndex) 
	{
		this.SelectedFeatureIndex=New;
		this.GetScene().Repaint();
	}
}
/**
* Unselects all features in the layer.  
* @public
*/
CMLayer.prototype.UnselectAll=function() 
{
	if (this.SelectedFeatureIndex!=-1) // something is selected
	{ 
		this.SelectedFeatureIndex=-1;
		this.GetScene().Repaint();
	}
}
/**
* Sets the current feature that the mouse is over
* @public
* @param NewFeatureIndex - index to the feature the mouse is over (typcially returned by In())
*/
CMLayer.prototype.SetMouseOverFeature=function(New) 
{
	if (New!=this.MouseOverFeatureIndex) 
	{
		this.MouseOverFeatureIndex=New;
		this.GetScene().Repaint();
	}
}
/**
* Returns the current feature that the mouse is over
* @public
* @returns FeatureIndex - index to the feature the mouse is over (typcially returned by In()), or -1 for none
*/
CMLayer.prototype.ResetMouseOverFeature=function() 
{
	if (this.MouseOverFeatureIndex!=-1) // something is selected
	{ 
		this.MouseOverFeatureIndex=-1;
		this.GetScene().Repaint();
	}
}
//******************************************************************
// Property Gets and Sets
//******************************************************************
/**
* Sets a property in the layer.
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param Value - value for the type (see the documentation for types for each of the properties)
*/
CMLayer.prototype.SetProperty=function(Key,Value)
{
	if (this.Properties==null)
	{
		this.Properties=new Array();
		
		// default properties
		this.Properties[CMLayer.SELECTED_STYLE]={strokeStyle:"#8888ff",fillStyle:"rgba(0,0,0,0)"};
	}
	this.Properties[Key]=Value;
}
/**
* Get a property value in the layer.
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param Default - default value to use in none has been specified as of yet (optional)
* @returns Value - curnet property value.
*/
CMLayer.prototype.GetProperty=function(Key,Default)
{
	var Result=null;
	if (Default!=undefined) Result=Default;
	
	if (this.Properties!==null)
	{
		if (Key in this.Properties) { Result=this.Properties[Key]; }
	}
	return(Result);
}
/**
* Set the attribute column to obtain property values for features from
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param Value - Heading of the column to extract values from.
*/
CMLayer.prototype.SetPropertyAttribute=function(Key,Value)
{
	if (this.PropertyAttributes==null)
	{
		this.PropertyAttributes=new Array();
	}
	this.PropertyAttributes[Key]=Value;
	
	this.UpdatePropertiesFromAttributes();
}
/**
* Get the attribute column to obtain property values for features from
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @returns Value - Heading of the column to extract values from.
*/
CMLayer.prototype.GetPropertyAttribute=function(Key)
{
	var Result=null;
	
	if (this.PropertyAttributes!==null)
	{
		if (Key in this.PropertyAttributes) { Result=this.PropertyAttributes[Key]; }
	}
	return(Result);
}
/**
* Set the feature properties as an array indexed by FeatureIndexes
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param FeatureProperties - array of properties indexed by the feature indexes
*/
CMLayer.prototype.SetFeatureProperties=function(Key,FeatureProperties)
{
	if (this.FeatureProperties==null)
	{
		this.FeatureProperties=new Array();
	}
	this.FeatureProperties[Key]=FeatureProperties;
}
/**
* Set an individual feature property based on it's FeatureIndex
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param FeatureIndex - Feature to apply the property to
* @param Value - value for the property for the feature
*/
CMLayer.prototype.SetFeatureProperty=function(Key,FeatureIndex,Value)
{
	if (this.FeatureProperties==null)
	{
		this.FeatureProperties=new Array();
	}
	if ((Key in this.FeatureProperties)==false)
	{
		this.FeatureProperties[Key]=new Array();
	}
	this.FeatureProperties[Key][FeatureIndex]=Value;
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
CMLayer.prototype.GetFeatureProperty=function(Key,FeatureIndex,Default)
{
	var Result=this.GetProperty(Key,Default);
	
	if (this.FeatureProperties!==null)
	{
		if (Key in this.FeatureProperties)
		{
			var TheArray=this.FeatureProperties[Key];
			
			if (TheArray[FeatureIndex]!=undefined) 
			{
				Result=TheArray[FeatureIndex];
			}
		}
	}
	return(Result);
}

//******************************************************************
// Painting Style functions
//******************************************************************
/* 
* Change the fill style for a specific feature
* @public
* @param FeatureIndex - Feature to apply the style to
* @param NewFillStyle - on of the CMLayer.INFO enumerated types
*/
CMLayer.prototype.SetFeatureFillStyle=function(FeatureIndex,NewFillStyle) 
{
	alert("This function is being replaced by SetProperty()");
	
	if (this.LayerFillStyles==null) this.LayerFillStyles=[];
	
	this.LayerFillStyles[FeatureIndex]=NewFillStyle;
};
CMLayer.prototype.SetColorAttribute=function(ColorAttribute) 
{ 
	alert("This function is being replaced by SetProperty()");
	
	this.ColorAttribute=ColorAttribute; 
}

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
	TheImage.TheLayer=this;
	TheImage.OffsetX=OffsetX;
	TheImage.OffsetY=OffsetY;
	
	TheImage.onload=function() 
	{ 
		this.TheLayer.SetProperty(CMLayer.ICON_IMAGE,{TheImage:this,OffsetX:this.OffsetX,OffsetY:this.OffsetY});
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
		this.TheLayer.SetFeatureProperty(CMLayer.ICON_IMAGE,this.FeatureIndex,{TheImage:this,OffsetX:this.OffsetX,OffsetY:this.OffsetY});
//		this.TheLayer.Repaint(); 
	};
	
	TheImage.src=TheURL; // triggers the load
};


//******************************************************************
// Functions for subclasses to call (protected)
//******************************************************************
/**
* Helper function to repaint the layer
* @protected
*/
CMLayer.prototype.Repaint=function()
{
	if (this.TheScene!=null) this.TheScene.Repaint();
}
/**
* Utility function to paint a point at a reference coordinate
* @protected
* @param TheView - the view to paint into
* @param FeatureIndex - the feature to paint
* @param RefX - X reference coordinate value
* @param RefY - Y reference coordinate value
* @param TheIconImage
*/
CMLayer.prototype.PaintPoint=function(TheView,FeatureIndex,RefX,RefY,TheIconImage)
{
	if (this.IsFeatureVisible(FeatureIndex))
	{
		var TheFeatureImage=this.GetFeatureProperty(CMLayer.ICON_IMAGE,FeatureIndex);
		
		if (TheFeatureImage==null) TheFeatureImage=TheIconImage; // use the general one
		
		var Result=TheView.GetPixelFromRef(RefX,RefY);
		var PixelX=Result.PixelX;
		var PixelY=Result.PixelY;
	
		if (TheFeatureImage!==null)
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
		else
		{
			// draw the mark
			
			var TheSize=this.GetFeatureProperty(CMLayer.MARK_SIZE,FeatureIndex,5);
			var TheType=this.GetFeatureProperty(CMLayer.MARK_TYPE,FeatureIndex,CMLayer.MARK_CIRCLE);
			
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
				
//					TheView.PaintRect(PixelX-HalfSize,PixelX+HalfSize,PixelY-HalfSize,PixelY+HalfSize);
			
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
		// draw the label if there is one
		var TheLabel=this.GetFeatureProperty(CMLayer.LABEL,FeatureIndex,null);
		
		if (TheLabel!=null)
		{
			var LabelStyle=this.GetFeatureProperty(CMLayer.LABEL_STYLE,FeatureIndex,null);
			var LabelPosition=this.GetFeatureProperty(CMLayer.LABEL_POSITION,FeatureIndex,null);
			var LabelFont=this.GetFeatureProperty(CMLayer.LABEL_FONT,FeatureIndex,"Arial 12px");
			
			if (LabelStyle!=null) TheView.SetStyle(LabelStyle);
			
			//************************
			// get font size to determine the width of the text to place the label
			
			var FontFace="Arial";
			var FontSize="20px";
			
			if (LabelFont!=null)
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
			// setup the parameters for drawing
			var OffsetX=10;
			var OffsetY=10;
			var Direction=null;
			
			if (LabelPosition!=null) 
			{
				OffsetX=LabelPosition.OffsetX;
				OffsetY=LabelPosition.OffsetY;
				Direction=LabelPosition.Direction;
			}
			
			// setup the font
			var TheContext=TheView.GetContext();
			
			TheContext.font = LabelFont;
			
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

//TheContext.strokeStyle="rgba(0,0,255,1)";
//				TheView.PaintRect(X,X+MaxWidth,Y,Y+Height);
				
//				TheContext.strokeStyle="rgba(0,0,255,1)";
//				TheContext.rect(PixelLeft,PixelTop,MaxWidth,FontSize*Lines.length);
//				TheContext.stroke();;
			
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
			
			if (LabelStyle!=null) TheView.RestoreStyle();
			
		}
	}
};

//******************************************************************
// Functions to be overriden by sub classes
//******************************************************************

/*
* Return an image that is appropriate to put next to the layer in the 
* layer list.
* @override
*/
//CMLayer.prototype.GetIconImage=function() { return(null); }

/*
* Subclasses should override this function and return true
* if they support a settings dialog
* @override
* @returns HasSettings - true if the layer supports a settings dialog, false otherwise.
*/
CMLayer.prototype.HasSettingsDialog=function() 
{
	return(true);
}
/*
* This provides a default settings window with the based vector drawing settings
* @override
* @public
*/
CMLayer.prototype.ShowSettingsDialog=function() 
{
	var TheDialog=CMDialogSettings.ShowSettingsDialog(this);
};

//**************************************************************
// Overrides for URL handling
//**************************************************************

/*
* Called to obtain the data for the layer from a URL.
*
* TheView is required so the layer can be repainted when data is received.
* @override, @public
* @param URL - the URL to use to obtain data
* @param NewView - the view for the scene 
*/
CMLayer.prototype.SetURL=function(URL,NewView) 
{
	alert("Sorry, SetURL() is not implemented for this layer");
}
/**
* Should be called by default after a data set is loaded so the layer can have it's properties setup
* that are based on attributes.  Can be overriden by a caller or subclass.
* @override, @public
*/
CMLayer.prototype.OnLoad=function() 
{
	this.UpdatePropertiesFromAttributes();
	
	if (this.TheScene==null)
	{
		alert("Sorry, you'll need to add the layer to the CanvasMap before you can all 'SetURL()'.");
	}
	else 
	{
		this.TheScene.SetBoundsDirty();
	}
}
//**************************************************************
// Overrides for attribute tables
//**************************************************************
/**
* Return the number of features (which is the same as the number of rows)
* in the attribute table.
* @override, @public
* @returns NumAttributes - the number of rows of attributes (number of features) in the layer.
*/
CMLayer.prototype.GetNumAttributeRows=function() { return(0); }
/**
* Return the number of columns in the attributes 
* @override, @public
* @returns NumColumns - the number of rows of attributes (number of features) in the layer.
*/
CMLayer.prototype.GetNumAttributeColumns=function() { return(0); }
/**
* Return the heading for a specific column
* @override
* @public
* @param ColumnIndex - the column to pull the attribute value from
*/
/**
* Returns all the headings for attributes in a GeoJSON file.
* @public
*/
CMLayer.prototype.GetAttributeHeadings=function() 
{ 
	var NumColumns=this.GetNumAttributeColumns();
	
	var Result=[];
	
	for (var i=0;i<NumColumns;i++)
	{
		Result.push(this.GetAttributeHeading(i));
	}
	return(Result); 
}
/**
* Return the heading for a specified column 
* @override
* @public
* @param ColumnIndex - the column to get the heading for
*/
CMLayer.prototype.GetAttributeHeading=function(ColumnIndex) 
{
	return(null);
}
/**
* Return a value from a specific cell
* @override
* @public
* @param ColumnIndex - the column to pull the attribute value from
* @param RowIndex - the row to pull the attribute value from
*/
CMLayer.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) { return(""); }
/**
* Helper function to return an entire array for an attribute
* @override
* @public
* @param Heading - the atribute/column heading to get the array from
*/
CMLayer.prototype.GetAttributeArrayByHeading=function(Heading) 
{ 
	var NumAttributeRows=this.GetNumAttributeRows();
	
	var Result=[];
	for (var i=0;i<NumAttributeRows;i++) 
	{
		Result[i]=this.GetAttributeCellByHeading(Heading,i);
	}
	return(Result); 
}
//******************************************************************
// These are for more advanced layers (like pyramids) so they can
// reload images before a paint occurs.
//******************************************************************
CMLayer.prototype.ZoomLevelChanged=function(TheView) 
{
}
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

}
/**
* Just paint the selected features.  This is called after all the other features have
* been painted to paint the selected features on top
* @override
* @param TheView - the view to paint into.
*/
CMLayer.prototype.PaintSelected=function(TheView) 
{
}
/*
* Requests search results from a layer.  The scene calls this function
* @override
* @param SearchPhrase - the phrase to search for in the layer's features
* @param ResultsPanel - the DOM element to put the results of the search into (i.e. set innerHTML)
*/
CMLayer.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{

}

