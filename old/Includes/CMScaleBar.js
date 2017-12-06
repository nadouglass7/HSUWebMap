/**
* 	CMScaleBar
* 	Class to render a scale bar into the scene.  The scale bar will be automatically 
* 	repainted with the scale based on its position in the scene.  
*	The algorithm is to find the two points at either end of the rectangle provided
*	for the scale bar and convert these points to geographic coordinates.  Then,
* a great arc calculation is performed to find the distance between the points.
* The scale displayed is then found by reducing this distance to an even multiple
* of 1, 2, or 5.  If this distance does not fit in the area provided (including  the
* the labels), the next smaller distance is computed.  This continues until a distance
* is found that fits.
* 	
* 	By: Jim Graham 
*/

//***************************************************************************************
// Constructors
//***************************************************************************************

/**
* Definitions for the units.  For ISO kilomters or meters will be displayed based on the
* size of the scale bar.  For English, miles and feet are displaed.
* @enum
*/
CMScaleBar.UNITS_ISO=0; // meters, kilometers
CMScaleBar.UNITS_ENGLISH=1; // feet, miles

/**
* Creates a new scale bar with the specified dimensions in the map.
* @constructor
*/
function CMScaleBar(X,Y,Width,Height) 
{
	this.X=X;
	this.Y=Y;
	this.Width=Width;
	this.Height=Height;
	
	this.Units=CMScaleBar.UNITS_ISO; // SI or English
	this.Margin=4;
	
	this.UnitStyle="Arial"; // vertical size in pixels
	this.UnitFontHeightFactor=0.35;
	
	this.LabelStyle="Arial";
	this.LabelFontHeightFactor=0.3;
	
	this.ScaleBarHeightFactor=0.3;
	this.ScaleBarBaseLineFromBottomFactor=0.2;
	
	this.BackgroundStyle={fillStyle:"#ffffff",strokeStyle:"#000000",lineWidth:"4"};
	
	this.BackgroundRadius=4;
	
//	this.Fill1Style={fillStyle:"#ffffff"}; // turn these on later when we add segmented scale bars
//	this.Fill2Style={fillStyle:"#000000"};
	
	this.TheScene=null;
	
	this.BottomSticky=null;//MoveFlag=null; // null for not sticky, true for move, false for size
	this.RightSticky=null;
//	this.ButtomSticky
};

//***************************************************************************************
// Protected funtions
//***************************************************************************************
/**
* Called by the scene when the scale bar is added to it
*/
CMScaleBar.prototype.SetScene=function(TheScene)
{
	this.TheScene=TheScene;
};

//***************************************************************************************
// Unit conversions
//***************************************************************************************
/**
* Set the units (ISO or English) used by the scale bar. 
* @public
* @param Units - CMScaleBar.UNITS_ISO or CMScaleBar.UNITS_ENGLISH
*/
CMScaleBar.prototype.SetUnits=function(Units)
{
	this.Units=Units;
	if (this.TheScene!=null) this.TheScene.Repaint();
};

CMScaleBar.prototype.SetMargin=function(Margin)
{
	this.Margin=Margin;
	if (this.TheScene!=null) this.TheScene.Repaint();
};

CMScaleBar.prototype.SetBackgroundStyle=function(BackgroundStyle)
{
	this.BackgroundStyle=BackgroundStyle;
	if (this.TheScene!=null) this.TheScene.Repaint();
};

CMScaleBar.prototype.SetBackgroundRadius=function(BackgroundRadius)
{
	this.BackgroundRadius=BackgroundRadius;
	if (this.TheScene!=null) this.TheScene.Repaint();
};
/**
*
* @param RightSticky - JSON object {MoveFlag:MoveFlag,Offset:OffsetFromRight};
*/
CMScaleBar.prototype.SetRightSticky=function(New)
{
	this.RightSticky=New;
}
CMScaleBar.prototype.GetRightSticky=function() { return(this.RightSticky); }
/**
*
* @param BottomSticky - JSON object {MoveFlag:MoveFlag,Offset:OffsetFromBottom};
*/
CMScaleBar.prototype.SetBottomSticky=function(New)
{
	this.BottomSticky=New;
}
CMScaleBar.prototype.GetBottomSticky=function() { return(this.BottomSticky); }

//******************************************************************
// Item functions for subclasses to override
//******************************************************************

CMScaleBar.prototype.ZoomLevelChanged=function(TheView)
{
	
}

CMScaleBar.prototype.ViewMoved=function(TheView)
{
/*	var TheScene=TheView.TheScene;
	var TheCanvas=TheScene.TheCanvasMap;
	var TheProjector=TheCanvas.TheProjector;
	
	var Easting=TheView.GetRefXFromPixelX(this.x);
	var Northing1=TheView.GetRefYFromPixelY(this.y-5);
	var Northing2=TheView.GetRefYFromPixelY(this.y+5);
	
	var Result1=TheProjector.ProjectToGeographic(Easting,Northing1);
	var Result2=TheProjector.ProjectToGeographic(Easting,Northing2);
	
	var angleRadians = Math.atan2( Result2.Longitude - Result1.Longitude,Result2.Latitude - Result1.Latitude);
	
	this.AngleInRadians=Math.PI-angleRadians;
*/}

CMScaleBar.prototype.Paint=function(TheView)
{
	//****************************************************************
	// Find the distance across the scale bar
	
	// convert the pixel coordinates to reference (map) coordinates)
	
	var LeftX=this.X;
	var RightX=this.X+this.Width;
	var MiddleY=this.Y+(this.Height/2);
	
	var TheView=this.TheScene.GetView(0);
	
	var Lon1=TheView.GetRefXFromPixelX(LeftX);
	var Lat1=TheView.GetRefYFromPixelY(MiddleY);
	
	var Lon2=TheView.GetRefXFromPixelX(RightX);
	var Lat2=Lat1; // latitudes are the same
	
	// convert the map coordinates to geographic coordinates
	
	var TheProjector=this.TheScene.GetCanvasMap().GetProjector();
	
	if (TheProjector!=null)
	{
		var Result=TheProjector.ProjectToGeographic(Lon1,Lat1);
		Lon1=Result.Longitude;
		Lat1=Result.Latitude;
		
		var Result=TheProjector.ProjectToGeographic(Lon2,Lat2);
		Lon2=Result.Longitude;
		Lat2=Result.Latitude;
	}
	// convert the coordinates to radians
	
	Lon1=Lon1/180*Math.PI;
	Lat1=Lat1/180*Math.PI;
	Lon2=Lon2/180*Math.PI;
	Lat2=Lat2/180*Math.PI;
	
	// find the create arc length
	
	var DeltaAngle=Math.acos(Math.sin(Lat1)*Math.sin(Lat2)+Math.cos(Lat1)*Math.cos(Lat2)*Math.cos(Math.abs(Lon2-Lon1)));
	
	var Distance=DeltaAngle*6371;// distance across entire scale bar area in km
	
	if (this.Units==CMScaleBar.UNITS_ENGLISH) Distance*=0.621371;
	
	//****************************************************************************
	// find the distance to use for the scale bar
	
	var ctx=TheView.TheContext;
	
	// Find the width of a zero (for the left side)
	
	var LabelFontSize=""+(this.Height*this.LabelFontHeightFactor);
	var LabelFontStyle=LabelFontSize+"px "+this.LabelStyle;
	
//	ctx.font="20px Arial";
	ctx.font=LabelFontStyle;
	
	var ZeroText=""+0;
	var ZeroWidth=ctx.measureText(ZeroText).width;
	 
	// find the available width
	
	var AvailablePixels=this.Width-(ZeroWidth/2)-(this.Margin*2);
	
	// compute the Reference distance for each pixel (important) and 
	// the ScaleBarWidthInRefUnits that fits in the available width
	
	var RefDistancePerPixel=Distance/this.Width;
	
	var ScaleBarWidthInRefUnits=RefDistancePerPixel*AvailablePixels;
	
	// find the starting full bar width that is a mulitple of 10
	// this may be over 1 (10,000, 1000, 100, 10) or under 1 (0.1, 0.001)
	
	var N=Math.log10(ScaleBarWidthInRefUnits);
	
	N=Math.ceil(N);
	
	ScaleBarWidthInRefUnits=Math.pow(10,N);
	
	// draw the scale bar
	
	var Interval=1;
	var NumDigits=N+1;
	
	// find the initial width for the unit string
	
	var UnitString="km";
	if (this.Units==CMScaleBar.UNITS_ENGLISH) UnitString="miles";
	
	var UnitFontSize=""+(this.Height*this.UnitFontHeightFactor);
	var UnitFontStyle=UnitFontSize+"px "+this.UnitStyle;
	
	ctx.font=UnitFontStyle;
	var UnitWidth=ctx.measureText(UnitString).width;
	
	// reduce until it fits
	
	var ScaleBarWidthInPixels;
	
	var Fits=false;
	while (Fits==false)
	{
		// see if we need to convert to meters
		
		if ((ScaleBarWidthInRefUnits<1)&&((UnitString=="km")||(UnitString=="miles"))) // 0.5
		{
			if (UnitString=="km")
			{
				ScaleBarWidthInRefUnits*=1000; // 500 meters
				UnitString="m";
				RefDistancePerPixel=RefDistancePerPixel*1000;
			}
			else
			{
				ScaleBarWidthInRefUnits*=10000; // 2640 feet in 1/2 mile
				UnitString="ft";
				RefDistancePerPixel=RefDistancePerPixel*10000;
			}
			// unit width changed
			
			ctx.font=UnitFontStyle;
			var UnitWidth=ctx.measureText(UnitString).width;
			ctx.font=LabelFontStyle; // put the label font style back
		}
		// find the width of the last label
		
		var LabelText=""+ScaleBarWidthInRefUnits;
		var LabelWidth=ctx.measureText(LabelText).width;
		
		// find the width of the scale bar
		
		ScaleBarWidthInPixels=ScaleBarWidthInRefUnits/RefDistancePerPixel;
		
		// find the full width either by 1/2 the label width or the unit width, whichever is larger
		
		var FullWidth=ScaleBarWidthInPixels;
		
		if ((LabelWidth/2)>UnitWidth) FullWidth+=(LabelWidth/2);
		else FullWidth+=UnitWidth;
		
		// if the full width of the proposed scale bar fits, we're done
		
		if (FullWidth<AvailablePixels)
		{
			Fits=true;
		}
		else if (((UnitString=="m")||(UnitString=="ft"))&&(ScaleBarWidthInRefUnits<=0.01))
		{
			Fits=true;
		}
		else // reduce the interval 
		{
			if (Interval==1) // must be 1 going to 5 and down a digit
			{
				Interval=5;
				ScaleBarWidthInRefUnits=ScaleBarWidthInRefUnits/2;
			}
			else if (Interval==5)
			{
				Interval=2;
				ScaleBarWidthInRefUnits=ScaleBarWidthInRefUnits*2/5;
			}
			else // must be 2, going to 1
			{
				Interval=1;
				ScaleBarWidthInRefUnits=ScaleBarWidthInRefUnits/2;
			}
		}
	}
	
	//*********************************************************************
	// Draw the scale bar
	
	// setup the coordinates for the bar
	
	var ScaleBarWidthInPixels=ScaleBarWidthInRefUnits/RefDistancePerPixel;
	
	var ScaleBarLeft=this.X+this.Margin+(ZeroWidth/2);
	var ScaleBarRight=ScaleBarLeft+ScaleBarWidthInPixels;
	var ScaleBarY=this.Y+this.Height-(this.Height*this.ScaleBarBaseLineFromBottomFactor);
	
	// draw the backgorund
	
	TheView.SetStyle(this.BackgroundStyle);
	
	TheView.PaintRoundedRect(this.X,this.X+this.Width,this.Y,this.Y+this.Height,this.BackgroundRadius);
	
	TheView.RestoreStyle();
	
	ctx.font=UnitFontStyle;
	ctx.fillStyle="#000000";
	ctx.fillText(UnitString,ScaleBarLeft+ScaleBarWidthInPixels+this.Margin,ScaleBarY);
	
	// draw the bar
	
	ctx.beginPath();
	ctx.moveTo(ScaleBarLeft,ScaleBarY);
	ctx.lineTo(ScaleBarRight,ScaleBarY);
	ctx.stroke();
	
	// draw the ticks
	
	var ScaleBarHeight=this.Height*this.ScaleBarHeightFactor;
	
	ctx.beginPath();
	ctx.moveTo(ScaleBarLeft,ScaleBarY);
	ctx.lineTo(ScaleBarLeft,ScaleBarY-ScaleBarHeight);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(ScaleBarRight,ScaleBarY);
	ctx.lineTo(ScaleBarRight,ScaleBarY-ScaleBarHeight);
	ctx.stroke();
	
	// write out the labels
	
	ctx.font=LabelFontStyle;
	
	var LabelBaseLine=ScaleBarY-ScaleBarHeight-this.Margin;
	
	ctx.fillText("0",ScaleBarLeft-(ZeroWidth/2),LabelBaseLine);
	 
	var LabelText=""+ScaleBarWidthInRefUnits;
	var LabelWidth=ctx.measureText(LabelText).width;
	 
	ctx.fillText(LabelText,ScaleBarRight-LabelWidth/2,LabelBaseLine);
}
CMScaleBar.CheckFit=function(AvailablePixels,ScaleBarWidthInRefUnits)
{
	
};

