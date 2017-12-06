/**
* CMView Class
*
* This class manages the canvas and allows the map to be zoomed and panned.
* It also provides commont painting functions such as rectangles, circles,
* text, and rasters.  The functions are available with locations in pixel
* or reference (map) coordinate values.
*
* @module CMView
*/

/**
* Tool definitions
* @enum
*/
CMView.TOOL_HAND=1; // pan the map
CMView.TOOL_INFO=2; // click to get information on features
CMView.TOOL_EDIT=3; // user is editing existing spatial data 
CMView.TOOL_ADD=4; // user is adding data
CMView.TOOL_SELECT=5; // combined with INFO on the web

//******************************************************************
// Constructors
//******************************************************************
/**
* @public, @constructs
*/
function CMView() 
{
	this.TheScene=null;
	
	this.RefX=0; // Left edge of the map
	this.RefY=0; // Top of the map
	
	this.ZoomLevel=0; // most zoomed in (typically 1 meter, may be a fraction of a degree)
	
	this.MinScale=1.0; // scale is computed from this (Scale=RefUnits per Pixel (Ref/Pixel))
	
	this.MinZoom=-100000; // a really big negative number
	this.MaxZoom=100000; // a really big positive number
	
	this.TheCanvas=null;
	
	// Get the drawing context from our <canvas> 
	
	this.TheContext=null;
	
	this.CurrentTool=CMView.TOOL_SELECT;
	this.Dragging=false;
	this.DragRefX=0;
	this.DragRefY=0;
	
	this.MaxBounds=null;
	
	this.CollisionChecking=false;
	this.CollisionArray=null;
}

//******************************************************************
// Private CMView Functions (should not need to be called from outside this class)
//******************************************************************

CMView.prototype.Private_CheckMaxBounds=function()
{
	var TheScale=this.GetScale();
	
	var RefWidth=this.TheCanvas.width*TheScale;
	var RefHeight=-this.TheCanvas.height*TheScale;
	
	if (this.MaxBounds!=null)
	{
		if ((this.MaxBounds.XMax-this.MaxBounds.XMin)<RefWidth) // area is smaller than allowed, center the data
		{
			// center on the center of the max bounds
			
			var NewCenterRefX=((this.MaxBounds.XMax+this.MaxBounds.XMin)/2);
			
			this.RefX=NewCenterRefX-(RefWidth/2);
		}
		else
		{
			if (this.RefX<this.MaxBounds.XMin) this.RefX=this.MaxBounds.XMin;
			if ((this.RefX+RefWidth)>this.MaxBounds.XMax) this.RefX=this.MaxBounds.XMax-RefWidth;
		}
		
		if ((this.MaxBounds.YMax-this.MaxBounds.YMin)<-RefHeight) // area is smaller than allowed, center the data
		{
			// center on the center of the max bounds
			
			var NewCenterRefY=((this.MaxBounds.YMax+this.MaxBounds.YMin)/2);
			
			this.RefY=NewCenterRefY-(RefHeight/2);
		}
		else
		{
			if (this.RefY>this.MaxBounds.YMax) this.RefY=this.MaxBounds.YMax;
		
			if ((this.RefY+RefHeight)<this.MaxBounds.YMin) this.RefY=this.MaxBounds.YMin-RefHeight;
		}
	}
}

//******************************************************************
// Protected  Functions
//******************************************************************

//CMView.prototype.SetMinScale=function(MinScale) { this.MinScale=MinScale; }
/**
* Used by the scene to link with it's veiews 
* @protected
*/
CMView.prototype.SetScene=function(NewScene)
{
	this.TheScene=NewScene;
}
/**
* Used by the canvas map to give this view the ability to call its canvas map
* @protected
*/
CMView.prototype.Setup=function(TheCanvas)
{
	this.TheCanvas=TheCanvas;
	
	// Get the drawing context from our <canvas> 
	
	this.TheContext=this.TheCanvas.getContext('2d');
	
	this.TheCanvas.style.cursor="crosshair";
	this.SetTool(CMView.TOOL_SELECT);
}
/*
* Returns the current scale in RefUnits per pixel
* @private
*/
CMView.prototype.GetScale=function()
{
	var CurrentScale=Math.pow(2,-this.ZoomLevel)*this.MinScale;
	
	return(CurrentScale);
}

//******************************************************************
// Public CMView Functions
//******************************************************************
/**
* Returns the context for the CanvasMap's canvas.  This is not used
* often but is required do things like great gradients.
* @public
*/
CMView.prototype.GetContext=function()
{
	return(this.TheContext);
}
/**
* Returns the current extent of the viewing area in reference units
* @public
* @returns The reference bounds of the canvas map { XMin,XMax,YMin,YMax }
*/
CMView.prototype.GetExtent=function()
{
	var TheExtent={};
	
	var TheScale=this.GetScale();
	
	TheExtent.XMin=this.RefX;
	TheExtent.YMax=this.RefY;
	TheExtent.XMax=this.RefX+(this.TheCanvas.width*TheScale);
	TheExtent.YMin=this.RefY-(this.TheCanvas.height*TheScale);
	
	return(TheExtent);
}

//*******************************************************************
// Mouse events
//*******************************************************************
/**
* Handles a mouse down event in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @public
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseDown=function(TheEvent)
{
	if (!TheEvent) { TheEvent=window.event; }
	
	CanvasMap.HidePopupWindow();
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvas);
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
		
		var Used=this.TheScene.MouseDown(this,RefX,RefY);
		
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
CMView.prototype.MouseMove=function(TheEvent)
{
	if (!TheEvent) { TheEvent=window.event; }

	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvas);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;
	
	if (this.Dragging==true)
	{
		var RefWidth=this.GetRefWidthFromPixelWidth(PixelX);
		var RefHeight=this.GetRefHeightFromPixelHeight(PixelY);
		
		this.RefX=this.DragX-RefWidth;
		this.RefY=this.DragY-RefHeight;
		
		this.Private_CheckMaxBounds();
		
		this.TheScene.ViewMoved(this);
//		this.SendMessage(this,VIEW_MOVED);
		
		this.Paint();
	}
	else
	{
		var RefX=this.GetRefXFromPixelX(PixelX);
		var RefY=this.GetRefYFromPixelY(PixelY);
		
		var Used=this.TheScene.MouseMove(this,RefX,RefY);
	}
}
/**
* Handles a mouse move up in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @public
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseUp=function(TheEvent)
{
	if (!TheEvent) { TheEvent=window.event; }
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvas);
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
		
		var Used=this.TheScene.MouseUp(this,RefX,RefY);
	}

}
/**
* Handles a mouse wheel event.  Can be overriden to change the action taken when the 
* user moves the wheel.
* @public
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseWheel=function(TheEvent)
{
	CanvasMap.HidePopupWindow();
	
	if (!TheEvent) { TheEvent=window.event; }
	
	var Delta=TheEvent.detail? TheEvent.detail*(-120) : TheEvent.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
//	var Delta=TheEvent.detail*-120;
	
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
		
		if (NewZoomLevel<this.MinZoom) NewZoomLevel=this.MinZoom;
		if (NewZoomLevel>this.MaxZoom) NewZoomLevel=this.MaxZoom;
	
		if (NewZoomLevel!=this.ZoomLevel)
		{
			// find the position to zoom to
			
			var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvas);
			var MousePixelX=Coordinate.x;
			var MousePixelY=Coordinate.y;
	
			
			var MouseRefX=this.GetRefXFromPixelX(MousePixelX);
			var MouseRefY=this.GetRefYFromPixelY(MousePixelY);
			
			this.ZoomLevel=NewZoomLevel;
			
			var NewMouseRefWidth=this.GetRefWidthFromPixelWidth(MousePixelX);
			var NewMouseRefHeight=this.GetRefHeightFromPixelHeight(MousePixelY);
			
			this.RefX=MouseRefX-NewMouseRefWidth; // subtract from the mouse back to the left (west)
			this.RefY=MouseRefY-NewMouseRefHeight; // add the height to move up to the north
			
			this.TheScene.ZoomLevelChanged(this);
			this.Paint();
		}
	}
	// prevent the wheele from scrolling the page
	
	if (TheEvent.preventDefault)  TheEvent.preventDefault()
	
	return(false);
}
//*******************************************************************
// 
//*******************************************************************
/**
* Sets the maximum baonds the view will allow it self to be panned.
* @public
* @param MaxBounds - { XMin,XMax,YMin,YMax }
*/
CMView.prototype.SetMaxBounds=function(MaxBounds)
{
	this.MaxBounds=MaxBounds;
}

/**
* Sets the Minimum and maximum zoom levels for the map.
* @public
* @param MinZoom - lowest allowed value for the zoom level
* @param MaxZoom - hightest allowed value for the zoom level.
*/
CMView.prototype.SetZoomRange=function(MinZoom,MaxZoom)
{
	this.MinZoom=MinZoom;
	this.MaxZoom=MaxZoom;
}

/**
* Sets the center of the map to the specified coordinate
* @public
* @param RefX - 
* @param RefY - 
*/
CMView.prototype.SetRefCenter=function(RefX,RefY)
{
	var TheScale=this.GetScale();
	
	var RefWidth=this.TheCanvas.width*TheScale;
	var RefHeight=-this.TheCanvas.height*TheScale;
	
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
CMView.prototype.GetRefCenter=function()
{
	var TheScale=this.GetScale();
	
	var RefWidth=this.TheCanvas.width*TheScale;
	var RefHeight=this.TheCanvas.height*TheScale;

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
CMView.prototype.ZoomToBounds=function(NewBounds)
{
	if (NewBounds==null) alert("Sorry, you cannot call CMView.ZoomToBounds(NewBounds) with NewBounds=null.");
	else
	{
		var width=this.TheCanvas.width;
		var height=this.TheCanvas.height;	
		
		// Determine how much to TheScale our coordinates by
		var TheScale=Math.abs(NewBounds.XMax - NewBounds.XMin)/width;
		var yScale=Math.abs(NewBounds.YMax - NewBounds.YMin)/height;
		
		if (TheScale < yScale)  TheScale=yScale; // if xScale < yScale, use xScale, else use yScale
		
		// zoom out until we find a zoom level that is appropriate
		
		this.ZoomLevel=20;
		if (this.ZoomLevel>this.MaxZoom) this.ZoomLevel=this.MaxZoom;
		
		while ((this.GetScale()<TheScale)&&(this.ZoomLevel>this.MinZoom))
		{
			this.ZoomLevel--;
		}
		var CenterRefX=(NewBounds.XMax+NewBounds.XMin)/2;
		var CenterRefY=(NewBounds.YMin+NewBounds.YMax)/2;
		
		this.SetRefCenter(CenterRefX,CenterRefY);
		
		this.TheScene.ZoomLevelChanged(this);
	}
}
/*
* Zoom in to a higher resolution (map units are doubled relative to pixels)
* @public
*/
CMView.prototype.ZoomIn=function()
{
	this.ZoomTo(this.ZoomLevel+1);
}
/*
* Zoom in to a lower resolution (map units are halved relative to pixels)
* @public
*/
CMView.prototype.ZoomOut=function()
{
	this.ZoomTo(this.ZoomLevel-1);
}
/**
* Zoom to a specific zoom level.  This can be fractional value.
* @public
* @param ZoomLevel - desired zoom level, 1 is 1:1 pixels to reference units
*/
CMView.prototype.ZoomTo=function(ZoomLevel)
{
	if (ZoomLevel<this.MinZoom) ZoomLevel=this.MinZoom;
	if (ZoomLevel>this.MaxZoom) ZoomLevel=this.MaxZoom;
	
	if (ZoomLevel!=this.ZoomLevel)
	{
		var RefX=this.GetRefXFromPixelX(this.TheCanvas.width/2);
		var RefY=this.GetRefYFromPixelY(this.TheCanvas.height/2);
	
		this.ZoomLevel=ZoomLevel;
	
		this.SetRefCenter(RefX,RefY);
		this.TheScene.ZoomLevelChanged(this);
		this.Paint();
	}
}
/**
* Zoom to the maxum bounds that have been set in the veiw
* @public
*/
CMView.prototype.ZoomToMaxBounds=function()
{
	this.ZoomToBounds(this.MaxBounds);
}
/**
* Returns the current zoom level.  1 is one pixel per one map unit, doubles with each
* zoom in so 2 is two pixels per map unit, 3 is 4 pixels per map unit, 4 is 16 pixels per map unit, etc.
* @public
* @returns ZoomLevel
*/
CMView.prototype.GetZoomLevel=function()
{
	return(this.ZoomLevel);
}

/**
* Change the current tool that will be used when the user clicks with 
* the mouse 
* @public
* @param NewTool from the enums: CMView.TOOL_HAND,...
*/
CMView.prototype.SetTool=function(NewTool)
{
	 switch(NewTool)
	 {
	case CMView.TOOL_HAND:
		this.TheCanvas.style.cursor="move";
		break;
	case CMView.TOOL_INFO:
	case CMView.TOOL_SELECT:
		this.TheCanvas.style.cursor="crosshair";
		break;
	case CMView.TOOL_EDIT:
		this.TheCanvas.style.cursor="crosshair";
		break;
	 }

	this.CurrentTool=NewTool;
}

/**
* Returns the current tool
* @public
* @returns NewTool from the enums: CMView.TOOL_HAND,...
*/
CMView.prototype.GetTool=function() { return(this.CurrentTool); }

//******************************************************************
// Functions to convert from PixelXs to RefXs (geographic) and back.
//******************************************************************
/**
* Converts a horiziontal coordinate value to a horizontal pixel value
* @public
* @param RefX horiziontal coordinate value in reference coordinates
* @returns PixelX
*/
CMView.prototype.GetPixelXFromRefX=function(RefX) 
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
CMView.prototype.GetPixelYFromRefY=function(RefY) 
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
CMView.prototype.GetPixelFromRef=function(RefX,RefY) 
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
CMView.prototype.GetPixelWidthFromRefWidth=function(RefWidth) 
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
CMView.prototype.GetPixelHeightFromRefHeight=function(RefHeight) 
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
CMView.prototype.GetRefWidthFromPixelWidth=function(PixelWidth) 
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
CMView.prototype.GetRefHeightFromPixelHeight=function(PixelHeight) 
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
CMView.prototype.GetRefXFromPixelX=function(PixelX) 
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
CMView.prototype.GetRefYFromPixelY=function(PixelY) 
{
	var TheScale=this.GetScale();
	var RefY=-(PixelY*TheScale-this.RefY);
	
	return(RefY);
};
//*******************************************************************
// Functions to convert from reference coordinates to pixel coordinates
//*******************************************************************
/*CMView.prototype.InDocumentPixel=function(PixelX,PixelY) 
{
//	var canvas=document.getElementById(this.CanvasID);
    var rect=this.TheCanvas.getBoundingClientRect();
 	
	var PixelX=PixelX-rect.left;
	var PixelY=PixelY-rect.top;
  	
	var Result=this.InCanvasPixel(PixelX,PixelY);
	
	return(Result);
}
CMView.prototype.InCanvasPixel=function(PixelX,PixelY) 
{
	var RefX=this.GetRefXFromPixelX(PixelX);
	var RefY=this.GetRefYFromPixelY(PixelY);
	
	var Result=null;
	for (var i=0;(i<this.Layers.length)&&(Result==null);i++)
	{
		var FeatureIndex=this.Layers[i].In(TheView,RefX,RefY);
		
		if (FeatureIndex!=-1)
		{
			Result=
			{ 
				TheLayer: this.Layers[i],
				FeatureIndex: FeatureIndex
			};
		}
	}
	
	return(Result);
};*/
//*******************************************************************
// Functions to paint
//*******************************************************************
/**
* Sets a style for painting.  The existing style is saved.
* New style is an array of key value pairs (i.e.  objects)
* @public
* @param NewStyle the style to use for painting
* @param SaveCurrentStyle - true to have the current style saved
*/
CMView.prototype.SetStyle=function(NewStyle,SaveCurrentStyle) 
{
	if (SaveCurrentStyle!==false) this.TheContext.save();
	
	if (NewStyle!=null)
	{
		for (var key in NewStyle)
		{
			var Value=NewStyle[key];
			
			this.TheContext[key]=Value;
		}
	}
}
/**
* Saves the current style to a stack
* @public
*/
CMView.prototype.SaveStyle=function() 
{
	this.TheContext.save();
}
/**
* Restores the style from the stack
* @public
*/
CMView.prototype.RestoreStyle=function() 
{
	this.TheContext.restore();
}
/**
* Starts painting.  Only called by the Scene
* @protected
*/
CMView.prototype.PaintStart=function() 
{
	if (this.CollisionChecking)
	{
		this.CollisionArray=[];
	}
}
/**
* Paints the contents of the view.  Called by the Scene which is called by the
* CanvasMap object.
* @public
*/
CMView.prototype.Paint=function() 
{
	this.TheContext.clearRect(0,0,this.TheCanvas.width,this.TheCanvas.height);
	this.TheScene.Paint(this);
};
/**
* Ends painting.  Only called by the Scene
* @protected
*/
CMView.prototype.PaintEnd=function() 
{
	this.CollisionArray=null;
}
/**
* Checks if there was a collision between the specific bounds and a point feature
* that has already been painted.  Typically only called by a layer.
* @protected
*/
CMView.prototype.CheckCollision=function(Bounds) 
{
	var Result=false;
	
	if (this.CollisionArray!==null) // CollisionChecking==true
	{
		for (var i=0;(i<this.CollisionArray.length)&&(Result==false);i++)
		{
			if (CMUtilities.BoundsOverlap(Bounds,this.CollisionArray[i]))
			{
				Result=true;
			}											   
		}
	}
	return(Result);
}
/**
* Checks if there was a collision between the specific bounds and a point feature
* that has already been painted.  Typically only called by a layer.
* @protected
*/
CMView.prototype.AddToCollisions=function(Bounds) 
{
	if (this.CollisionArray!==null) // CollisionChecking==true
	{
		this.CollisionArray.push(Bounds);
	}

}
//*******************************************************************
// Functions to paint simple graphic elements with pixel coordinates
//*******************************************************************

/**
* Paints an image at the specified pixel location.
* CanvasMap object.
* @public
* @param TheImage
* @param PixelX
* @param PixelY
*/
CMView.prototype.PaintImage=function(TheImage,PixelX,PixelY)
{
	this.TheContext.drawImage(TheImage,PixelX,PixelY);
};
/**
* Paints the background of the canvas element.
* @public
*/
CMView.prototype.PaintBackground=function()
{
//	if (Color!=null) 
	{
		this.TheContext.fillRect(0,0,this.TheCanvas.width,this.TheCanvas.height);
	}
};
/**
* Paints a circle using pixel coordinate values
* @public
* @param X
* @param Y
* @param RadiusInPixels
*/
CMView.prototype.PaintCircle=function(X,Y,RadiusInPixels)
{
	this.TheContext.beginPath();
	
	this.TheContext.arc(X,Y,RadiusInPixels,0,2*Math.PI);
	
	if (this.TheContext.strokeStyle!=null) this.TheContext.stroke();
	if (this.TheContext.fillStyle!=null) this.TheContext.fill();
};
/*
* Paints a rectangle based on the specified bounds
* @public
* @param PixelXMin - Left side of the rectangle
* @param PixelXMax - Right side of the rectangle
* @param PixelYMin - Top of the rectangle
* @param PixelYMax - Bottom of the rectangle
*/
CMView.prototype.PaintRect=function(PixelXMin,PixelXMax,PixelYMin,PixelYMax)
{
	if (this.TheContext.strokeStyle!=null) 
	{
		this.TheContext.strokeRect(PixelXMin,PixelYMin,PixelXMax-PixelXMin,PixelYMax-PixelYMin);
	}
	if (this.TheContext.fillStyle!=null) 
	{
		this.TheContext.fillRect(PixelXMin,PixelYMin,PixelXMax-PixelXMin,PixelYMax-PixelYMin);
	}
}
/*
* Function to paint a rounded rectangle
* Adapted from: http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
* @public
* @param PixelXMin - Left side of the rectangle
* @param PixelXMax - Right side of the rectangle
* @param PixelYMin - Top of the rectangle
* @param PixelYMax - Bottom of the rectangle
* @param PixelXRadius - Horizontal radius or both if PixelYRadius is not specified
* @param PixelYRadius - Vertical radius of the corners
*/
CMView.prototype.PaintRoundedRect=function(PixelXMin,PixelXMax,PixelYMin,PixelYMax,PixelXRadius,PixelYRadius) 
{
	if (typeof PixelYRadius === 'undefined') { PixelYRadius=PixelXRadius; }
	
	this.TheContext.beginPath();
	this.TheContext.moveTo(PixelXMin + PixelXRadius, PixelYMin); // left side of top
	this.TheContext.lineTo(PixelXMax - PixelXRadius, PixelYMin); // right side of top
	this.TheContext.quadraticCurveTo(PixelXMax, PixelYMin, PixelXMax, PixelYMin+PixelYRadius); // top of right side
	this.TheContext.lineTo(PixelXMax, PixelYMax-PixelYRadius); // bottom of right side
	this.TheContext.quadraticCurveTo(PixelXMax, PixelYMax, PixelXMax - PixelXRadius,PixelYMax); // right of bottom
	this.TheContext.lineTo(PixelXMin+PixelXRadius, PixelYMax); // left of bottom
	this.TheContext.quadraticCurveTo(PixelXMin, PixelYMax, PixelXMin, PixelYMax - PixelYRadius); // bottom of left side
	this.TheContext.lineTo(PixelXMin, PixelYMin+PixelYRadius); // top of left side
	this.TheContext.quadraticCurveTo(PixelXMin, PixelYMin, PixelXMin+PixelXRadius,PixelYMin); // back to left side of top
	this.TheContext.closePath();
	
	if (this.TheContext.strokeStyle!=null) this.TheContext.stroke();
	if (this.TheContext.fillStyle!=null) this.TheContext.fill();
}
//*******************************************************************
// Functions to paint simple graphic elements with reference coordinates
//*******************************************************************
/**
* Paints a rectangle based on the bounds.
* @public
* @param TheBounds
*/
CMView.prototype.PaintRefBounds=function(TheBounds)
{
	this.PaintRefRect(TheBounds.XMin,TheBounds.XMax,TheBounds.YMin,TheBounds.YMax);
}
/**
* Paints a rectangle based on the specified bounds.
* @public
* @param XMin
* @param XMax
* @param YMin
* @param YMax
*/
CMView.prototype.PaintRefRect=function(XMin,XMax,YMin,YMax)
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
* Function to draw a circle from a reference coordinate
* @public
* @param X
* @param Y
* @param RadiusInPixels
*/
CMView.prototype.PaintRefCircle=function(X,Y,RadiusInPixels)
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
*/
CMView.prototype.PaintRefText=function(X,Y,Text)
{
	var Result=this.GetPixelFromRef(X,Y);
	var XInPixels=Result.PixelX;
	var YInPixels=Result.PixelY;
	
	this.TheContext.fillText(Text,XInPixels,YInPixels);
}
/**
* Function to draw a line using reference coordinates
* @public
* @param X1
* @param Y1
* @param X2
* @param Y2
*/
CMView.prototype.PaintRefLine=function(X1,Y1,X2,Y2)
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
CMView.prototype.PaintRefPoly2=function(Xs,Ys,Closed,Stroke)
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
			var PixelX=Math.round(Result.PixelX);
			var PixelY=Math.round(Result.PixelY);
			
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
		if (Stroke===true) this.TheContext.stroke();
	}
}
//**********************************************************
// Functions to paint raster data with reference coordinates
//**********************************************************

/**
* Function to paint an image using reference coordinates
* @public
* @param TheImage - 
* @param RefX - Left side of the image
* @param RefY
*/
CMView.prototype.PaintRefImage=function(TheImage,RefX,RefY) 
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
CMView.prototype.PaintRefImageScaled=function(TheImage,RefX,RefY,RefWidth,RefHeight)
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
* @public
* @param TheCoordinates
*/
CMView.prototype.PaintRefPolygon=function(TheCoordinates)
{
	this.PaintRefPoly(TheCoordinates,true);
}
/*
* Draw a simple line string using the specified coordinates
* @public
* @param TheCoordinates
*/
CMView.prototype.PaintRefLineString=function(TheCoordinates)
{
	this.PaintRefPoly(TheCoordinates,false);
}
/*
* Draw a simple poly using the specified coordinates
* @public
* @param TheCoordinates
* @param Closed
*/
CMView.prototype.PaintRefPoly=function(TheCoordinates,Closed)
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
// Functions to draw GeoJSON data
//**********************************************************
/*
* Paint a geometry that is in reference coordinates (i.e. GeoJSON)
* @public
* @param TheGeometry
*/
CMView.prototype.PaintRefGeometry=function(TheGeometry)
{
	if (TheGeometry.type=="LineString")
	{
		this.PaintRefLineString(TheGeometry.coordinates);
	}
	else if (TheGeometry.type=="MultiLineString")
	{
		for (var j=0;j<TheGeometry.coordinates.length;j++)
		{
			TheCoordinates=TheGeometry.coordinates[j];

			this.PaintRefLineString(TheCoordinates);
		}
	}
	else if (TheGeometry.type=="Polygon")
	{
		for (var j=0;j<TheGeometry.coordinates.length;j++)
		{
			TheCoordinates=TheGeometry.coordinates[j];

			this.PaintRefPolygon(TheCoordinates);
		}
	}
	else if (TheGeometry.type=="MultiPolygon")
	{
		for (var i=0;i<TheGeometry.coordinates.length;i++)
		{
			var TheCoordinateArrays=TheGeometry.coordinates[i];
			
			for (var j=0;j<TheCoordinateArrays.length;j++)
			{
				TheCoordinates=TheCoordinateArrays[j];

				this.PaintRefPolygon(TheCoordinates);
			}
		}
	}
	else if (TheGeometry.type=="GeometryCollection")
	{
		for (var j=0;j<TheGeometry.geometries.length;j++)
		{
			this.PaintRefGeometry(TheGeometry.geometries[j]);
		}
	}
}
//**********************************************************
// Functions to create windows from the viewing area
//**********************************************************
/**
* Creates an info popup window and displays the specific HTML.
* jjg - not sure this should be in CMView
* @public
* @param ID
* @param RefX
* @param RefY
* @param WindowWidth
* @param WindowHeight
* @param TheHTML
*/
CMView.prototype.CreateInfoWindow=function(ID,RefX,RefY,WindowWidth,WindowHeight,TheHTML)
{
	var PixelX=this.GetPixelXFromRefX(RefX);
	var PixelY=this.GetPixelYFromRefY(RefY);
	
	var Offset=jQuery(this.TheCanvas).offset();
	
	var CanvasBounds=this.TheCanvas.getBoundingClientRect();
	PixelX+=CanvasBounds.left;
	PixelY+=CanvasBounds.top;
	
	var TheCanvsMap=this.TheScene;
	var TheImageFolder=TheCanvasMap.ImageFolder;
	
	var InfoWindow=CMUtilities.CreateInfoWindow(ID,PixelX,PixelY,WindowWidth,WindowHeight,TheHTML,TheImageFolder);

	return(InfoWindow);
}