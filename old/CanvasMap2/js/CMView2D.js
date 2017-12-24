/**
* CMView2D Class
*
* This class manages the canvas and allows the map to be zoomed and panned.
* It also provides commont painting functions such as rectangles, circles,
* text, and rasters.  The functions are available with locations in pixel
* or reference (map) coordinate values.
*
* The view is also an item that can appear in other views.  This is important
* for authors working with 3D scenes to be able to see where their views are.
*
* @module CMView2D
*/
//******************************************************************
// Definitions
//******************************************************************
/**
* Below are the settings definitions.
* @public, @settings
*/
CMView2D.SettingDefintions=
{
	View2D:
	{
		MinZoom: { Name:"Min Zoom",Type:CMBase.DATA_TYPE_FLOAT, Default:-100000 },
		MaxZoom: { Name:"Max Zoom",Type:CMBase.DATA_TYPE_FLOAT, Default:100000 },
		MaxBounds: { Name:"Max Bounds",Type:CMBase.DATA_TYPE_COORDINATES, Default:100000 }
	}
};


//******************************************************************
// Constructors
//******************************************************************
/**
* @public, @constructs
*/
function CMView2D() 
{
	CMView.call(this);

	// settings for the area displayed in the view
	
	this.RefX=0; // Left edge of the map
	this.RefY=0; // Top of the map
	
//	this.MaxBounds=null;
	this.TimeSlices[0].Settings.View2D=	
	{
		MinZoom:-100000,
		MaxZoom:100000,
		MaxBounds:null
	};
	
	// settings for the zoom level
	
	this.ZoomLevel=0; // most zoomed in (typically 1 meter, may be a fraction of a degree)
	
//	this.MinZoom=-100000; // a really big negative number
//	this.MaxZoom=100000; // a really big positive number
	
	// other properties
	
	this.MinScale=1.0; // scale is computed from this (Scale=RefUnits per Pixel (Ref/Pixel))
	
	this.TheCanvasElement=null; // the canvas that contains this view
	
	this.ToolHandler=null;
	
	// Get the drawing context from our <canvas> 
	
	this.TheContext=null; // just used to access context quicker for drawing
}
CMView2D.prototype=Object.create(CMView.prototype); // inherit prototype functions from CMItem

CMView2D.prototype.contructor=CMView2D; // override the constructor to go to ours
//******************************************************************
// CMBase Functions
//******************************************************************

CMView2D.prototype.CMView_GetSettingsDefinitions=CMView.prototype.GetSettingsDefinitions;

CMView2D.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMView_GetSettingsDefinitions();
	
	for (Key in CMView2D.SettingDefintions)
	{
		Result[Key]=CMView2D.SettingDefintions[Key];
	}

	return(Result); 
}
//******************************************************************
// Private CMView2D Functions 
//******************************************************************
/**
* If the MaxBounds has been set, check the current view bounds against it.
* @private
*/
CMView2D.prototype.CheckMaxBounds=function()
{
	var TheScale=this.GetScale();
	
	var RefWidth=this.TheCanvasElement.width*TheScale;
	var RefHeight=-this.TheCanvasElement.height*TheScale;
	
	var MaxBounds=this.GetSetting("View2D","MaxBounds");
	
	if (MaxBounds!=null)
	{
		if ((MaxBounds.Xs[1]-MaxBounds.Xs[0])<RefWidth) // area is smaller than allowed, center the data
		{
			// center on the center of the max bounds
			
			var NewCenterRefX=((MaxBounds.Xs[1]+MaxBounds.Xs[0])/2);
			
			this.RefX=NewCenterRefX-(RefWidth/2);
		}
		else
		{
			if (this.RefX<MaxBounds.Xs[0]) this.RefX=MaxBounds.Xs[0];
			if ((this.RefX+RefWidth)>MaxBounds.Xs[1]) this.RefX=MaxBounds.Xs[1]-RefWidth;
		}
		
		if ((MaxBounds.Ys[1]-MaxBounds.Ys[0])<-RefHeight) // area is smaller than allowed, center the data
		{
			// center on the center of the max bounds
			
			var NewCenterRefY=((MaxBounds.Ys[1]+MaxBounds.Ys[0])/2);
			
			this.RefY=NewCenterRefY-(RefHeight/2);
		}
		else
		{
			if (this.RefY>MaxBounds.Ys[1]) this.RefY=MaxBounds.Ys[1];
		
			if ((this.RefY+RefHeight)<MaxBounds.Ys[0]) this.RefY=MaxBounds.Ys[0]-RefHeight;
		}
	}
}
/*
* Returns the current scale in RefUnits per pixel
* @private
*/
CMView2D.prototype.GetScale=function()
{
	var CurrentScale=this.MinScale/Math.pow(2,this.ZoomLevel);
	
	return(CurrentScale);
}


//******************************************************************
// CMView mouse evenet functions that have been overridden
//******************************************************************

/**
* Adds the mobile event handlers based on the Hammer library
*/
CMView2D.prototype.AddMobileEvents=function()
{
	// create a simple instance
	// by default, it only adds horizontal recognizers
	var mc = new Hammer(CanvasContainer);
	
	// let the pan gesture support all directions.
	// this will block the vertical scrolling on a touch-device while on the element
	mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
	var pinch = new Hammer.Pinch();
	
	mc.add([pinch]);
	
	mc.TheView=this;
	
	// listen to events...
	mc.on("pinch panleft panright panup pandown", function(ev)  //  tap press
	{
		var TheView=mc.TheView;
		
		var RefDistance=TheView.GetRefWidthFromPixelWidth(CMMainContainer.GESTURE_PAN);
		var RefCenter=TheView.GetRefCenter();
		var RefX=RefCenter.RefX;
		var RefY=RefCenter.RefY;

		MapHeader.innerHTML=ev.type;
		
		if (ev.type=="panup")
		{
			RefY-=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="pandown")
		{
			RefY+=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="panleft")
		{
			RefX+=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="panright")
		{
			RefX-=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
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
	});	 
}

/**
* Handles a mouse down event in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @public
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView2D.prototype.MouseDown=function(TheEvent)
{
	var Used=false;
		
	if (!TheEvent) { TheEvent=window.event; }
	
	CMMainContainer.HidePopupWindow();
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;
	
	if (this.CurrentTool==CMView.TOOL_HAND) // dragging the scene around in the view
	{
		// get the current position of the mouse in ref coordinates and save it
		
		this.DragX=this.GetRefXFromPixelX(PixelX);
		this.DragY=this.GetRefYFromPixelY(PixelY);
		this.Dragging=true;
		Used=true;
	}
	else //if (this.CurrentTool==CMView.TOOL_INFO) // pass the mousedown to the scene
	{
		var RefX=this.GetRefXFromPixelX(PixelX);
		var RefY=this.GetRefYFromPixelY(PixelY);
		
		if (this.ToolHandler!=null)
		{
			Used=this.ToolHandler.MouseDown(this,RefX,RefY,TheEvent);
		}
		if (Used==false)
		{
			Used=this.GetParent(CMScene).MouseDown(this,RefX,RefY,TheEvent);
		}
		
		if (Used==false) // allow the info tool to drag if it did not find anything
		{
			this.DragX=this.GetRefXFromPixelX(PixelX);
			this.DragY=this.GetRefYFromPixelY(PixelY);
			this.Dragging=true;
			Used=true;
		}
	}
	return(Used);
}
/**
* Handles a mouse move event in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @public
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView2D.prototype.MouseMove=function(TheEvent)
{
	var Used=false;
	
	if (!TheEvent) { TheEvent=window.event; }

	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;
		
	this.SendMessageToListeners(CMView.MESSAGE_MOUSE_MOVED,TheEvent);
	
	if (this.Dragging==true)
	{
		var RefWidth=this.GetRefWidthFromPixelWidth(PixelX);
		var RefHeight=this.GetRefHeightFromPixelHeight(PixelY);
		
		this.RefX=this.DragX-RefWidth;
		this.RefY=this.DragY-RefHeight;
		
		this.CheckMaxBounds();
		
		this.Paint();
	}
	else
	{
		var RefX=this.GetRefXFromPixelX(PixelX);
		var RefY=this.GetRefYFromPixelY(PixelY);
		
		if (this.ToolHandler!=null)
		{
			Used=this.ToolHandler.MouseMove(this,RefX,RefY,TheEvent);
		}
		if (Used==false)
		{
			Used=this.GetParent(CMScene).MouseMove(this,RefX,RefY,TheEvent);
		}
	}
	return(Used);
}
/**
* Handles a mouse move up in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @public
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView2D.prototype.MouseUp=function(TheEvent)
{
	var Used=false;
		
	if (!TheEvent) { TheEvent=window.event; }
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;
	
	if (this.Dragging)
	{
		this.DragX=0;
		this.DragY=0;
		this.Dragging=false;
	}
	else //if (this.CurrentTool==CMView.TOOL_INFO)
	{
		var RefX=this.GetRefXFromPixelX(PixelX);
		var RefY=this.GetRefYFromPixelY(PixelY);
		
		if (this.ToolHandler!=null)
		{
			Used=this.ToolHandler.MouseUp(this,RefX,RefY,TheEvent);
		}
		if (Used==false)
		{
			Used=this.GetParent(CMScene).MouseUp(this,RefX,RefY,TheEvent);
		}
	}
	return(Used);

}
/**
* Handles a mouse wheel event.  Can be overriden to change the action taken when the 
* user moves the wheel.
* @public
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView2D.prototype.MouseWheel=function(TheEvent)
{
	var Used=false;
	
	CMMainContainer.HidePopupWindow();
	
	if (!TheEvent) { TheEvent=window.event; }
	
	var Delta=TheEvent.detail? TheEvent.detail*(-120) : TheEvent.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
	
	if (Delta!=0)	
	{
		// get the current position of the mouse
		
		var NewZoomLevel=this.ZoomLevel;
		
		if (Delta>0)
		{
			NewZoomLevel=NewZoomLevel+1;
		}
		else
		{
			NewZoomLevel=NewZoomLevel-1;
		}
		
		var MinZoom=this.GetSetting("View2D","MinZoom");
		var MaxZoom=this.GetSetting("View2D","MaxZoom");
		
		if (NewZoomLevel<MinZoom) NewZoomLevel=MinZoom;
		if (NewZoomLevel>MaxZoom) NewZoomLevel=MaxZoom;
	
		if (NewZoomLevel!=this.ZoomLevel)
		{
			// find the position to zoom to
			
			var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
			var MousePixelX=Coordinate.x;
			var MousePixelY=Coordinate.y;
			
			var MouseRefX=this.GetRefXFromPixelX(MousePixelX);
			var MouseRefY=this.GetRefYFromPixelY(MousePixelY);
			
			this.ZoomLevel=NewZoomLevel;
			
			var NewMouseRefWidth=this.GetRefWidthFromPixelWidth(MousePixelX);
			var NewMouseRefHeight=this.GetRefHeightFromPixelHeight(MousePixelY);
			
			this.RefX=MouseRefX-NewMouseRefWidth; // subtract from the mouse back to the left (west)
			this.RefY=MouseRefY-NewMouseRefHeight; // add the height to move up to the north
			
			CMDataset.ResetRequests();
			
			this.Paint();
		}
	}
	// prevent the wheele from scrolling the page
	
	if (TheEvent.preventDefault)  TheEvent.preventDefault()
	
	return(Used);
}
//******************************************************************
// CMView public functions
//******************************************************************
CMView2D.prototype.GetCoordinateStringFromEvent=function(TheEvent,CoordinateUnits)
{
	var TheCanvasElement=this.GetCanvasElement();
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;

	var RefX=this.GetRefXFromPixelX(PixelX);
	var RefY=this.GetRefYFromPixelY(PixelY);

	var TheProjector=this.GetParent(CMMainContainer).GetProjector();
	
	var Text=CMUtilities.GetCoordinateString(RefX,RefY,CoordinateUnits,TheProjector,this);
	
	return(Text);
}

//******************************************************************
// CMView2D public functions for managing the spatial bounds and position
//******************************************************************
/**
* Returns the current extent of the viewing area in reference units
* @public
* @returns The reference bounds of the canvas map { XMin,XMax,YMin,YMax }
*/
CMView2D.prototype.GetExtent=function()
{
	var TheExtent={};
	
	var TheScale=this.GetScale();
	
	TheExtent.XMin=this.RefX;
	TheExtent.YMax=this.RefY;
	TheExtent.XMax=this.RefX+(this.TheCanvasElement.width*TheScale);
	TheExtent.YMin=this.RefY-(this.TheCanvasElement.height*TheScale);
	
	return(TheExtent);
}
/**
* Sets the maximum baonds the view will allow it self to be panned.
* @public
* @param MaxBounds - { XMin,XMax,YMin,YMax }
*/
/*
CMView2D.prototype.SetMaxBounds=function(MaxBounds)
{
	this.MaxBounds=MaxBounds;
}
*/
/**
* Sets the center of the map to the specified coordinate
* @public
* @param RefX - 
* @param RefY - 
*/
CMView2D.prototype.SetRefCenter=function(RefX,RefY)
{
	var TheScale=this.GetScale();
	
	var RefWidth=this.TheCanvasElement.width*TheScale;
	var RefHeight=-this.TheCanvasElement.height*TheScale;
	
	this.RefX=RefX-(RefWidth/2);
	this.RefY=RefY-(RefHeight/2); // RefHeight<0 so this is additive

	if (this.MaxBounds!=null)
	{
		if (this.RefX<this.MaxBounds.XMin) this.RefX=this.MaxBounds.XMin;
		if (this.RefY>this.MaxBounds.YMax) this.RefY=this.MaxBounds.YMax;
		
		if ((this.RefX+RefWidth)>this.MaxBounds.XMax) this.RefX=this.MaxBounds.XMax-RefWidth;
		if ((this.RefY+RefHeight)<this.MaxBounds.YMin) this.RefY=this.MaxBounds.YMin-RefHeight;
	}
	this.Paint();
}
/**
* Returns the coordinate that is in the center of the view
* @public
* @returns Result - 
*/
CMView2D.prototype.GetRefCenter=function()
{
	var TheScale=this.GetScale();
	
	var RefWidth=this.TheCanvasElement.width*TheScale;
	var RefHeight=this.TheCanvasElement.height*TheScale;

	var Result={
		RefX:this.RefX+(RefWidth/2),
		RefY:this.RefY-(RefHeight/2)
	};
	
	return(Result);
}
/**
* Zooms the view to the specified bounds.  Selects a zoom level that will
* contain the entire map.
* @public
* @param NewBounds - 
*/
CMView2D.prototype.ZoomToBounds=function(NewBounds)
{
	if (NewBounds==null) alert("Sorry, you cannot call CMView2D.ZoomToBounds(NewBounds) with NewBounds=null.");
	else
	{
		var width=this.TheCanvasElement.width;
		var height=this.TheCanvasElement.height;	
		
		// Determine how much to TheScale our coordinates by
		var TheScale=Math.abs(NewBounds.XMax - NewBounds.XMin)/width;
		var yScale=Math.abs(NewBounds.YMax - NewBounds.YMin)/height;
		
		if (TheScale < yScale)  TheScale=yScale; // if xScale < yScale, use xScale, else use yScale
		
		// zoom out until we find a zoom level that is appropriate
		var OldZoomLevel=this.ZoomLevel;
		
		var MinZoom=this.GetSetting("View2D","MinZoom");
		var MaxZoom=this.GetSetting("View2D","MaxZoom");
		
		this.ZoomLevel=20;
		if (this.ZoomLevel>MaxZoom) this.ZoomLevel=MaxZoom;
		
		while ((this.GetScale()<TheScale)&&(this.ZoomLevel>MinZoom))
		{
			this.ZoomLevel--;
		}
		
		// reset the dataset requests if the zoom level changed
		if (this.ZoomLevel!=OldZoomLevel) // zoom level changed
		{
			CMDataset.ResetRequests();
		}
		// reset the center of the map to the center of the bounds
		var CenterRefX=(NewBounds.XMax+NewBounds.XMin)/2;
		var CenterRefY=(NewBounds.YMin+NewBounds.YMax)/2;
		
		this.SetRefCenter(CenterRefX,CenterRefY);
	}
}
/**
* Zoom to the maxum bounds that have been set in the veiw
* @public
*/
CMView2D.prototype.ZoomToMaxBounds=function()
{
	var TheBounds=this.MaxBounds;
	
	if (TheBounds==null)
	{
		TheBounds=this.GetParent(CMScene).GetBounds();
	}
	if (TheBounds!=null) this.ZoomToBounds(TheBounds);
}
//*******************************************************************
// CMView2D public functions for managing the zoom level
//*******************************************************************
/**
* Sets the Minimum and maximum zoom levels for the map.
* @public
* @param MinZoom - lowest allowed value for the zoom level
* @param MaxZoom - hightest allowed value for the zoom level.
*//*
CMView2D.prototype.SetZoomRange=function(MinZoom,MaxZoom)
{
	this.MinZoom=MinZoom;
	this.MaxZoom=MaxZoom;
}
*/
/*
* Zoom in to a higher resolution (map units are doubled relative to pixels)
* @public
*/
CMView2D.prototype.ZoomIn=function()
{
	this.ZoomTo(this.ZoomLevel+1);
}
/*
* Zoom in to a lower resolution (map units are halved relative to pixels)
* @public
*/
CMView2D.prototype.ZoomOut=function()
{
	this.ZoomTo(this.ZoomLevel-1);
}
/**
* Zoom to a specific zoom level.  This can be fractional value.
* @public
* @param ZoomLevel - desired zoom level, 1 is 1:1 pixels to reference units
*/
CMView2D.prototype.ZoomTo=function(ZoomLevel)
{
	var MinZoom=this.GetSetting("View2D","MinZoom");
	var MaxZoom=this.GetSetting("View2D","MaxZoom");
	
	if (ZoomLevel<MinZoom) ZoomLevel=MinZoom;
	if (ZoomLevel>MaxZoom) ZoomLevel=MaxZoom;
	
	if (ZoomLevel!=this.ZoomLevel)
	{
		var RefX=this.GetRefXFromPixelX(this.TheCanvasElement.width/2);
		var RefY=this.GetRefYFromPixelY(this.TheCanvasElement.height/2);
	
		this.ZoomLevel=ZoomLevel;
	
		CMDataset.ResetRequests();
		
		this.SetRefCenter(RefX,RefY); // calls Paint()
		
//		this.Paint();
	}
}
/**
* Returns the current zoom level.  1 is one pixel per one map unit, doubles with each
* zoom in so 2 is two pixels per map unit, 3 is 4 pixels per map unit, 4 is 16 pixels per map unit, etc.
* @public
* @returns ZoomLevel
*/
CMView2D.prototype.GetZoomLevel=function()
{
	return(this.ZoomLevel);
}


//******************************************************************
// CMView2D public functions to convert from PixelXs to RefXs (geographic) and back.
//******************************************************************
/**
* Converts a horiziontal coordinate value to a horizontal pixel value
* @public
* @param RefX horiziontal coordinate value in reference coordinates
* @returns PixelX
*/
CMView2D.prototype.GetPixelXFromRefX=function(RefX) 
{
 	var PixelX;
	
	var TheScale=this.GetScale();
	PixelX=(RefX - this.RefX) / TheScale;
	
	return(PixelX);
}
/**
* Converts a vertical coordinate value to a vertical pixel value
* @public
* @param RefY vertical coordinate value in reference coordinates
* @returns PixelY
*/
CMView2D.prototype.GetPixelYFromRefY=function(RefY) 
{
 	var TheScale=this.GetScale();
	var PixelY=(this.RefY - RefY) / TheScale;
	
	return(PixelY);
};
/**
* Converts a horiziontal reference coordinate to a horizontal pixel coordinate value
* @public
* @param RefX horiziontal coordinate value in reference coordinates
* @param RefY vertical coordinate value in vertical coordinates
* @returns PixelCoordinate - { PixelX,PixelY }
*/
CMView2D.prototype.GetPixelFromRef=function(RefX,RefY) 
{
	var PixelX=this.GetPixelXFromRefX(RefX);
	var PixelY=this.GetPixelYFromRefY(RefY);
	
	var Result=
	{
  		PixelX: PixelX,
 		PixelY: PixelY
 	}
	return(Result);
}
/**
* Converts a horiziontal reference width to a pixel width value
* @public
* @param RefWidth horiziontal reference value
* @returns PixelWidth -
*/
CMView2D.prototype.GetPixelWidthFromRefWidth=function(RefWidth) 
{
	var TheScale=this.GetScale();
 	var PixelWidth=RefWidth/TheScale;
	
	return(PixelWidth);
}
/**
* Converts a vertical reference height to a pixel height
* @public
* @param RefHeight vertical height in reference units
* @returns PixelHeight -
*/
CMView2D.prototype.GetPixelHeightFromRefHeight=function(RefHeight) 
{
	var TheScale=this.GetScale();
	var PixelHeight=-RefHeight/TheScale;
	
	return(PixelHeight);
}
//*******************************************************************
// Functions to convert from reference coordinates to pixel coordinates
//*******************************************************************
/**
* Converts a horiziontal reference width to a horizontal pixel width 
* @public
* @param PixelWidth horiziontal width in pixels 
* @returns RefWidth - horiziontal reference width
*/
CMView2D.prototype.GetRefWidthFromPixelWidth=function(PixelWidth) 
{
	var TheScale=this.GetScale();
 	var RefWidth=PixelWidth*TheScale;
	
	return(RefWidth);
}
/**
* Converts a vertical reference height to a vertical pixel widthheight
* @public
* @param PixelHeight vertical height in pixels 
* @returns RefHeight - vertical reference height
*/
CMView2D.prototype.GetRefHeightFromPixelHeight=function(PixelHeight) 
{
	var TheScale=this.GetScale();
 	var RefHeight=-PixelHeight*TheScale;
	
	return(RefHeight);
}
/**
* Converts a horiziontal reference value to a horizontal pixel value 
* @public
* @param PixelX horiziontal coordinate value in pixels 
* @returns RefX - horiziontal reference coordinate value
*/
CMView2D.prototype.GetRefXFromPixelX=function(PixelX) 
{
	var TheScale=this.GetScale();
	var RefX=PixelX*TheScale+this.RefX;
	
	return(RefX);
};
/**
* Converts a vertical reference value to a vertical pixel value 
* @public
* @param PixelY vertical coordinate value in pixels 
* @returns RefY - vertical reference coordinate value
*/
CMView2D.prototype.GetRefYFromPixelY=function(PixelY) 
{
	var TheScale=this.GetScale();
	var RefY=-(PixelY*TheScale-this.RefY);
	
	return(RefY);
};

//*******************************************************************
// CMView2D public functions to paint simple graphic elements with reference coordinates
//*******************************************************************
/**
* Paints a rectangle based on the bounds.
* @public
* @param TheBounds
*/
CMView2D.prototype.PaintRefBounds=function(TheBounds)
{
	this.PaintRefRect(TheBounds.XMin,TheBounds.XMax,TheBounds.YMin,TheBounds.YMax);
}
/**
* Paints a rectangle based on the specified bounds.
* @public
* @param XMin - left edge of the rectangle
* @param XMax - right edge of the rectangle
* @param YMin - top edge of the rectangle
* @param YMax - bottom edge of the rectangle
*/
CMView2D.prototype.PaintRefRect=function(XMin,XMax,YMin,YMax)
{
	var Result=this.GetPixelFromRef(XMin,YMax);
	var PixelXMin=Result.PixelX;
	var PixelYMin=Result.PixelY;
	
	var Result=this.GetPixelFromRef(XMax,YMin);
	var PixelXMax=Result.PixelX;
	var PixelYMax=Result.PixelY;
	
	this.PaintRect(PixelXMin,PixelXMax,PixelYMin,PixelYMax);
};
/**
* Paint an arc using reference coordinates.  Can paint a circle by specifying
* a StartAngle of 0 and an End angle of Math.PI*2
* @public
* @param XMin - left edge of the rectangle
* @param XMax - right edge of the rectangle
* @param YMin - top edge of the rectangle
* @param YMax - bottom edge of the rectangle
* @param StartAngle - start of the arc in radians, 0 is up
* @param EndAngle - end of the arc in radians
*/
CMView2D.prototype.PaintRefArc=function(XMin,XMax,YMin,YMax,StartAngle,EndAngle)
{
	var Result=this.GetPixelFromRef(XMin,YMax);
	var PixelXMin=Result.PixelX;
	var PixelYMin=Result.PixelY;
	
	var Result=this.GetPixelFromRef(XMax,YMin);
	var PixelXMax=Result.PixelX;
	var PixelYMax=Result.PixelY;
	
	this.PaintArc(PixelXMin,PixelXMax,PixelYMin,PixelYMax,StartAngle,EndAngle);
};
/**
* Paint a rounded rectangle using reference coordinates
* @public
* @param XMin - left edge of the rectangle
* @param XMax - right edge of the rectangle
* @param YMin - top edge of the rectangle
* @param YMax - bottom edge of the rectangle
* @param RefXRadius - width/2 of the retangle containing the arc.
* @param RefYRadius - height/2 of the retangle containing the arc.
*/
CMView2D.prototype.PaintRefRoundedRect=function(XMin,XMax,YMin,YMax,RefXRadius,RefYRadius) 
{
	var Result=this.GetPixelFromRef(XMin,YMax);
	var PixelXMin=Result.PixelX;
	var PixelYMin=Result.PixelY;
	
	var Result=this.GetPixelFromRef(XMax,YMin);
	var PixelXMax=Result.PixelX;
	var PixelYMax=Result.PixelY;
	
	var PixelXRadius=this.GetPixelWidthFromRefWidth(RefXRadius);
	var PixelYRadius=this.GetPixelWidthFromRefWidth(RefYRadius);
	
	this.PaintRoundedRect(PixelXMin,PixelXMax,PixelYMin,PixelYMax,PixelXRadius,PixelYRadius);
}
/**
* Function to draw a circle from a reference coordinate
* @public
* @param X
* @param Y
* @param RadiusInPixels
*/
CMView2D.prototype.PaintRefCircle=function(X,Y,RadiusInPixels)
{
	var Result=this.GetPixelFromRef(X,Y);
	var XInPixels=Result.PixelX;
	var YInPixels=Result.PixelY;
	
	this.PaintCircle(XInPixels,YInPixels,RadiusInPixels);
};
/**
* Function to draw text using reference coordinates
* @public
* @param X
* @param Y
* @param Text
* @param Centered = optional, true to center
*/
/*
CMView2D.prototype.PaintRefText=function(X,Y,Text,Centered,RadAngle)
{
	var Result=this.GetPixelFromRef(X,Y);
	var XInPixels=Result.PixelX;
	var YInPixels=Result.PixelY;
	var Offset=0;
	
	if (Centered===true)
	{
		var TextWidth=this.TheContext.measureText(Text).width;
		
		Offset=(TextWidth/2);
	}
	if (RadAngle!=undefined)
	{
		this.TheContext.translate(XInPixels,YInPixels);
		this.TheContext.rotate(RadAngle);
	
		this.TheContext.fillText(Text,-Offset,0);
	
		this.TheContext.rotate(-RadAngle);
		this.TheContext.translate(-XInPixels,-YInPixels);
	}
	else
	{
		this.TheContext.fillText(Text,XInPixels-Offset,YInPixels);
	}
}*/
/**
* Draw text using reference a reference coordinate.  The coordinate is the left side
* of the baseline for the text.  If collision checking is enabled, only text that does
* not collide will be painted.
* @public
* @param Text - String of text to draw
* @param RefX - left side of the baseline
* @param RefY - vertical position of the baseline
* @param FontSize - Height of the font in pixels, required for bounds checking to work properly
* @param HAlign - horizontal alignment.  Left is the default, "right" and "center" also supported
* @param RadAngle - angle of the text.  Horizontal is the default, PI/2 and -PI/2 are also supported.
*/
CMView2D.prototype.PaintRefText=function(Text,RefX,RefY,FontSize,HAlign,RadAngle)
{
	var TextWidth=this.GetTextWidthInPixels(Text);
	
	var RefTextWidth=this.GetRefWidthFromPixelWidth(TextWidth);
	
	if (RadAngle===undefined) RadAngle=0;
	
	// find the lower left corner of the text
	
	// assume we are left justified with no rotation
	var PixelX=this.GetPixelXFromRefX(RefX);
	var PixelY=this.GetPixelYFromRefY(RefY);
	
	var Bounds;
	
	if (RadAngle===0) // not rotated
	{
		if (HAlign==="center")
		{
			PixelX=this.GetPixelXFromRefX(RefX-(RefTextWidth/2));
		}
		else if (HAlign==="right")
		{
			PixelX=this.GetPixelXFromRefX(RefX-RefTextWidth);
		}
		else // must be left aligned
		{
		}
		Bounds={
			XMin:PixelX,
			XMax:PixelX+TextWidth,
			YMin:PixelY-FontSize,
			YMax:PixelY
		};
	
	}
	else if (RadAngle===Math.PI/2) // rotated 90 degrees clockwise
	{
		PixelX=this.GetPixelXFromRefX(RefX);
		
		if (HAlign==="center")
		{
			PixelY=this.GetPixelYFromRefY(RefY+(RefTextWidth/2));
		}
		else if (HAlign==="right")
		{
			PixelY=this.GetPixelYFromRefY(RefY+RefTextWidth);
		}
		else // must be left aligned
		{
			PixelY=this.GetPixelYFromRefY(RefY);
		}
		Bounds={
			XMin:PixelX,
			XMax:PixelX+FontSize,
			YMin:PixelY,
			YMax:PixelY+TextWidth
		};
	}
	else if (RadAngle===-Math.PI/2) // rotated 90 degrees counter-clockwise
	{
		PixelX=this.GetPixelXFromRefX(RefX);
		
		if (HAlign==="center")
		{
			PixelY=this.GetPixelYFromRefY(RefY-(RefTextWidth/2));
		}
		else if (HAlign==="right")
		{
			PixelY=this.GetPixelYFromRefY(RefY-RefTextWidth);
		}
		else // must be left aligned
		{
			PixelY=this.GetPixelYFromRefY(RefY);
		}
		Bounds={
			XMin:PixelX-FontSize,
			XMax:PixelX,
			YMin:PixelY-TextWidth,
			YMax:PixelY
		};
	}
	else
	{
		alert("Sorry, rotations other than 0,PI/2 and -PI/2 are not supported at this time");
	}
/*	if (false) // debugging
	{
		this.SaveStyle();
		
		this.SetStyle({fillStyle:"rgba(0,0,0,0)",strokeStyle:"red"});
		
		this.PaintRect(Bounds.XMin,Bounds.XMax,Bounds.YMin,Bounds.YMax);
		
		this.RestoreStyle();
	}
*/	if (this.CheckCollision(Bounds)==false)
	{
		this.AddToCollisions(Bounds);
	
		this.PaintText(PixelX,PixelY,Text,RadAngle); // different
	}
}
/**
* Function to draw a line between two reference coordinates
* @public
* @param X1 - horizontal value for first coordinate
* @param Y1 - vertical value for first coordinate
* @param X2 - horizontal value for second coordinate
* @param Y2 - vertical value for second coordinate
*/
CMView2D.prototype.PaintRefLine=function(X1,Y1,X2,Y2)
{
	var Result=this.GetPixelFromRef(X1,Y1);
	var XInPixels1=Result.PixelX;
	var YInPixels1=Result.PixelY;
	
	var Result=this.GetPixelFromRef(X2,Y2);
	var XInPixels2=Result.PixelX;
	var YInPixels2=Result.PixelY;
	
	this.TheContext.beginPath();
	this.TheContext.moveTo(XInPixels1,YInPixels1);
	this.TheContext.lineTo(XInPixels2,YInPixels2);
	this.TheContext.stroke();
}
/**
* Function to paint a polygon.
* @public
* @param Xs - array of horiziontal coordinate values in reference units
* @param Ys
* @param Closed - true to close the polygon (filled)
* @param Stroke - true to stroke (outline) the polygon
*/
CMView2D.prototype.PaintRefPoly2=function(Xs,Ys,Closed,Stroke)
{
	if (Xs!=undefined)
	{
		// draw each additional coordinate that is greater than one pixel from the current coordinate
		
		var PixelX;
		var PixelY;
		var FirstPixelX;
		var FirstPixelY;
		var LastPixelX;
		var LastPixelY;
		
		for (var j=0; j < Xs.length; j++) 
		{
			var RefX=Xs[j];
			var RefY=Ys[j];
	
			// Scale the points of the coordinate
			
			Result=this.GetPixelFromRef(RefX,RefY);
			var PixelX=(Result.PixelX);
			var PixelY=(Result.PixelY);
			
			if (j==0) // fist segment
			{
				this.TheContext.beginPath();
				this.TheContext.moveTo(PixelX, PixelY);
		
				FirstPixelX=PixelX;
				FirstPixelY=PixelY;
		
				LastPixelX=PixelX;
				LastPixelY=PixelY;
			}
			if ((PixelX!=LastPixelX)||(PixelY!=LastPixelY))
			{
				this.TheContext.lineTo(PixelX, PixelY); 
				
				LastPixelX=PixelX;
				LastPixelY=PixelY;
			}
		}
	
		// Fill the path we just finished drawing with color
		if (Closed) 
		{
			this.TheContext.lineTo(FirstPixelX, FirstPixelY); 
			this.TheContext.fill();
		}
		if (Stroke===true) 
		{
			if ((Closed==false)||(this.TheContext.shadowColor==undefined)) // no fill or no shadow
			{
				this.TheContext.stroke();
			}
			else // filled and has a shadow that we must disable
			{
				var TheShadowColor=this.TheContext.shadowColor;
				this.TheContext.shadowColor="rgba(0,0,0,0)";
				
				this.TheContext.stroke();
				
				this.TheContext.shadowColor=TheShadowColor;
			}
		}
	}
}
//**********************************************************
// CMView2D public functions to paint raster data with reference coordinates
//**********************************************************

/**
* Function to paint an image using reference coordinates
* @public
* @param TheImage - 
* @param RefX - Left side of the image
* @param RefY
*/
CMView2D.prototype.PaintRefImage=function(TheImage,RefX,RefY) 
{
	var Result=this.GetPixelFromRef(RefX,RefY);
	var XInPixels1=Result.PixelX;
	var YInPixels1=Result.PixelY;
	
	this.TheContext.drawImage(TheImage,XInPixels1,YInPixels1);
}
/*
* Function to draw a raster using a bounding box in reference coordinates
* The second parameter may be a RefX or a Bounds object.
* @public
* @param TheImage - 
* @param RefX - Left side of the image or a bound box
* @param RefY - Top of the image
* @param RefWidth - width of the image
* @param RefHeight
*/
CMView2D.prototype.PaintRefImageScaled=function(TheImage,RefX,RefY,RefWidth,RefHeight)
{
	var Type=typeof(RefX);
	
	if (Type=="object")
	{
		TheBounds=RefX;
		
		RefX=TheBounds.XMin;
		RefY=TheBounds.YMax;
		RefWidth=TheBounds.XMax-TheBounds.XMin;
		RefHeight=TheBounds.YMin-TheBounds.YMax;
	}
	
	var Result=this.GetPixelFromRef(RefX,RefY);
	var XInPixels1=Math.round(Result.PixelX);
	var YInPixels1=Math.round(Result.PixelY);
	
	var PixelWidth=this.GetPixelWidthFromRefWidth(RefWidth);
	var PixelHeight=this.GetPixelHeightFromRefHeight(RefHeight);
	
	PixelWidth=Math.round(PixelWidth);
	PixelHeight=Math.round(PixelHeight);
	
	this.TheContext.drawImage(TheImage,XInPixels1,YInPixels1,PixelWidth,PixelHeight);
}
//**********************************************************
// Functions to draw using coordinates in arrays with:
// TheCoordinates[n][0] - X
// TheCoordinates[n][1] - Y
// These are compatible with GeoJSON coordinates.
//**********************************************************
/*
* Draw a simple poly using the specified coordinates
* @protected
* @param TheCoordinates
* @param Closed
*/
CMView2D.prototype.PaintRefPoly=function(TheCoordinates,Closed)
{
	if (TheCoordinates!=undefined)
	{
		// get the starting coordinates
		
		var RefX=TheCoordinates[0][0];
		var RefY=TheCoordinates[0][1];

		var Result=this.GetPixelFromRef(RefX,RefY);
		var PixelX=Math.round(Result.PixelX);
		var PixelY=Math.round(Result.PixelY);
		
		this.TheContext.beginPath();
		this.TheContext.moveTo(PixelX, PixelY);
		
		var LastPixelX=PixelX;
		var LastPixelY=PixelY;
		
		// draw each additional coordinate that is greater than one pixel from the current coordinate
		
		for (var j=1; j < TheCoordinates.length; j++) 
		{
			RefX=TheCoordinates[j][0];
			RefY=TheCoordinates[j][1];
	
			// Scale the points of the coordinate
			
			Result=this.GetPixelFromRef(RefX,RefY);
			PixelX=Math.round(Result.PixelX);
			PixelY=Math.round(Result.PixelY);
			
			if ((PixelX!=LastPixelX)||(PixelY!=LastPixelY))
			{
				this.TheContext.lineTo(PixelX, PixelY); 
				
				LastPixelX=PixelX;
				LastPixelY=PixelY;
			}
		}
	
		// Fill the path we just finished drawing with color
		if (Closed) this.TheContext.fill();
		
		this.TheContext.stroke();
	}
}
//**********************************************************
// CMView2D functions to create windows from the viewing area
//**********************************************************
/**
* Creates an info popup window and displays the specific HTML.
* @public
* @param ID
* @param RefX
* @param RefY
* @param WindowWidth
* @param WindowHeight
* @param TheHTML
*/
CMView2D.prototype.CreateInfoWindow=function(ID,RefX,RefY,WindowWidth,WindowHeight,TheHTML)
{
	var PixelX=this.GetPixelXFromRefX(RefX);
	var PixelY=this.GetPixelYFromRefY(RefY);
	
	var Offset=jQuery(this.TheCanvasElement).offset();
	
	var CanvasBounds=this.TheCanvasElement.getBoundingClientRect();
	PixelX+=CanvasBounds.left;
	PixelY+=CanvasBounds.top;
	
	var TheCanvasMap=this.GetParent(CMMainContainer);
	var TheImageFolder=TheCanvasMap.ImageFolder;
	
	var InfoWindow=CMUtilities.CreateInfoWindow(ID,PixelX,PixelY,WindowWidth,WindowHeight,TheHTML,TheImageFolder);

	return(InfoWindow);
}

