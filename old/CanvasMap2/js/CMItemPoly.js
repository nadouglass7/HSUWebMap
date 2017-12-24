//******************************************************************
// CMItemPoly Class
//
// Represents:
// - Straight lines
// - Polylines
// - Polygons
// - Bezier curves
// - Bezier polygons
// Also a superclass for the CMItemPolyArrow class
//******************************************************************
//******************************************************************
// Definitions
//******************************************************************
/**
* Below are the settings definitions.
* @public, @settings
*/
CMItemPoly.SettingDefintions=
{
	Curve:
	{
		Coordinates: { Name:"Coordinates",Type:CMBase.DATA_TYPE_COORDINATES, Default:null }
	}
};

//******************************************************************
// CMItemPoly Constructor
//******************************************************************
/**
* Basic rectangular object
*/
function CMItemPoly() 
{
	CMItem.call(this);
	
	
	this.Anchor=null; // JSON with X,Y
	this.Dragging=false;
	this.Creating=false;
	this.SelectedPart=-1;
	
	this.TimeSlices[0].Settings.Curve=	
	{
		Coordinates:
		{
			Xs:[0,10,20,30,40,50],
			Ys:[0,10,20,30,40,50]
		}
	};
}

CMItemPoly.prototype=Object.create(CMItem.prototype); // inherit prototype functions from PanelBase()

CMItemPoly.prototype.contructor=CMItemPoly; // override the constructor to go to ours

//******************************************************************
// Private Functions
//******************************************************************
/**
* @private
*/
CMItemPoly.prototype.GetAnchor=function(TheView,RefX,RefY,ThePart)
{
	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();

	var Tolerance=TheView.GetRefWidthFromPixelWidth(3);
	
	var Result=this.GetControlPoints(MinTime);
	
	var AnchorY=RefX-Result.Xs[ThePart];
	var AnchorX=RefY-Result.Ys[ThePart];
		
	return({X:AnchorX,Y:AnchorY});
}
//******************************************************************
// CMBase Functions
//******************************************************************

CMItemPoly.prototype.GetName=function()  { return("Curve"); }

CMItemPoly.prototype.CMItem_GetSettingsDefinitions=CMItem.prototype.GetSettingsDefinitions; // save the superclass function

CMItemPoly.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMItem_GetSettingsDefinitions(); // get the settings definitions from the superclass
	
	for (Key in CMItemPoly.SettingDefintions)
	{
		Result[Key]=CMItemPoly.SettingDefintions[Key];
	}

	return(Result); 
}

//******************************************************************
// CMItem Functions
//******************************************************************
CMItemPoly.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;

	if ((Used==false)&&(this.Creating)) // either creating
	{
		var TheScene=this.GetParent(CMScene);
		
		var MinTime=TheScene.GetTimeRange();
		
		var ControlPoints=this.GetControlPoints(MinTime);
		
		var NumPoints=ControlPoints.Xs.length;
		
		if (TheEvent.detail==2) // double click
		{
			this.Creating=false;
			this.Dragging=false;
			ControlPoints.Xs.pop(); // remove the last point which was added by the second button click
			ControlPoints.Ys.pop(); // remove the last point which was added by the second button click
		}
		else // add a point
		{
			ControlPoints.Xs.splice(NumPoints-1,0,RefX);
			ControlPoints.Ys.splice(NumPoints-1,0,RefY);
		}
		this.SetControlPoints(MinTime,ControlPoints.Xs,ControlPoints.Ys);
		
		Used=true;
		this.Repaint();
	}
	if ((Used==false)&&((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT))) // select a part to drag
	{
		var SelectedPart=this.InPart(TheView,RefX,RefY,3);

		if (SelectedPart!=-1)
		{
			this.Dragging=true;
			this.SelectedPart=SelectedPart;
			this.Anchor=this.GetAnchor(TheView,RefX,RefY,SelectedPart);
			Used=true;
		}
	}
	return(Used);
}

CMItemPoly.prototype.MouseMove=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
//	if (this.Clickable)
	{
		var TheScene=this.GetParent(CMScene);
		
		var MinTime=TheScene.GetTimeRange();
		
		if (this.Creating)
		{
			var ControlPoints=this.GetControlPoints(MinTime);
			
			var NumPoints=ControlPoints.Xs.length;
			
			ControlPoints.Xs[NumPoints-1]=RefX;
			ControlPoints.Ys[NumPoints-1]=RefY;
			
			this.Repaint();
		}
		else if (this.Dragging) // dragging an existing item (create or update)
		{
			var ControlPoints=this.GetControlPoints(MinTime);
			
			ControlPoints.Xs[this.SelectedPart]=RefX+this.Anchor.X;
			ControlPoints.Ys[this.SelectedPart]=RefY+this.Anchor.Y;
			
			this.Repaint();
		}
		else // update the mouse cursor
		{
			var ThePart=this.InPart(TheView,RefX,RefY,3);
			
			if (ThePart!==-1) 
			{
				var TheCanvasMap=this.GetParent().GetCanvasMap();
				var TheCanvasElement=TheCanvasMap.GetElement(CMMainContainer.CANVAS);
				
				TheCanvasElement.style.cursor = "move";
			}
		}
	}
	return(Used);
};
CMItemPoly.prototype.MouseUp=function(TheView,RefX,RefY,TheEvent)
{
	var Used=false;
	
//	if (this.Clickable)
	{
		if ((this.Dragging)&&(this.Creating==false)) 
		{
			this.Dragging=false;
			Used=true;
		}
	}
	return(Used);
};

CMItemPoly.prototype.StartCreating=function(RefX,RefY) 
{
	this.Anchor={X:0,Y:0};
	this.SelectedPart=CMItem.PART_LOWER_RIGHT;
	this.Dragging=true;
	this.Creating=true;
}

CMItemPoly.prototype.Paint=function(TheView) 
{
	var Result=this.GetTweenedControlPoints();
	var Xs=Result.Xs;
	var Ys=Result.Ys;

	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();
	
	var TheStyle=this.GetStyle(TheView,MinTime);
	
	if (TheStyle!=undefined) TheView.SetStyle(TheStyle,true);

	if (Xs.length<=1) // one point,do nothing
	{
	}
	else if (Xs.length==2) // straight line
	{
		TheView.PaintRefLine(Xs[0],Ys[0],Xs[1],Ys[1]);
	}
	else
	{
		// draw the first bezier curve
		
		var Points=CMUtilityBezier.GetSecondOrderEndPoints3D(10,Xs[0],Ys[0],0,Xs[1],Ys[1],0,Xs[2],Ys[2],0);
		
		var NumPoints=Points[0].length;
		
		TheView.PaintRefLine(Xs[0],Ys[0],Points[0][0],Points[1][0]);
		
		for (var i=0;i<NumPoints-1;i++)
		{
			TheView.PaintRefLine(Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1]);
		}
		
		TheView.PaintRefLine(Points[0][NumPoints-1],Points[1][NumPoints-1],Xs[1],Ys[1]);
		
		// draw the inbetween Bezier curves
		
		for (var ControlIndex=1;ControlIndex<Xs.length-2;ControlIndex++)
		{
			var Points=CMUtilityBezier.GetSecondOrderPoints2D(10,Xs[ControlIndex-1],Ys[ControlIndex-1],
					Xs[ControlIndex],Ys[ControlIndex],Xs[ControlIndex+1],Ys[ControlIndex+1],
					Xs[ControlIndex+2],Ys[ControlIndex+2]);
			
			var NumPoints=Points[0].length;
			
			TheView.PaintRefLine(Xs[ControlIndex],Ys[ControlIndex],Points[0][0],Points[1][0]);
			
			for (var i=0;i<NumPoints-1;i++)
			{
				TheView.PaintRefLine(Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1]);
			}
			
			TheView.PaintRefLine(Points[0][NumPoints-1],Points[1][NumPoints-1],Xs[ControlIndex+1],Ys[ControlIndex+1]);
		}
		
		//*********************************************
		// draw the last Bezier curve
		
		var LastPoint=Xs.length-1;
		
		var Points=CMUtilityBezier.GetSecondOrderEndPoints3D(10,Xs[LastPoint],Ys[LastPoint],0,Xs[LastPoint-1],Ys[LastPoint-1],0,Xs[LastPoint-2],Ys[LastPoint-2],0);
		
		var NumPoints=Points[0].length;
		
		TheView.PaintRefLine(Points[0][NumPoints-1],Points[1][NumPoints-1],Xs[LastPoint-1],Ys[LastPoint-1]);
		
		for (var i=0;i<NumPoints-1;i++)
		{
			TheView.PaintRefLine(Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1]);
		}
		
		TheView.PaintRefLine(Points[0][0],Points[1][0],Xs[LastPoint],Ys[LastPoint]);
	}

	if (TheStyle!=undefined) TheView.RestoreStyle();
	//TheView.PaintRefRect(this.Bounds.XMin,this.Bounds.XMax,this.Bounds.YMin,this.Bounds.YMax);
}

CMItemPoly.prototype.PaintSelected=function(TheView) 
{
	if (this.Selected)
	{
		TheView.SaveStyle();
		
		TheView.SetStyle({fillStyle:"rgba(0,0,0,1)",strokeStyle:"white"});
		
		var TheScene=this.GetParent(CMScene);
		
		var MinTime=TheScene.GetTimeRange();
		
		var Result=this.GetControlPoints(MinTime);
		
		if (Result!=null)
		{
			var X1s=Result.Xs;
			var Y1s=Result.Ys;
				
			for (var i=0;i<X1s.length;i++)
			{
				TheView.PaintRefCircle(X1s[i],Y1s[i],5);
			}
		}
		TheView.RestoreStyle();
	}
}

//******************************************************************
// CMItemPoly Functions
//******************************************************************
/**
* Returns the desired control points based on the TimeSlice setting.
* This function ignores tweening as the control points are at fixed
* locations
*/
CMItemPoly.prototype.GetControlPoints=function(TimeSlice)
{
	var Result=null;
	
	var Result=this.GetBoundingTimeSlices(TimeSlice);
	
	Settings=Result[0].Settings;
	
	if (Settings!=undefined)
	{
		var Xs=Settings.Curve.Coordinates.Xs;
		var Ys=Settings.Curve.Coordinates.Ys;
		
		Result={Xs:Xs,Ys:Ys};
	}
	
	return(Result);
}
CMItemPoly.prototype.SetControlPoints=function(TimeSlice,Xs,Ys)
{
	var Result=this.GetBoundingTimeSlices(TimeSlice);
	
	Settings=Result[0].Settings;
	
	if (Settings!=undefined)
	{
		Settings.Curve.Coordinates.Xs=Xs;
		Settings.Curve.Coordinates.Ys=Ys;
	}
	else
	{
		alert("Sorry, time slice "+TimeSlice+" is not defined");
	}
}
/**
* Find the final points that define the outside of the arrow
* @protected
*/
CMItemPoly.prototype.GetTweenedControlPoints=function() 
{
	// interpolate between the coordinates to find the set of control points for this time slice
	var Xs=[];
	var Ys=[];
	
	var TheCanvsMap=this.GetParent(CMMainContainer);
	
	var TheScene=this.GetParent(CMScene);
	
	var TheTime=TheScene.GetTimeRange();
	
	var Result=this.GetBoundingTimeSlices(TheTime);
	var TheTimeSlice1=Result[0];
	
	var TheTime1=TheTimeSlice1.Time;
		
	if (Result[1]==null) // no tweening
	{
		var Result=this.GetControlPoints(TheTime1);
		Xs=Result.Xs;
		Ys=Result.Ys;
	}
	else
	{
		var Factor=CMItem.GetTimeFactor(Result);
		
		var Result=this.GetControlPoints(TheTime1);
		var X1s=Result.Xs;
		var Y1s=Result.Ys;
		var Result=this.GetControlPoints(TheTime2);
		var X2s=Result.Xs;
		var Y2s=Result.Ys;
		
		for (var i=0;i<X1s.length;i++)
		{
			Xs[i]=X1s[i]*Factor1+X2s[i]*Factor2;
			Ys[i]=Y1s[i]*Factor1+Y2s[i]*Factor2;
		}
	}
	return({Xs:Xs,Ys:Ys});
}


CMItemPoly.prototype.InPart=function(TheView,RefX,RefY,ClickTolerance)
{
	var ThePart=-1;

	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();
	
	var Tolerance=TheView.GetRefWidthFromPixelWidth(ClickTolerance);
	
	var Result=this.GetControlPoints(MinTime);
	if (Result!=null)
	{
		var X1s=Result.Xs;
		var Y1s=Result.Ys;
		
		for (var i=0;i<X1s.length;i++)
		{
			var X=X1s[i];
			var Y=Y1s[i];
			
			if ((Math.abs(X-RefX)<Tolerance)&&(Math.abs(Y-RefY)<Tolerance))
			{
				ThePart=i;
			}
		}
	}
	return(ThePart);
}
