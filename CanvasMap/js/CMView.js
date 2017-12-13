/**
* CMView Class
*
* This class manages the canvas and allows the map to be zoomed and panned.
* It also provides commont painting functions such as rectangles, circles,
* text, and rasters.  The functions are available with locations in pixel
* or reference (map) coordinate values.
*
* The view is also an item that can appear in other views.  This is important
* for authors working with 3D scenes to be able to see where their views are.
*
* @module CMView
*/

/**
* Tool definitions
* @enum
*/
CMView.TOOL_HAND=1; // pan the map (the hand)
CMView.TOOL_INFO=2; // click to get information on features ("I" tool)
CMView.TOOL_EDIT=3; // user is editing existing spatial data  (not used)
CMView.TOOL_ADD=4; // user is adding data (not used)
CMView.TOOL_SELECT=5; // combined with INFO on the web (arrow tool)

/**
* Message definitions
*/
CMView.MESSAGE_MOUSE_MOVED=CMBase.GetUniqueNumber(); // AdditionalInfo=TheEvent

//******************************************************************
// Constructors
//******************************************************************
/**
* @public, @constructs
*/
function CMView() 
{
	CMItem.call(this);

	// additional settings
	
	this.CurrentTool=CMView.TOOL_SELECT;

	this.CollisionChecking=false;
	
	// other properties
	
	this.TheCanvasElement=null; // the canvas that contains this view
	
	this.ToolHandler=null;
	
	// Get the drawing context from our <canvas> 
	
	this.TheContext=null; // just used to access context quicker for drawing
	
	// objects that have been drawn into the view thus far for collision detection
	
	this.CollisionArray=null;
}
CMView.prototype=Object.create(CMItem.prototype); // inherit prototype functions from CMItem

CMView.prototype.contructor=CMView; // override the constructor to go to ours


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


//*******************************************************************
// CMView functions to handle events.
// These functions should be overriden by subclasses
//*******************************************************************

/**
* Handles a mouse down event in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseDown=function(TheEvent)
{
	var Used=false;
		
	CMMainContainer.HidePopupWindow();
	
	return(Used);
}
/**
* Handles a mouse move event in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseMove=function(TheEvent)
{
	var Used=false;
	
	if (!TheEvent) { TheEvent=window.event; }

	this.SendMessageToListeners(CMView.MESSAGE_MOUSE_MOVED,TheEvent);
	
	return(Used);
}
/**
* Handles a mouse move up in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseUp=function(TheEvent)
{
	var Used=false;
		
	if (!TheEvent) { TheEvent=window.event; }
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;
	
	return(Used);

}
/**
* Handles a mouse wheel event.  Can be overriden to change the action taken when the 
* user moves the wheel.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseWheel=function(TheEvent)
{
	var Used=false;
	
	CMMainContainer.HidePopupWindow();
	
	if (!TheEvent) { TheEvent=window.event; }
	
	var Delta=TheEvent.detail? TheEvent.detail*(-120) : TheEvent.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
	
	// prevent the wheele from scrolling the page
	
	if (TheEvent.preventDefault)  TheEvent.preventDefault()
	
	return(Used);
}


//**********************************************************
// Additional functions to be overriden by subclasses
//**********************************************************
/**
* @protected, @override
*/
CMView.prototype.GetCoordinateStringFromEvent=function(TheEvent,CoordinateUnits)
{
	
	return(Text);
}
//******************************************************************
// Protected  Functions
//******************************************************************
/**
* Used by the canvas map to give this view the ability to call its canvas map
* @protected
*/
CMView.prototype.Setup=function(TheCanvasContainer,TheCanvasElement)
{
	this.TheCanvasContainer=TheCanvasContainer;
	this.TheCanvasElement=TheCanvasElement;
	
	// Get the drawing context from our <canvas> 
	
	this.TheContext=this.TheCanvasElement.getContext('2d');
	
	this.TheCanvasElement.style.cursor="crosshair";
	this.SetTool(CMView.TOOL_SELECT);
}
/*
* 
* @protected
*/
CMView.prototype.Resize=function()
{
	var TheElement=this.TheCanvasElement;

	// the canvas aspect ratio is not correct unless we set the "width" and "height" of the element
	// rather than the style.  This must be done or it will display maps distorted
	
	var TheParent=TheElement.parentNode;
	var ParentWidth=jQuery(TheParent).width();
	var ParentHeight=jQuery(TheParent).height();

	TheElement.width=ParentWidth;
	TheElement.height=ParentHeight;
}

CMView.prototype.SetToolHandler=function(NewToolHandler)
{
	this.ToolHandler=NewToolHandler;
}
CMView.prototype.GetToolHandler=function()
{
	return(this.ToolHandler);
}
CMView.prototype.GetCanvasElement=function()
{
	return(this.TheCanvasElement);
}
CMView.prototype.GetCanvasContainer=function()
{
	return(this.TheCanvasContainer);
}

//*******************************************************************
// Mouse events
//*******************************************************************
/**
* Adds the standard event handlers to the view
*/
CMView.prototype.AddMouseEventHandlers=function()
{
	var TheCanvasElement=this.GetCanvasElement();
	
	TheCanvasElement.TheView=this; // required by the mouse functions
	
	TheCanvasElement.addEventListener("mousedown",function(TheEvent) 
	{
		if (this.TheView!=null)
		{
			this.TheView.MouseDown(TheEvent);	
			TheEvent.stopPropagation(); // stop the document from hidding a popup window
		}
	});
	TheCanvasElement.addEventListener("mousemove",function(TheEvent) 
	{
		if (this.TheView!=null)
		{
			this.TheView.MouseMove(TheEvent);
		}
	});
	TheCanvasElement.addEventListener("mouseup",function(TheEvent) 
	{
		if (this.TheView!=null)
		{
			this.TheView.MouseUp(TheEvent);	
		}
	});
	//***************************************************************************************
	// jQuery does not yet support the mouse wheel so we have to do it the old way
	
	var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
	 
	if (TheCanvasElement.attachEvent) //if IE (and Opera depending on user setting)
	{
		TheCanvasElement.attachEvent("on"+mousewheelevt, function(TheEvent)
		{
			var Result; // return result is undefined typically
			
			CMMainContainer.HidePopupWindow(); // static function
			
			var TheEvent=window.event || TheEvent // grab the event passed in or globally (IE compatibility)
			
			var Result=this.TheView.MouseWheel(TheEvent);
				
			return(Result);
		});
	}
	else if (TheCanvasElement.addEventListener) //WC3 browsers
	{
		TheCanvasElement.addEventListener(mousewheelevt, function(TheEvent)
		{
			var Result; // return result is undefined typically
			
			CMMainContainer.HidePopupWindow(); // static function
			
			var TheEvent=window.event || TheEvent // grab the event passed in or globally (IE compatibility)
			
			var Result=this.TheView.MouseWheel(TheEvent);
				
			return(Result);
		},
		false);
	}
}
/**
* Adds the mobile event handlers based on the Hammer library
*/
CMView.prototype.AddMobileEvents=function()
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
		
		// needs to call function that is overriden by subclasses
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
//******************************************************************
// Functions to ste the current tool
//******************************************************************

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
		this.TheCanvasElement.style.cursor="move";
		break;
	case CMView.TOOL_INFO:
	case CMView.TOOL_SELECT:
		this.TheCanvasElement.style.cursor="crosshair";
		break;
	case CMView.TOOL_EDIT:
		this.TheCanvasElement.style.cursor="crosshair";
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

//*******************************************************************
// CMView functions to manage painting.  Specifically styles,
// get information on fonts, and manage collisions.
//*******************************************************************
/**
* Sets a style for painting.  The existing style is saved.
* New style is an array of key value pairs (i.e.  objects).  This
* may be called on each item so it must run as fast as possible.
* @public
* @param NewStyle the style to use for painting
* @param SaveCurrentStyle - true to have the current style saved
*/
CMView.prototype.SetStyle=function(NewStyle,SaveCurrentStyle) 
{
	// this has to be saved each time so the restores are synchronized
	if (SaveCurrentStyle!==false) this.TheContext.save();
	
	if ((NewStyle!=null)&&(NewStyle!=undefined))
	{
		this.TheContext.shadowBlur=0;
		
		for (var key in NewStyle)
		{
			this.TheContext[key]=NewStyle[key];
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
	this.TheContext.clearRect(0,0,this.TheCanvasElement.width,this.TheCanvasElement.height);
	this.GetParent(CMScene).Paint(this);
};
/**
* Ends painting.  Only called by the Scene
* @protected
*/
CMView.prototype.PaintEnd=function() 
{
	this.ResetCollisions();
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
/**
* Collisions are reset at the end of painting.  This function will reset the collision
* array during painting if desired
*/
CMView.prototype.ResetCollisions=function() 
{
	if (this.CollisionChecking) // only reallocate if used
	{
		this.CollisionArray=[];
	}
}
/**
* Gets the width of the specified text in pixels based on the current font settings
*/
CMView.prototype.GetTextWidthInPixels=function(Text)
{
	var TextWidth=this.TheContext.measureText(Text).width;
	return(TextWidth);
}

//*******************************************************************
// CMView functions to paint simple graphic elements with pixel coordinates
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
		this.TheContext.fillRect(0,0,this.TheCanvasElement.width,this.TheCanvasElement.height);
	}
};
/**
* Paints a circle using pixel coordinate values
* @public
* @param X - horizontal pixel center of the circle
* @param Y - vertical pixel center of the circle
* @param RadiusInPixels - 
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
	// Fill the path we just finished drawing with color
	if (this.TheContext.fillStyle!=null) 
	{
		this.TheContext.fillRect(PixelXMin,PixelYMin,PixelXMax-PixelXMin,PixelYMax-PixelYMin);
	}
	if (this.TheContext.strokeStyle!=null) 
	{
		if ((this.TheContext.fillStyle==null)||(this.TheContext.shadowColor==undefined)) // no fill or no shadow
		{
			this.TheContext.stroke();
		}
		else // filled and has a shadow that we must disable
		{
			var TheShadowColor=this.TheContext.shadowColor;
			this.TheContext.shadowColor="rgba(0,0,0,0)";
			
			this.TheContext.strokeRect(PixelXMin,PixelYMin,PixelXMax-PixelXMin,PixelYMax-PixelYMin);
			
			this.TheContext.shadowColor=TheShadowColor;
		}
	}
}
/*
* Paints an arc based on the specified bounds.  The arc will be drawn as if it was
* drawing an oval within the bounds but only the area of the oval defined by the
* start and end angles will be painted.  This can be used to paint circles (or ovals)
* by making the start angle 0 and end angle 2*Math.PI.
*
* @public
* @param PixelXMin - Left side of the rectangle
* @param PixelXMax - Right side of the rectangle
* @param PixelYMin - Top of the rectangle
* @param PixelYMax - Bottom of the rectangle
* @param StartAngle - Start angle for the start of the arc, in radians
* @param EndAngle - End angle for the start of the arc, in radians
*/

CMView.prototype.PaintArc=function(PixelXMin,PixelXMax,PixelYMin,PixelYMax,StartAngle,EndAngle)
{
	var PixelCenterX=(PixelXMin+PixelXMax)/2;
	var PixelCenterY=(PixelYMin+PixelYMax)/2;
	
	var Radius=(PixelXMax-PixelXMin)/2;
	
	this.TheContext.save(); // save the trnasformation matrix
	
	this.TheContext.translate(PixelCenterX,PixelCenterY); // transate to center of arc's oval
	
	// scale the arc vertically with the width as the radius and the height as a multiple of the radius
	var HeightFactor=(PixelYMax-PixelYMin)/(PixelXMax-PixelXMin);
	
	this.TheContext.scale(1, HeightFactor);
	
	// draw the arc
	this.TheContext.beginPath();
	this.TheContext.arc(0, 0, Radius,StartAngle,EndAngle, false);
	
	this.TheContext.restore(); // put the original translation matrix back
	
	if (this.TheContext.strokeStyle!=null) 
	{
		this.TheContext.stroke();
	}
	if (this.TheContext.fillStyle!=null) 
	{
		this.TheContext.fill();
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
/**
* Function to paint text with the current font metrics in the context.
* @public
* @param XInPixels - left edge of the text
* @param YInPixels - base line for the text
* @param Text - the text to paint
* @param RadAngle - optional angle to rotate the text
*/
CMView.prototype.PaintText=function(XInPixels,YInPixels,Text,RadAngle)
{
	if (RadAngle!=undefined)
	{
		// translate to the deisred location and then rotate about that location
		this.TheContext.translate(XInPixels,YInPixels);
		this.TheContext.rotate(RadAngle);
	
		// render the text
		this.TheContext.fillText(Text,0,0);
	
		// take out the rotation and the translation
		this.TheContext.rotate(-RadAngle);
		this.TheContext.translate(-XInPixels,-YInPixels);
	}
	else
	{
		this.TheContext.fillText(Text,XInPixels,YInPixels);
	}
}


