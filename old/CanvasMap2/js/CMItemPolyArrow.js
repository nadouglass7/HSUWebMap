//******************************************************************
// CMItemPolyArrow Class
//******************************************************************

//******************************************************************
// Definitions
//******************************************************************

/**
* Number of steps (line segments) that appear in each Bezier curve.
* @private
*/

CMItemPolyArrow.NUM_STEPS=30;
/**
* Below are the settings definitions.
* @public, @settings
*/
CMItemPolyArrow.SettingDefintions=
{
	Arrow:
	{
		BarbX: { Name:"Barb Width",Type:CMBase.DATA_TYPE_INTEGER, Default:2 },
		BarbY: { Name:"Barb Length",Type:CMBase.DATA_TYPE_INTEGER, Default:3 },
		NotchX: { Name:"Shaft Width",Type:CMBase.DATA_TYPE_INTEGER, Default:0.5 },
		NotchY: { Name:"Head Length",Type:CMBase.DATA_TYPE_INTEGER, Default:2 },
	},
};

//******************************************************************
// CMItemPolyArrow Constructor
//******************************************************************

/**
* Arrow setup with Bezier curve for the spine
* @public, @constructs
*/
function CMItemPolyArrow() 
{
	CMItemPoly.call(this);
	
	//*************************************************************************
	// Settings
	
	// Dimensions of the arrow head
	this.BarbDX=2;
	this.BarbDY=3;
	this.NotchDX=0.5;
	this.NotchDY=2;
	
	// Additional properties 
	
	this.Type=CMLayerItems.ARROW; // jjg - not needed?
	
	// Additional properties (temp) //
	
	// Final polygon to render
	this.FinalXs=null;
	this.FinalYs=null;
	
	// Spine coordinates for debugging
	this.SpineXs=null;
	this.SpineYs=null;
	
	//
	
	this.TimeSlices[0].Settings.Arrow=	
	{
		BarbX:3,
		BarbY:2,
		NotchX:3,
		NotchY:2
	};
}

CMItemPolyArrow.prototype=Object.create(CMItemPoly.prototype); // inherit prototype functions from PanelBase()

CMItemPolyArrow.prototype.contructor=CMItemPolyArrow; // override the constructor to go to ours

//******************************************************************
// Private Functions
//******************************************************************

CMItemPolyArrow.prototype.ResetCoordinates=function()
{
	this.FinalXs=null;
	this.FinalYs=null;
}
CMItemPolyArrow.prototype.InitializeCoordinates=function()
{
	if (this.FinalXs==null)
	{
		this.FindCoordinates();
	}
}
//******************************************************************
// Private Functions to find the outline of the arrow based on the 
// control points
//******************************************************************

/**
* Find the coordinates that outline the arrow
* @private
*/
function FindBannerPoints(X,Y,XS1,YS1,XS2,YS2,Distance2)
{
	var DX=XS2-XS1; // find the slope of the first line
	var DY=YS2-YS1;
	
	// make the DX,DY into a unit vector
	var Distance=Math.sqrt(DX*DX+DY*DY);
	DX=DX/Distance*Distance2;
	DY=DY/Distance*Distance2;
	
	var X1=X+DY;
	var Y1=Y-DX;
	
	var X2=X-DY;
	var Y2=Y+DX;
	
	var Left={
		X:X1,
		Y:Y1
	};
	var Right={
		X:X2,
		Y:Y2
	};
	var Result=[Left,Right];
	
	return(Result);
}
/*
function DrawBezier(TheView,X1,Y1,Points,X2,Y2)
{		
	var NumPoints=Points[0].length;
	
	TheView.PaintRefLine(X1,Y1,Points[0][0],Points[1][0]);
	
	for (var i=0;i<NumPoints-1;i++)
	{
		TheView.PaintRefLine(Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1]);
	}
	
	TheView.PaintRefLine(Points[0][NumPoints-1],Points[1][NumPoints-1],X2,Y2);
}
*/
/**
* Finds the points to the left and right of the specified points based on a rotation angle
* and distances before rotation
* @private
*
* Inputs:
* X,Y - origin point
* Angle - Rotation angle in radians
* DX,DY - distance to move before the rotation is applied
*/
function GetPointsOffLine(X,Y,Angle,DX,DY)
{
	var Sine=Math.sin(Angle);
	var Cosine=Math.cos(Angle);
	
	var RightX=X-(Sine*DY)-(Cosine*DX);
	var RightY=Y-(Cosine*DY)+(Sine*DX);
	var LeftX=X-(Sine*DY)+(Cosine*DX);
	var LeftY=Y-(Cosine*DY)-(Sine*DX);

	Result={
		RightX:RightX,
		RightY:RightY,
		LeftX:LeftX,
		LeftY:LeftY,
	};
	return(Result);
}
/**
* Finds the coordinates to use to draw the arrow.
* @private
*/

CMItemPolyArrow.prototype.FindCoordinates=function() 
{
	var Result=this.GetTweenedControlPoints();
	var Xs=Result.Xs;
	var Ys=Result.Ys;
	
	//
	
	{
		var LastControlIndex=Xs.length-1;
		
		//*****************************************************************************************************
		// find the bezier curve through the control points and put it's points into the arrays X1s,Y1s
		//*****************************************************************************************************
		
		// get the first bezier curve at the start of the curve
		
		var X1s=[];
		var Y1s=[];
		
		X1s.push(Xs[0]); // push the first control point
		Y1s.push(Ys[0]);
		
		var Points1=CMUtilityBezier.GetSecondOrderEndPoints3D(CMItemPolyArrow.NUM_STEPS,Xs[0],Ys[0],0,Xs[1],Ys[1],0,Xs[2],Ys[2],0);

		for (var i=0;i<Points1[0].length;i++)
		{
			X1s.push(Points1[0][i]);
			Y1s.push(Points1[1][i]);
		}
		
//		DrawBezier(TheView,Xs[0],Ys[0],Points1,Xs[1],Ys[1]); // draw spline (debugging)
		
		// get the inbetween Bezier curves
		
		for (var ControlIndex=1;ControlIndex<Xs.length-1;ControlIndex++)
		{
			X1s.push(Xs[ControlIndex]);
			Y1s.push(Ys[ControlIndex]);
			
			var Points2=CMUtilityBezier.GetSecondOrderPoints2D(CMItemPolyArrow.NUM_STEPS,Xs[ControlIndex-1],Ys[ControlIndex-1],
					Xs[ControlIndex],Ys[ControlIndex],
					Xs[ControlIndex+1],Ys[ControlIndex+1],
					Xs[ControlIndex+2],Ys[ControlIndex+2]);

			for (var i=0;i<Points2[0].length;i++)
			{
				X1s.push(Points2[0][i]);
				Y1s.push(Points2[1][i]);
			}
			
//			DrawBezier(TheView,Xs[ControlIndex],Ys[ControlIndex],Points2,Xs[ControlIndex+1],Ys[ControlIndex+1]);
		}
		
		// get the last Bezier curve
		
		X1s.push(Xs[LastControlIndex-1]);
		Y1s.push(Ys[LastControlIndex-1]);
		
		var Points3=CMUtilityBezier.GetSecondOrderEndPoints3D(CMItemPolyArrow.NUM_STEPS,Xs[LastControlIndex],Ys[LastControlIndex],0,
			Xs[LastControlIndex-1],Ys[LastControlIndex-1],0,Xs[LastControlIndex-2],Ys[LastControlIndex-2],0);
		
		for (var i=Points3[0].length-1;i>=0;i--)
		{
			X1s.push(Points3[0][i]);
			Y1s.push(Points3[1][i]);
		}
		this.SpineXs=X1s;
		this.SpineYs=Y1s;
		
//		DrawBezier(TheView,Xs[LastControlIndex],Ys[LastControlIndex],Points3,Xs[LastControlIndex-1],Ys[LastControlIndex-1]);

		//*****************************************************************************************************
		// find the index to the last Bezier segment to include in the arrow sides.  In other words,
		// Work back from the last point along the spine of the arrow until we find a Bezier segment
		// that is further from the point of the arrow (measured along the spine) than the notch.  This
		// becomes our last segment so that the outsides of the arrow do not go into the arrow head
		//*****************************************************************************************************
		
		var Length=0;
		
		var X=Xs[LastControlIndex];
		var Y=Ys[LastControlIndex];
		
		var LastCoordinateIndex=X1s.length-1;
		
		for (var i=0;(i<Points3[0].length)&&(Length<this.NotchDX);i++)
		{
			Length+=CMUtilities.GetLength(X,Y,Points3[0][i],Points3[1][i]);
			
			LastCoordinateIndex--;
			
			X=Points3[0][i];
			Y=Points3[1][i];
		}
		if (LastCoordinateIndex>0) LastCoordinateIndex--;
		
		//*****************************************************************************************************
		// Find the distances to the control points on the barb and notch
		//*****************************************************************************************************
		
		var LineDX=Xs[LastControlIndex]-Points3[0][0];
		var LineDY=Ys[LastControlIndex]-Points3[1][0];
		
		var Angle=Math.atan2(LineDX,LineDY);
		
		var Result=GetPointsOffLine(Xs[LastControlIndex],Ys[LastControlIndex],Angle,this.BarbDX,this.BarbDY);
	
		var BarbRightX=Result.RightX;
		var BarbRightY=Result.RightY;
		var BarbLeftX=Result.LeftX;
		var BarbLeftY=Result.LeftY;
		
		var Result=GetPointsOffLine(Xs[LastControlIndex],Ys[LastControlIndex],Angle,this.NotchDX,this.NotchDY);
		
		var NotchRightX=Result.RightX;
		var NotchRightY=Result.RightY;
		var NotchLeftX=Result.LeftX;
		var NotchLeftY=Result.LeftY;
		
		//*****************************************************************************************************
		// Move the points to the left and right and put them in LeftXs,LeftYs,RightXs,RightYs
		//*****************************************************************************************************
		
		// find first points at the start of the arrow
		
		var LeftXs=[];
		var LeftYs=[];
		
		var RightXs=[];
		var RightYs=[];
			
		var BannerPoints=FindBannerPoints(Xs[0],Ys[0],Xs[0],Ys[0],Points1[0][1],Points1[1][1],this.NotchDX);
		
		LeftXs.push(BannerPoints[0].X);
		LeftYs.push(BannerPoints[0].Y);
		RightXs.push(BannerPoints[1].X);
		RightYs.push(BannerPoints[1].Y);
		
		for (var i=0;i<LastCoordinateIndex;i++)
		{
			var BannerPoints=FindBannerPoints(X1s[i],Y1s[i],X1s[i],Y1s[i],X1s[i+1],Y1s[i+1],this.NotchDX);
			
			LeftXs.push(BannerPoints[0].X);
			LeftYs.push(BannerPoints[0].Y);
			RightXs.push(BannerPoints[1].X);
			RightYs.push(BannerPoints[1].Y);
		}
		
		//*****************************************************************************************************
		// Find the final points along the outside of the arrow's polygon
		// This includes copying the outsides of the right side, then adding the arrow head, then adding
		// the points along the left side in reverse order.
		//*****************************************************************************************************
		
		var FinalXs=[]; // arrays for the final coordinates
		var FinalYs=[];
		
		// copy the right side coordinates
		for (var i=0;i<RightXs.length;i++) 
		{
			FinalXs.push(RightXs[i]);
			FinalYs.push(RightYs[i]);
		}
		
		// add the arrow head
		FinalXs.push(NotchRightX); 
		FinalYs.push(NotchRightY);
		
		FinalXs.push(BarbRightX);
		FinalYs.push(BarbRightY);
		
		FinalXs.push(Xs[LastControlIndex]);
		FinalYs.push(Ys[LastControlIndex]);
		
		FinalXs.push(BarbLeftX);
		FinalYs.push(BarbLeftY);
		
		FinalXs.push(NotchLeftX);
		FinalYs.push(NotchLeftY);
		
		// copy the left side of the arrow in reverse order
		for (var i=0;i<LeftXs.length;i++)
		{
			FinalXs.push(LeftXs[LeftXs.length-i-1]);
			FinalYs.push(LeftYs[LeftYs.length-i-1]);
		}
		
		// connect the polygon back to the first point.
		FinalXs.push(FinalXs[0]);
		FinalYs.push(FinalYs[0]);
		
		this.FinalXs=FinalXs;
		this.FinalYs=FinalYs;
	}
}
//******************************************************************
// Private Functions
//******************************************************************
/**
* Sets up the settings for this class.
*/
CMItemPolyArrow.prototype.Private_SetupProperties=function(TheView,TimeSlice) 
{
	var Result=this.GetBoundingTimeSlices(TimeSlice);
	
	// assume no tweening
	
	var Settings1=Result[0].Settings;
	
	this.BarbDX=Settings1.Arrow.BarbX;
	this.BarbDY=Settings1.Arrow.BarbY;
	this.NotchDX=Settings1.Arrow.NotchX;
	this.NotchDY=Settings1.Arrow.NotchY;

	// if tweening, find the tweened settings
	
	if (Result[1]!=null)
	{
		var Settings2=Result[1].Settings;
		
		var Factor=CMItem.GetTimeFactor(Result);
//		var Factor=TimeSlice/100;
		
		this.BarbDX=((Settings1.Arrow.BarbX*(1-Factor))+(Settings2.Arrow.BarbX*(Factor)));
		this.BarbDY=Settings1.Arrow.BarbY;
		this.NotchDX=Settings1.Arrow.NotchX;
		this.NotchDY=Settings1.Arrow.NotchY;
	}
}
//******************************************************************
// CMBase Functions
//******************************************************************

CMItemPolyArrow.prototype.GetName=function()  { return("Arrow"); }

CMItemPolyArrow.prototype.CMItemPoly_GetSettingsDefinitions=CMItemPoly.prototype.GetSettingsDefinitions;

CMItemPolyArrow.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMItemPoly_GetSettingsDefinitions();
	
	for (Key in CMItemPolyArrow.SettingDefintions)
	{
		Result[Key]=CMItemPolyArrow.SettingDefintions[Key];
	}
	return(Result); 
}

//******************************************************************
// CMItem functions 
//******************************************************************

CMItemPolyArrow.prototype.Paint=function(TheView) 
{
	this.InitializeCoordinates();
	
	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();
	
	this.Private_SetupProperties(TheView,MinTime);
	
	this.FindCoordinates(); // debugging
	
	var TheStyle=this.GetStyle(TheView,MinTime);
	
	if (TheStyle!=undefined) TheView.SetStyle(TheStyle,true);
	
	TheView.PaintRefPoly2(this.FinalXs,this.FinalYs,true,true);		// draw the left side of the arrow

	if (TheStyle!=undefined) TheView.RestoreStyle();
}

//******************************************************************
// CMItemPoly functions 
//******************************************************************
CMItemPolyArrow.prototype.CMItemPoly_SetControlPoints=CMItemPoly.prototype.SetControlPoints;

CMItemPolyArrow.prototype.SetControlPoints=function(TimeSlice,Xs,Ys)
{
	this.CMItemPoly_SetControlPoints(TimeSlice,Xs,Ys);
	
	this.ResetCoordinates();
}
