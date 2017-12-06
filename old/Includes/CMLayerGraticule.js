//******************************************************************
// CMLayerGraticule Class
// This was done very quickly for debugging and it does project
// the lines on the fly.  These should definitely be cached in the future.
//******************************************************************


//******************************************************************
// Constructor
//******************************************************************
function CMLayerGraticule() 
{
}
CMLayerGraticule.prototype=new CMLayer(); // inherit prototype functions from PanelBase()

CMLayerGraticule.prototype.contructor=CMLayerGraticule; // override the constructor to go to ours
//******************************************************************
// CMLayer Functions
//******************************************************************
CMLayerGraticule.prototype.In=function(TheView,RefX,RefY) 
{
	return(false);
}
//******************************************************************
// Mouse Functions
//******************************************************************

/*
* Paints a layer into the canvas
*/
CMLayerGraticule.prototype.Paint=function(TheView) 
{
	if (this.IsVisible())
	{
		var TheScene=TheView.TheScene;
		var TheCanvas=TheScene.TheCanvasMap;
		var TheProjector=TheCanvas.TheProjector;
		
		var TheStyle=this.GetStyle();
		
		if (TheStyle!=null) TheView.SetStyle(TheStyle);
		
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
//		var OldStrokeStyle=TheContext.strokeStyle;
//		TheContext.strokeStyle="#ffffff";
		
		// draw the linse of longitude (meridians)
		
		for (var Longitude=-168;Longitude<=-78;Longitude+=6) // draw lines of longitude (6 degrees each)
		{
			for (var Latitude=90;Latitude>-90;Latitude-=6)
			{
				var Coordinate1=TheProjector.ProjectFromGeographic(Longitude,Latitude);
				
				var Coordinate2=TheProjector.ProjectFromGeographic(Longitude,Latitude+6);
				
				TheView.PaintRefLine(Coordinate1.Easting,Coordinate1.Northing,Coordinate2.Easting,Coordinate2.Northing);
			}
		}
		
		// draw the linse of latitude (parallels)
		
		for (var Latitude=90;Latitude>=-90;Latitude-=6)
		{
			for (var Longitude=-168;Longitude<-78;Longitude+=6) // draw lines of longitude (6 degrees each)
			{
				var Coordinate1=TheProjector.ProjectFromGeographic(Longitude,Latitude);
				
				var Coordinate2=TheProjector.ProjectFromGeographic(Longitude+6,Latitude);
				
				TheView.PaintRefLine(Coordinate1.Easting,Coordinate1.Northing,Coordinate2.Easting,Coordinate2.Northing);
			}
		}
		
//		TheContext.strokeStyle=OldStrokeStyle;
		
		if (TheStyle!=null) TheView.RestoreStyle();
	}
}

