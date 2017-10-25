//***************************************************************************************
//	CMNorthArrow
//  JS class for creating north arrows that can ponit north.
//
//	By: Jim Graham 
//
// Copyright (c) 2016 
//
//***************************************************************************************

//***************************************************************************************
// Constructors
//***************************************************************************************

/*
* 
*/
function CMNorthArrow() 
{
	this.x=200;
	this.y=300;
	
	this.AngleInRadians=0;
}

//***************************************************************************************
// Unit conversions
//***************************************************************************************

CMNorthArrow.Coordinates=[[0,-100],[20,-40],[10,-50],[10,100],[0,100],[0,-100]];

//******************************************************************
// CMProjector functions for subclasses to override
//******************************************************************

CMNorthArrow.prototype.ZoomLevelChanged=function(TheView)
{
	
}

CMNorthArrow.prototype.ViewMoved=function(TheView)
{
	var TheScene=TheView.TheScene;
	var TheCanvas=TheScene.TheCanvasMap;
	var TheProjector=TheCanvas.TheProjector;
	
	var Easting=TheView.GetRefXFromPixelX(this.x);
	var Northing1=TheView.GetRefYFromPixelY(this.y-5);
	var Northing2=TheView.GetRefYFromPixelY(this.y+5);
	
	var Result1=TheProjector.ProjectToGeographic(Easting,Northing1);
	var Result2=TheProjector.ProjectToGeographic(Easting,Northing2);
	
	var angleRadians = Math.atan2( Result2.Longitude - Result1.Longitude,Result2.Latitude - Result1.Latitude);
	
	this.AngleInRadians=Math.PI-angleRadians;
}

CMNorthArrow.prototype.Paint=function(TheView)
{
	var TheArray=CMNorthArrow.Coordinates;
	
	var ctx=TheView.TheContext;
	
	ctx.translate(this.x,this.y);
	ctx.rotate(this.AngleInRadians);
	
	ctx.moveTo(+TheArray[0][0],TheArray[0][1]);
										  
	for (var i=0;i<TheArray.length;i++)
	{
		ctx.lineTo(TheArray[i][0],TheArray[i][1]);
	}
	ctx.fill();
	ctx.stroke();
	
	ctx.rotate(-this.AngleInRadians);
	ctx.translate(-this.x,-this.y);
	
}

