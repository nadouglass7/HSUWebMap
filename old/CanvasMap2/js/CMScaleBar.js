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


CMScaleBar.SettingDefintions=
{
	ScaleBar:
	{
		// standard HTML 5 settings except the defaults may change and sometimes the available settings will change between each settings group
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		lineWidth: { Name:"Line Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' },
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }
	},
	UnitText:
	{
		Text: { Name:"Text",Type:CMBase.DATA_TYPE_STRING, Default:null },
		font: { Name:"Font",Type:CMBase.DATA_TYPE_FONT, Default:"12px Arial" },
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' }
	},
	Rectangle: 
	{ 
		Coordinates: { Name:"Coordinates",Type:CMBase.DATA_TYPE_COORDINATES, Default:null } // pixel-based coordinates of the scale bar
	},
	RoundedRectangle:
	{
		RoundedCornerWidth: { Name:"Corner Width",Type:CMBase.DATA_TYPE_FLOAT, Default:3 },
		RoundedCornerHeight: { Name:"Corner Height",Type:CMBase.DATA_TYPE_FLOAT, Default:3 },
	},
	Factors:
	{
		UnitFontHeightFactor: { Name:"Corner Width",Type:CMBase.DATA_TYPE_FLOAT, Default:0.35 },
		LabelFontHeightFactor: { Name:"Corner Height",Type:CMBase.DATA_TYPE_FLOAT, Default:0.3 },
		ScaleBarHeightFactor: { Name:"Corner Height",Type:CMBase.DATA_TYPE_FLOAT, Default:0.3 },
		ScaleBarBaseLineFromBottomFactor: { Name:"Corner Height",Type:CMBase.DATA_TYPE_FLOAT, Default:0.2 },
		
		Units: { Name:"Units",Type:CMBase.DATA_TYPE_ENUMERATED, Options:[CMScaleBar.UNITS_ISO,CMScaleBar.UNITS_ENGLISH],Default:CMScaleBar.UNITS_ISO },
		Margin: { Name:"Margin",Type:CMBase.DATA_TYPE_FLOAT, Default:4 },
	}
};
	

/**
* Creates a new scale bar with the specified dimensions in the map.
* @constructor
*/

function CMScaleBar(X,Y,Width,Height) 
{
	CMItem.call(this)
	
//	this.UnitStyle="Arial"; // vertical size in pixels
//	this.UnitFontHeightFactor=0.35;
	
//	this.LabelStyle="Arial";
//	this.LabelFontHeightFactor=0.3;
	
//	this.ScaleBarHeightFactor=0.3;
//	this.ScaleBarBaseLineFromBottomFactor=0.2;
	
	this.TimeSlices[0].Settings.Rectangle=	
	{
		Coordinates:
		{
			Xs:[0,10], // min,max
			Ys:[0,10] // Min,max
		}
	};
	this.TimeSlices[0].Settings.RoundedRectangle=
	{
		RoundedCornerWidth:3,
		RoundedCornerHeight:3
	};
	this.TimeSlices[0].Settings.UnitText=
	{
	};
	this.TimeSlices[0].Settings.ScaleBar=
	{
	};
	this.TimeSlices[0].Settings.Factors=
	{
		UnitFontHeightFactor:0.35,
		LabelFontHeightFactor:0.3,
		ScaleBarHeightFactor:0.3,
		ScaleBarBaseLineFromBottomFactor:0.2,
		
		Units:CMScaleBar.UNITS_ISO,
		Margin:4,
	};

//	this.BackgroundStyle={fillStyle:"#ffffff",strokeStyle:"#000000",lineWidth:"4"};
	
//	this.BackgroundRadius=4;
	
	this.BottomSticky=null; // MoveFlag=null; // null for not sticky, true for move, false for size
	this.RightSticky=null;
};

CMScaleBar.prototype=Object.create(CMItem.prototype); // inherit prototype functions from CMBase()

CMScaleBar.prototype.contructor=CMScaleBar; // override the constructor to go to ours

//***************************************************************************************
// private funtions
//***************************************************************************************
CMScaleBar.RemovePixels=function(Style)
{
	var Result="";
	
	if (Style!=null)
	{
		var Tokens=Style.split(" ");
		for (var i=0;i<Tokens.length;i++)
		{
			if (Tokens[i].indexOf("px")==-1) 
			{
				if (Result!="") Result+=" ";
				Result+=Tokens[i];
			}
		}
	}
	return(Result);
}

//***************************************************************************************
// Unit conversions
//***************************************************************************************
/**
* Set the units (ISO or English) used by the scale bar. 
* @public
* @param Units - CMScaleBar.UNITS_ISO or CMScaleBar.UNITS_ENGLISH
*//*
CMScaleBar.prototype.SetUnits=function(Units)
{
	this.Units=Units;
	this.Repaint();
};

CMScaleBar.prototype.SetMargin=function(Margin)
{
	this.Margin=Margin;
	this.Repaint();
};
*/
/*CMScaleBar.prototype.SetBackgroundStyle=function(BackgroundStyle)
{
	this.BackgroundStyle=BackgroundStyle;
	this.Repaint();
};
*//*
CMScaleBar.prototype.SetBackgroundRadius=function(BackgroundRadius)
{
	this.BackgroundRadius=BackgroundRadius;
	this.Repaint();
};*/
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
//CMScaleBar.prototype.CMItemRect_Paint=CMItemRect.prototype.Paint;

CMScaleBar.prototype.Paint=function(TheView)
{
	//****************************************************************
	// Find the distance across the scale bar
	
	// convert the pixel coordinates to reference (map) coordinates)
	
	var TheCoordinates=this.GetSetting("Rectangle","Coordinates");
	
	var LeftX=TheCoordinates.Xs[0];
	var RightX=TheCoordinates.Xs[1];
	var MiddleY=(TheCoordinates.Ys[0]+TheCoordinates.Ys[1]/2);
	var Width=TheCoordinates.Xs[1]-TheCoordinates.Xs[0];
	
	var MinY=TheCoordinates.Ys[0];
	var Height=TheCoordinates.Ys[1]-TheCoordinates.Ys[0];
	
	var TheScene=this.GetParent(CMScene);
	
	var TheView=TheScene.GetView(0);
	
	var Lon1=TheView.GetRefXFromPixelX(LeftX);
	var Lat1=TheView.GetRefYFromPixelY(MiddleY);
	
	var Lon2=TheView.GetRefXFromPixelX(RightX);
	var Lat2=Lat1; // latitudes are the same
	
	// convert the map coordinates to geographic coordinates
	
	var TheProjector=TheScene.GetCanvasMap().GetProjector();
	
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
	
	if (Units==CMScaleBar.UNITS_ENGLISH) Distance*=0.621371;
	
	//****************************************************************************
	// find the distance to use for the scale bar
	
	var ctx=TheView.TheContext;
	
	var FactorSettings=this.GetSettingGroup("Factors");
	
	var UnitFontHeightFactor=FactorSettings["UnitFontHeightFactor"];
	var LabelFontHeightFactor=FactorSettings["LabelFontHeightFactor"];
	var ScaleBarHeightFactor=FactorSettings["ScaleBarHeightFactor"];
	var ScaleBarBaseLineFromBottomFactor=FactorSettings["ScaleBarBaseLineFromBottomFactor"];
	
	var Margin=FactorSettings["Margin"];
	var Units=FactorSettings["Units"];

	// Find the width of a zero (for the left side)
	
	var TheLabelFontSetting=this.GetSetting("Text","font");
	
	TheLabelFontSetting=CMScaleBar.RemovePixels(TheLabelFontSetting);
	
	var LabelFontSize=""+(Height*LabelFontHeightFactor);
	var TheLabelFont=LabelFontSize+"px "+TheLabelFontSetting;
	
//	ctx.font="20px Arial";
	ctx.font=TheLabelFont;
	
	var ZeroText=""+0;
	var ZeroWidth=ctx.measureText(ZeroText).width;
	 
	// find the available width
	
	var AvailablePixels=Width-(ZeroWidth/2)-(Margin*2);
	
	// compute the Reference distance for each pixel (important) and 
	// the ScaleBarWidthInRefUnits that fits in the available width
	
	var RefDistancePerPixel=Distance/Width;
	
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
	if (Units==CMScaleBar.UNITS_ENGLISH) UnitString="miles";
	
	var TheUnitFontSetting=this.GetSetting("UnitText","font");
	
	TheUnitFontSetting=CMScaleBar.RemovePixels(TheUnitFontSetting);
	
	var UnitFontSize=""+(Height*UnitFontHeightFactor);
	var TheUnitFont=UnitFontSize+"px "+this.TheUnitFontSetting;
	
	ctx.font=TheUnitFont;
	
//	var TheTextStyle=this.GetStyle(TheView,0,"Text"); // for the values along the ticks
	
	// find the initial unit width
//	TheView.SetStyle(TheUnitStyle);
	
	var UnitWidth=ctx.measureText(UnitString).width;
	
	// reduce until it fits
	
	var ScaleBarWidthInPixels;
	
	var Fits=false;
	var Count=0;
	while ((Fits==false)&&(Count<100))
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
			
			ctx.font=TheUnitFont;
			var UnitWidth=ctx.measureText(UnitString).width;
//			ctx.font=LabelFontStyle; // put the label font style back
		}
		// find the width of the last label
		
		var LabelText=""+ScaleBarWidthInRefUnits;
		
		ctx.font=TheLabelFont;
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
		Count+=1;
	}
	
	//*********************************************************************
	// Draw the scale bar
	
	//this.CMItemRect_Paint(TheView);
	
	// setup the coordinates for the bar
	
	var ScaleBarWidthInPixels=ScaleBarWidthInRefUnits/RefDistancePerPixel;
	
	var ScaleBarLeft=LeftX+Margin+(ZeroWidth/2);
	var ScaleBarRight=ScaleBarLeft+ScaleBarWidthInPixels;
	var ScaleBarY=MinY+Height-(Height*ScaleBarBaseLineFromBottomFactor);
	
	// get the settings
	
	var TheStyleSettings=this.GetStyle(TheView,0,"Style");
	var TheLabelSettings=this.GetStyle(TheView,0,"Text");
	var TheUnitTextSettings=this.GetStyle(TheView,0,"UnitText");
	var TheScaleBarSettings=this.GetStyle(TheView,0,"ScaleBar");
	
	// draw the backgorund
	
	var RoundedCornerWidth=this.GetSetting("RoundedRectangle","RoundedCornerWidth");
	var RoundedCornerHeight=this.GetSetting("RoundedRectangle","RoundedCornerHeight");
	
	TheView.SetStyle(TheStyleSettings);
	
	TheView.PaintRoundedRect(LeftX,RightX,MinY,MinY+Height,RoundedCornerWidth,RoundedCornerHeight);
	
	TheView.RestoreStyle();
	
	// draw the units
	
	TheView.SetStyle(TheUnitTextSettings);
	
	ctx.font=TheUnitFont;
	ctx.fillText(UnitString,ScaleBarLeft+ScaleBarWidthInPixels+Margin,ScaleBarY);
	
	TheView.RestoreStyle();
	
	// draw the bar
	
	TheView.SetStyle(TheScaleBarSettings);
	
	ctx.beginPath();
	ctx.moveTo(ScaleBarLeft,ScaleBarY);
	ctx.lineTo(ScaleBarRight,ScaleBarY);
	ctx.stroke();
	
	// draw the ticks
	
	var ScaleBarHeight=Height*ScaleBarHeightFactor;
	
	ctx.beginPath();
	ctx.moveTo(ScaleBarLeft,ScaleBarY);
	ctx.lineTo(ScaleBarLeft,ScaleBarY-ScaleBarHeight);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(ScaleBarRight,ScaleBarY);
	ctx.lineTo(ScaleBarRight,ScaleBarY-ScaleBarHeight);
	ctx.stroke();
	
	TheView.RestoreStyle();
	
	// write out the labels
	
	TheView.SetStyle(TheLabelSettings);
	
	ctx.font=TheLabelFont;
	
	var LabelBaseLine=ScaleBarY-ScaleBarHeight-Margin;
	
	ctx.fillText("0",ScaleBarLeft-(ZeroWidth/2),LabelBaseLine);
	 
	var LabelText=""+ScaleBarWidthInRefUnits;
	var LabelWidth=ctx.measureText(LabelText).width;
	 
	ctx.fillText(LabelText,ScaleBarRight-LabelWidth/2,LabelBaseLine);
	
	TheView.RestoreStyle();
}
CMScaleBar.CheckFit=function(AvailablePixels,ScaleBarWidthInRefUnits)
{
	
};

