//**************************************************************************************************
// CMLayerGraticule Class
// 
// by: Jim Graham
// 
// This class required a level of complexity beyond what I initially expected.
// The problem is that we have to:
//	- Draw graticule lines based on the zoom level, projection, and area viewed
//  - Paint coordinates along the border based on where the graticules intersect with the border
//  - Paint coordinates along the outside of the graticule grid if it is visible (i.e. does not 
//    intersect with the border.
//
// The approach is:
// 1. 
//**************************************************************************************************


//**************************************************************************************************
// Constructor
//**************************************************************************************************
function CMLayerGraticule() 
{
	CMLayer.call(this);
	// coordinates for the bounds in the current projection
	this.BoundsProjectedEastings=null;
	this.BoundsProjectedNorthings=null;
	
	this.Bounds=null;
	this.BoundsSpacing=10;
	
	this.BoundsWestCoordinates=null;
	this.BoundsEastCoordinates=null;
	
	this.BoundsNorthCoordinates=null;
	this.BoundsSouthCoordinates=null;
	
	// intersections between the graticules (lines) and the sides of the border
	this.TopIntersectionCoordinates=null;
	this.BottomIntersectionCoordinates=null;
	
	this.LeftIntersectionCoordinates=null;
	this.RightIntersectionCoordinates=null;
	
	// desired spacing between the graticules
	this.DesiredSpacingInPixels=200;
}
CMLayerGraticule.prototype=Object.create(CMLayer.prototype); // inherit prototype functions from PanelBase()

CMLayerGraticule.prototype.contructor=CMLayerGraticule; // override the constructor to go to ours
//******************************************************************
// Private definitions
//******************************************************************
/*
* These are the posible options for the intervals between values on the border.
*/
CMLayerGraticule.DegreeQuantized=[
					 30, // 30 degrees
					 15,
					 10,
					 5,
					 2,
					 1,
					 0.5, // 30 minutes
					 0.25, // 15 minutes
					 1/6, // 10 minutes
					 1/12, // 5 minutes
					 1/30, // 2 minutes
					 1/60, // 1 minute
					 1/120, // 30 seconds
					 1/240, // 15 seconds
					 1/360, // 10 seconds
					 1/720, // 5 seconds
					 1/1800, // 2 seconds
					 1/3600 // 1 second
				];
//******************************************************************
// CMLayer Functions
//******************************************************************
CMLayerGraticule.prototype.In=function(TheView,RefX,RefY) 
{
	return(false);
}
//******************************************************************
// Private Functions
//******************************************************************

/**
* Find the coordinate where a general line segment intersects a vertical line segment.
* This is provided because it is much faster than finding the intersection
* of two line segments.
* @private
* @param P1X - horiziontal value of the first coordinate for the line segment
* @param P1Y - vertical value of the first coordinate for the line segment
* @param P2X - horiziontal value of the second coordinate for the line segment
* @param P2Y - vertical value of the second coordinate for the line segment
* @param RefX - horiziontal value of the vertical line segment
* @param RefTop - top of the vertical line segment
* @param RefBottom - bottom of the vertical line segment
* @param Coordinates - array that will collect the intersections with the vertical line segment
* @param Latitude - latitude to be added so we can label the intersection on the border.
* @return - JSON object with {Easting:RefX,Northing:RefTop} if an intersection was found, null otherwise
*/
CMLayerGraticule.SegmentIntersectsAVertical=function(P1X,P1Y,P2X,P2Y,RefX,RefTop,RefBottom,Coordinates,Latitude)
{
	var Result=null;
	
	if (((P1X<RefX)&&(P2X<RefX))||((P1X>RefX)&&(P2X>RefX))|| //segment is to one side
		((P1Y<RefBottom)&&(P2Y<RefBottom))||((P1Y>RefTop)&&(P2Y>RefTop))) // segement is above or below 
	{
	}
	else // segment's bounding rectangle overlaps the vertical segement
	{
		if (P2X==P1X) // vertical line
		{
			if (P1X==RefX) 
			{
	//			Result=[RefX,RefTop]; // vertical colinear with the vertical (not sure of correct Y value)
				Coordinates.push({Easting:RefX,Northing:RefTop});
			}
		}
		else
		{
			// find the equation of the line
			var m=(P2Y-P1Y)/(P2X-P1X); // y=mx+b, b=y-mx
			var b=P1Y-(m*P1X);
			
			// find the intersection with our vertical
			
			var y=m*RefX+b;
			if ((y<RefTop)&&(y>RefBottom)) 
			{
				Coordinates.push({Easting:RefX,Northing:y,Latitude:Latitude});
			}
		}
	}
	return(Result);
}
/**
* Find the coordinate where a general line segment intersects a horizontal line segment.
* This is provided because it is much faster than finding the intersection
* of two line segments.
* @private
* @P1X - horiziontal value of the first coordinate for the line segment
* @P1Y - vertical value of the first coordinate for the line segment
* @P2X - horiziontal value of the second coordinate for the line segment
* @P2Y - vertical value of the second coordinate for the line segment
* @RefLeft - left value of the horizontal line segment
* @RefRight - right value of the horizontal line segment
* @RefY - vertical value of the horizontal line segment
* @Coordinates - array that will collect the intersections with the vertical line segment
* @Longitude - latitude to be added so we can label the intersection on the border.  Optional
* @return - JSON object with {Easting:RefX,Northing:RefTop} if an intersection was found, null otherwise
*/
CMLayerGraticule.SegmentIntersectsAHorizontal=function(P1X,P1Y,P2X,P2Y,RefLeft,RefRight,RefY,Coordinates,Longitude)
{
	var Result=null;
	
	if (((P1X<RefLeft)&&(P2X<RefLeft))||((P1X>RefRight)&&(P2X>RefRight))|| //segment is to one side
		((P1Y<RefY)&&(P2Y<RefY))||((P1Y>RefY)&&(P2Y>RefY))) // segement is above or below 
	{
	}
	else // segment's bounding rectangle overlaps the vertical segement
	{
		if (P2Y==P1Y) // horizontal line
		{
			if (P1Y==RefY) // colinear
			{
	//			Result=[RefX,RefTop]; // vertical colinear with the vertical (not sure of correct Y value)
				
				Coordinates.push({Easting:RefLeft,Northing:RefY,Longitude:Longitude});
			}
		}
		else
		{
			// find the equation of the line
			var m=(P2Y-P1Y)/(P2X-P1X); // y=mx+b, b=y-mx
			var b=P1Y-(m*P1X);
			
			// find the intersection with our vertical
			
			var x=(RefY-b)/m; // x=(y-b)/m
			if ((x>=RefLeft)&&(x<=RefRight)) 
			{
				Coordinates.push({Easting:x,Northing:RefY,Longitude:Longitude});
			}
		}
	}
	return(Result);
}
/**
* Find the coordinates where a general polygon intersects a vertical line segment.
* This is provided because it is much faster than finding the intersection
* of two line segments.
* @private
* @Xs - X values for the polygons coordinates
* @Ys - Y values for the polygons coordinates
* @RefX - horiziontal value of the vertical line segment
* @RefTop - top of the vertical line segment
* @RefBottom - bottom of the vertical line segment
* @Coordinates - array that will collect the intersections with the vertical line segment
* @Longitude - latitude to be added so we can label the intersection on the border.  Optional
* @return - JSON object with {Easting:RefX,Northing:RefTop} if an intersection was found, null otherwise
*/
CMLayerGraticule.GetPolyIntersectionsWithVertical=function(Xs,Ys,RefLeft,RefTop,RefBottom,Coordinates)
{
	var Result=null;
	
	for (var i=0;(i<Xs.length-1);i++)
	{
		Result=CMLayerGraticule.SegmentIntersectsAVertical(Xs[i],Ys[i],Xs[i+1],Ys[i+1],RefLeft,RefTop,RefBottom,Coordinates);
	}
	return(Result);
}
/**
* Find the coordinates where a general polygon intersects a horizontal line segment.
* This is provided because it is much faster than finding the intersection
* of two line segments.
* @private
* @Xs - X values for the polygons coordinates
* @Ys - Y values for the polygons coordinates
* @RefLeft - left value of the horizontal line segment
* @RefRight - right value of the horizontal line segment
* @RefY - vertical value of the horizontal line segment
* @Coordinates - array that will collect the intersections with the vertical line segment
* @Longitude - latitude to be added so we can label the intersection on the border.  Optional
* @return - JSON object with {Easting:RefX,Northing:RefTop} if an intersection was found, null otherwise
*/
CMLayerGraticule.GetPolyIntersectionsWithHorizontal=function(Xs,Ys,RefLeft,RefRight,RefY,Coordinates)
{
	var Result=null;
	
	for (var i=0;(i<Xs.length-1);i++)
	{
		Result=CMLayerGraticule.SegmentIntersectsAHorizontal(Xs[i],Ys[i],Xs[i+1],Ys[i+1],RefLeft,RefRight,RefY,Coordinates);
	}
	return(Result);
}
/**
*
*/
CMLayerGraticule.prototype.SetupBoundsPoly=function(TheView)
{
	if (this.BoundsProjectedEastings===null)
	{
		var TheCanvas=this.GetCanvasMap();
		var TheProjector=TheCanvas.GetProjector();
		
		if (TheProjector==null) TheProjector=new CMProjector(); // geographic
		
		this.Bounds=TheProjector.GetBounds();
		
		// initialize bounds poly
		this.BoundsProjectedEastings=[];
		this.BoundsProjectedNorthings=[];
		
		// setup temp variables
		this.BoundsWestCoordinates=[];
		this.BoundsEastCoordinates=[];
		
		this.BoundsNorthCoordinates=[];
		this.BoundsSouthCoordinates=[];
	
		for (var Latitude=this.Bounds.South;Latitude<=this.Bounds.North;Latitude+=this.BoundsSpacing)
		{
			var WestCoordinate=TheProjector.ProjectFromGeographic(this.Bounds.West,Latitude);
			var EastCoordinate=TheProjector.ProjectFromGeographic(this.Bounds.East,Latitude);
			
			this.BoundsWestCoordinates.push(WestCoordinate);
			this.BoundsEastCoordinates.push(EastCoordinate);
		}
		for (var Longitude=this.Bounds.West;Longitude<this.Bounds.East;Longitude+=this.BoundsSpacing) 
		{
			var NorthCoordinate=TheProjector.ProjectFromGeographic(Longitude,this.Bounds.North);
			var SouthCoordinate=TheProjector.ProjectFromGeographic(Longitude,this.Bounds.South);
			
			this.BoundsNorthCoordinates.push(NorthCoordinate);
			this.BoundsSouthCoordinates.push(SouthCoordinate);
		}
		// paint the max bounds (Debugging)
		
/*		CMLayerGraticule.PaintLineArray(TheView,this.this.BoundsWestCoordinates);
		CMLayerGraticule.PaintLineArray(TheView,this.this.BoundsEastCoordinates);
		CMLayerGraticule.PaintLineArray(TheView,this.this.BoundsNorthCoordinates);
		CMLayerGraticule.PaintLineArray(TheView,this.this.BoundsSouthCoordinates);
*/		
		// make the max bounds into two x and y arrays
		
		for (var i=0;i<this.BoundsWestCoordinates.length;i++) // south to north along the left side
		{
			this.BoundsProjectedEastings.push(this.BoundsWestCoordinates[i].Easting);
			this.BoundsProjectedNorthings.push(this.BoundsWestCoordinates[i].Northing);
		}
		for (var i=0;i<this.BoundsNorthCoordinates.length;i++) // weat to east along the top
		{
			this.BoundsProjectedEastings.push(this.BoundsNorthCoordinates[i].Easting);
			this.BoundsProjectedNorthings.push(this.BoundsNorthCoordinates[i].Northing);
		}
		for (var i=0;i<this.BoundsEastCoordinates.length;i++) // north to south down the right side
		{
			var Index=this.BoundsEastCoordinates.length-1-i;
			
			this.BoundsProjectedEastings.push(this.BoundsEastCoordinates[Index].Easting);
			this.BoundsProjectedNorthings.push(this.BoundsEastCoordinates[Index].Northing);
		}
		for (var i=0;i<this.BoundsSouthCoordinates.length;i++) // east to west across the bototm
		{
			var Index=this.BoundsSouthCoordinates.length-1-i;
			
			this.BoundsProjectedEastings.push(this.BoundsSouthCoordinates[Index].Easting);
			this.BoundsProjectedNorthings.push(this.BoundsSouthCoordinates[Index].Northing);
		}
	}
}

/**
* Simple utility to paint the meridian segments and, if they intersect with a meridian, record them
*/
CMLayerGraticule.prototype.PaintMeridianSegment=function(TheView,PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude) 
{
	TheView.PaintRefLine(PX1,PY1,PX2,PY2);
	
	CMLayerGraticule.SegmentIntersectsAHorizontal(PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefRight,ViewRefTop,this.TopIntersectionCoordinates,Longitude);
	
	CMLayerGraticule.SegmentIntersectsAHorizontal(PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefRight,ViewRefBottom,this.BottomIntersectionCoordinates,Longitude);
}

/**
* Simple utility to paint the meridian segments and, if they intersect with a meridian, record them
*/
CMLayerGraticule.prototype.PaintParallelSegment=function(TheView,PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude) 
{
	TheView.PaintRefLine(PX1,PY1,PX2,PY2);
	
	CMLayerGraticule.SegmentIntersectsAVertical(PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefTop,ViewRefBottom,this.LeftIntersectionCoordinates,Latitude);
	
	CMLayerGraticule.SegmentIntersectsAVertical(PX1,PY1,PX2,PY2,ViewRefRight,ViewRefTop,ViewRefBottom,this.RightIntersectionCoordinates,Latitude);
}

//**************************************************************************
/**
* Main paint function for the layer.
*/
CMLayerGraticule.prototype.Paint=function(TheView) 
{
	if (this.IsVisible())
	{
		// get the projector
		
		var TheCanvas=this.GetCanvasMap();
		var TheProjector=TheCanvas.GetProjector();
		
		if (TheProjector==null) TheProjector=new CMProjector(); // geographic
		
		//**********************************************************************
		// Setup the overall bounds for the allowable projection area
		//**********************************************************************
		
		this.SetupBoundsPoly(TheView);
		
		var NewStyle={fillStyle:"Red"};
		TheView.SetStyle(NewStyle);
		
		// setup the coordinates of the view edges and the array for the points to used for the gradicule grid
		
		var TheCanvasElement=TheView.GetCanvasElement();
		
		var ViewRefLeft=TheView.GetRefXFromPixelX(0);
		var ViewRefRight=TheView.GetRefXFromPixelX(TheCanvasElement.width);
		var ViewRefTop=TheView.GetRefYFromPixelY(0);
		var ViewRefBottom=TheView.GetRefYFromPixelY(TheCanvasElement.height);
	
		var ValidCoordinates=[]; // coordinates that intersect projection bounds and view are placed here
		
		// find the intersecions between the MaxBounds of the projection and each of the view edges
		// resulting points are placed in the ValidCoordinates array
		
		CMLayerGraticule.GetPolyIntersectionsWithVertical(this.BoundsProjectedEastings,this.BoundsProjectedNorthings,
				ViewRefLeft,ViewRefTop,ViewRefBottom,ValidCoordinates); // left side
		
		CMLayerGraticule.GetPolyIntersectionsWithVertical(this.BoundsProjectedEastings,this.BoundsProjectedNorthings,
				ViewRefRight,ViewRefTop,ViewRefBottom,ValidCoordinates); // right side
		
		CMLayerGraticule.GetPolyIntersectionsWithHorizontal(this.BoundsProjectedEastings,this.BoundsProjectedNorthings,
				ViewRefLeft,ViewRefRight,ViewRefTop,ValidCoordinates); // top
		
		CMLayerGraticule.GetPolyIntersectionsWithHorizontal(this.BoundsProjectedEastings,this.BoundsProjectedNorthings,
				ViewRefLeft,ViewRefRight,ViewRefBottom,ValidCoordinates); // bottom
		
		// get the view points that are in the MaxBounds form the projector by checking if they are InsideAPolygon where the polygon is max bounds
		
		if (CMUtilities.InsideAPolygon(ViewRefLeft,ViewRefTop,this.BoundsProjectedEastings,this.BoundsProjectedNorthings,this.BoundsProjectedEastings.length))
		{
			ValidCoordinates.push({Easting:ViewRefLeft,Northing:ViewRefTop});
		}
		
		if (CMUtilities.InsideAPolygon(ViewRefRight,ViewRefTop,this.BoundsProjectedEastings,this.BoundsProjectedNorthings,this.BoundsProjectedEastings.length))
		{
			ValidCoordinates.push({Easting:ViewRefRight,Northing:ViewRefTop});
		}
		
		if (CMUtilities.InsideAPolygon(ViewRefRight,ViewRefBottom,this.BoundsProjectedEastings,this.BoundsProjectedNorthings,this.BoundsProjectedEastings.length))
		{
			ValidCoordinates.push({Easting:ViewRefRight,Northing:ViewRefBottom});
		}
		
		if (CMUtilities.InsideAPolygon(ViewRefLeft,ViewRefBottom,this.BoundsProjectedEastings,this.BoundsProjectedNorthings,this.BoundsProjectedEastings.length))
		{
			ValidCoordinates.push({Easting:ViewRefLeft,Northing:ViewRefBottom});
		}
		
		// add corners of the max bounds if they are within the view
		
		var ViewXs=[ViewRefLeft,ViewRefRight,ViewRefRight,ViewRefLeft];
		var ViewYs=[ViewRefTop,ViewRefTop,ViewRefBottom,ViewRefBottom];
		
		SWCoordinate=this.BoundsWestCoordinates[0];
		NWCoordinate=this.BoundsWestCoordinates[this.BoundsWestCoordinates.length-1];
		
		SECoordinate=this.BoundsEastCoordinates[0];
		NECoordinate=this.BoundsEastCoordinates[this.BoundsEastCoordinates.length-1];
		
		var UseBoundsNW=CMUtilities.InsideAPolygon(NWCoordinate.Easting,NWCoordinate.Northing,ViewXs,ViewYs,ViewXs.length);
		var UseBoundsNE=CMUtilities.InsideAPolygon(NECoordinate.Easting,NECoordinate.Northing,ViewXs,ViewYs,ViewXs.length);
		var UseBoundsSE=CMUtilities.InsideAPolygon(SECoordinate.Easting,SECoordinate.Northing,ViewXs,ViewYs,ViewXs.length);
		var UseBoundsSW=CMUtilities.InsideAPolygon(SWCoordinate.Easting,SWCoordinate.Northing,ViewXs,ViewYs,ViewXs.length);
		
		var NewStyle={fillStyle:"Green"};
		TheView.SetStyle(NewStyle);
	
		if (true) // debugging
		{
			if (UseBoundsNW)
			{
				TheView.PaintRefCircle(NWCoordinate.Easting,NWCoordinate.Northing,10);
//				ValidCoordinates.push({Easting:NWCoordinate.Easting,Northing:NWCoordinate.Northing});
			}
			if (UseBoundsNE)
			{
				TheView.PaintRefCircle(NECoordinate.Easting,NECoordinate.Northing,10);
//				ValidCoordinates.push({Easting:NECoordinate.Easting,Northing:NECoordinate.Northing});
			}
			if (UseBoundsSE)
			{
				TheView.PaintRefCircle(SECoordinate.Easting,SECoordinate.Northing,10);
//				ValidCoordinates.push({Easting:SECoordinate.Easting,Northing:SECoordinate.Northing});
			}
			if (UseBoundsSW)
			{
				TheView.PaintRefCircle(SWCoordinate.Easting,SWCoordinate.Northing,10);
//				ValidCoordinates.push({Easting:SWCoordinate.Easting,Northing:SWCoordinate.Northing});
			}
		}
		// paint the selected coordinates

		if (true)
		{
			var NewStyle={fillStyle:"Blue"};
			TheView.SetStyle(NewStyle);
		
			for (var i=0;i<ValidCoordinates.length;i++)
			{
				TheView.PaintRefCircle(ValidCoordinates[i].Easting,ValidCoordinates[i].Northing,10);
			}
		}
		// project the coordinates back to geographic
		
		var NewStyle={fillStyle:"Red"};
		TheView.SetStyle(NewStyle);
	
		var GeoCoordinates=[];
		for (var i=0;i<ValidCoordinates.length;i++)
		{
			var GeoCoordinate=TheProjector.ProjectToGeographic(ValidCoordinates[i].Easting,ValidCoordinates[i].Northing);
			
			GeoCoordinates.push(GeoCoordinate);
		}
		
		var NewStyle={fillStyle:"Black"};
		TheView.SetStyle(NewStyle);
		
		// find the min/max in geographic coordinates
		
		var MinLat;
		var MaxLat;
		var MinLon;
		var MaxLon;
		
		if (GeoCoordinates.length>0)
		{
			MinLat=GeoCoordinates[0].Latitude;
			MaxLat=GeoCoordinates[0].Latitude;
			MinLon=GeoCoordinates[0].Longitude;
			MaxLon=GeoCoordinates[0].Longitude;
			
			for (var i=1;i<GeoCoordinates.length;i++)
			{
				if (GeoCoordinates[i].Latitude<MinLat) MinLat=GeoCoordinates[i].Latitude;
				if (GeoCoordinates[i].Latitude>MaxLat) MaxLat=GeoCoordinates[i].Latitude;
				if (GeoCoordinates[i].Longitude<MinLon) MinLon=GeoCoordinates[i].Longitude;
				if (GeoCoordinates[i].Longitude>MaxLon) MaxLon=GeoCoordinates[i].Longitude;
			}
		}
		// expand the min/max lat/lon based on the extreme coordinates 
		
		if ((UseBoundsNW)|(UseBoundsNE))
		{
			if ((MaxLat==undefined)||(this.Bounds.North>MaxLat)) MaxLat=this.Bounds.North;
		}
		if ((UseBoundsSW)|(UseBoundsSE))
		{
			if ((MinLat==undefined)||(this.Bounds.South<MinLat)) MinLat=this.Bounds.South;
		}
		
		if ((UseBoundsNW)|(UseBoundsSW))
		{
			if ((MinLon==undefined)||(this.Bounds.West<MinLon)) MinLon=this.Bounds.West;
		}
		if ((UseBoundsNE)|(UseBoundsSE))
		{
			if ((MaxLon==undefined)||(this.Bounds.East>MaxLon)) MaxLon=this.Bounds.East;
		}
		
//		if (GeoCoordinates.length>1)
		{
			// Find the selected graticule interval
			
			// Find the center of the min/max lat/lon (target area) 
			
			var CenterLongitude=(MaxLon+MinLon)/2;
			var CenterLatitude=(MaxLat+MinLat)/2;
			
			// 	move east by 10% of the range of values to find two points in geographic (20% or 1/5 of the total area)

			var LongitudeRange=MaxLon-MinLon;
			var LatitudeRange=MaxLat-MinLat;
			
			var Lon1=CenterLongitude-(LongitudeRange/10);
			var Lon2=CenterLongitude+(LongitudeRange/10);
			
			var Lat1=CenterLatitude-(LatitudeRange/10);
			var Lat2=CenterLatitude+(LatitudeRange/10);
			
			// Project these two points.  
				var Projected1=TheProjector.ProjectFromGeographic(Lon1,CenterLatitude);
			var Projected2=TheProjector.ProjectFromGeographic(Lon2,CenterLatitude);
			
			// Find the change in longitude (20% of the total) and the corresponding change in projected space
			var ChangeInLongitude=LongitudeRange/5;
			
			var ChangeInProjected=Projected2.Easting-Projected1.Easting;
			if (ChangeInProjected<0) ChangeInProjected=-ChangeInProjected;
			
			// Convert the projected range to pixels
			var ChangeInPixels=TheView.GetPixelWidthFromRefWidth(ChangeInProjected);
			
			// the change in longitude over the change in pixels is the approximate degrees/pixels at the center of the area
			var DegreesPerPixel=ChangeInLongitude/ChangeInPixels;
			
			// the gradiule width in degreess is found by mulitplying DegreesPerPixels by the desired spacing of graticules in pixels
			var GraticuleWidthInDegrees=DegreesPerPixel*this.DesiredSpacingInPixels; // deisred width
			
			// now find the spacing that is greater than the desired
			var SpacingIndex=0;
			while ((CMLayerGraticule.DegreeQuantized[SpacingIndex]>GraticuleWidthInDegrees)&&
				(SpacingIndex+1<CMLayerGraticule.DegreeQuantized.length))
			{
				SpacingIndex++;
			}
			if ((SpacingIndex+1<CMLayerGraticule.DegreeQuantized.length)&&(SpacingIndex<0)) 
			{
				SpacingIndex--;
			}
			
			var Spacing=CMLayerGraticule.DegreeQuantized[SpacingIndex];
			
			// find the lat/lons that are an even mulitple of the spacing
			// In other words, move the grid out until we hit meridians and parallels that fit the spacing.
			
			var MinLongitude=Math.floor(MinLon/Spacing-1)*Spacing;
			var MaxLongitude=Math.ceil(MaxLon/Spacing+1)*Spacing;
			var MinLatitude=Math.floor(MinLat/Spacing-1)*Spacing;
			var MaxLatitude=Math.ceil(MaxLat/Spacing+1)*Spacing;
			
			if (MinLongitude<this.Bounds.West) MinLongitude=this.Bounds.West;
			if (MaxLongitude>this.Bounds.East) MaxLongitude=this.Bounds.East;
			if (MinLatitude<this.Bounds.South) MinLatitude=this.Bounds.South;
			if (MaxLatitude>this.Bounds.North) MaxLatitude=this.Bounds.North;
			
			//*****************************************************************************************
			// paint the graticules
			
			var TheStyle=this.GetStyle(TheView);
			
			if (TheStyle!=undefined) TheView.SetStyle(TheStyle);
			
			//******************************************************
			// draw the graticule lines
			//******************************************************
			// first we get all the coordinates
			
			var Coordinates=[];
			
			var YIndex=0;
			for (var Latitude=MaxLatitude;Latitude>=MinLatitude;Latitude-=Spacing)
			{
				Coordinates[YIndex]=[];
				
				var XIndex=0;
				for (var Longitude=MinLongitude;Longitude<MaxLongitude;Longitude+=Spacing) // draw lines of longitude (6 degrees each)
				{
					// get the easting and northing
					var Coordinate1=TheProjector.ProjectFromGeographic(Longitude,Latitude);
					
					// save the lat/lon for later
					Coordinate1.Longitude=Longitude;
					Coordinate1.Latitude=Latitude;
					
					// save the coordinate in the grid
					Coordinates[YIndex][XIndex]=Coordinate1;
					
					XIndex++;
				}
				YIndex++;
			}
			// if we got any coordinates, draw the grid of lines
			
			if (Coordinates.length!=0)
			{
				// setup an array to catch any points of intersection that cross the border
				
				this.BottomIntersectionCoordinates=[];
				this.TopIntersectionCoordinates=[];
				
				//******************************************************
				// draw the lines of longitude (meridians)
				
				var Longitude=MinLongitude;
				
				var NumColumns=Coordinates[0].length;
				var NumRows=Coordinates.length;
				for (var ColumnIndex=0;ColumnIndex<NumColumns;ColumnIndex++) // draw lines of longitude (6 degrees each)
				{
					if (Coordinates.length<=1) // do nothing
					{
					}
					else if (Coordinates.length==2) // straight line
					{
						TheView.PaintRefLine(Coordinates[0][ColumnIndex].Easting,Coordinates[0][ColumnIndex].Northing,
							Coordinates[1][ColumnIndex].Easting,Coordinates[1][ColumnIndex].Northing);
					}
					else // at least 3, maybe more
					{
						try {
							var PreviousCoordinate=Coordinates[0][ColumnIndex];
							var Coordinate1=Coordinates[1][ColumnIndex];
							var Coordinate2=Coordinates[2][ColumnIndex];
							var NextCoordinate=null;
						}
						catch(err) {
							document.getElementById("demo").innerHTML = err.message;
						}
						
						//*********************************************************************************
						// Paint the first part of the graticule as a 3-point Bezier curve
						
						// get the Bezier points for the start of the curve
						var Points=CMUtilityBezier.GetSecondOrderEndPoints3D(10,
								PreviousCoordinate.Easting,PreviousCoordinate.Northing,0,
								Coordinate1.Easting,Coordinate1.Northing,0,
								Coordinate2.Easting,Coordinate2.Northing,0);
						
						// paint from the parallel to the first coordinate on the Bezier curve
						this.PaintMeridianSegment(TheView,PreviousCoordinate.Easting,PreviousCoordinate.Northing,
								Points[0][0],Points[1][0],ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
						
						// paint the rest of the segements in the Bezier curve
						for (var i=0;i<Points[0].length-1;i++)
						{
							this.PaintMeridianSegment(TheView,Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
						}
						
						// paint the segment from the bezier to the coordinate
						this.PaintMeridianSegment(TheView,Coordinate1.Easting,Coordinate1.Northing,
								Points[0][Points[0].length-1],Points[1][Points[0].length-1],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
						
						var PreviousCoordinate=Coordinate1;
						
						//*********************************************************************************
						// Paint the middle part of the graticule as a 4-point Bezier curve
						
						for (var RowIndex=1;RowIndex<NumRows-2;RowIndex++)
						{
							var NextCoordinate=Coordinates[RowIndex+2][ColumnIndex];
							
							var Points=CMUtilityBezier.GetSecondOrderPoints2D(10,
								PreviousCoordinate.Easting,PreviousCoordinate.Northing,
								Coordinate1.Easting,Coordinate1.Northing,
								Coordinate2.Easting,Coordinate2.Northing,
								NextCoordinate.Easting,NextCoordinate.Northing);
							
							// connect to the previous curve
							this.PaintMeridianSegment(TheView,
									Coordinate1.Easting,Coordinate1.Northing,
									Points[0][0],Points[1][0],
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
						
							// draw the middle of the curve
							for (var i=0;i<Points[0].length-1;i++)
							{
								this.PaintMeridianSegment(TheView,
										Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1],
										ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
							}
							// draw the end of the curve to the current point
							this.PaintMeridianSegment(TheView,
									Points[0][Points[0].length-1],Points[1][Points[0].length-1],
									Coordinate2.Easting,Coordinate2.Northing,
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
							
							PreviousCoordinate=Coordinate1;
							Coordinate1=Coordinate2;
							Coordinate2=NextCoordinate;
						}
						//*********************************************************************************
						// Paint the last part of the graticule as a 3-point Bezier curve
						
						// get the points on the Bezier curve
						var Points=CMUtilityBezier.GetSecondOrderEndPoints3D(10,
								Coordinate2.Easting,Coordinate2.Northing,0,
								Coordinate1.Easting,Coordinate1.Northing,0,
								PreviousCoordinate.Easting,PreviousCoordinate.Northing,0);
						
						// draw from the coordinate to the first point on the curve
						this.PaintMeridianSegment(TheView,
								Coordinate1.Easting,Coordinate1.Northing,
								Points[0][Points[0].length-1],Points[1][Points[0].length-1],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
						
						// draw the points on the curve
						for (var i=Points[0].length-1;i>0;i--)
						{
							this.PaintMeridianSegment(TheView,
									Points[0][i],Points[1][i],Points[0][i-1],Points[1][i-1],
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
						}
						// paint from the Bezier curve to the last coordinate
						this.PaintMeridianSegment(TheView,
								Points[0][0],Points[1][0],Coordinate2.Easting,Coordinate2.Northing,
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
					}
					Longitude+=Spacing;
				}
				
				//******************************************************
				// draw the lines of latitude (parallels)
				
				this.LeftIntersectionCoordinates=[];
				this.RightIntersectionCoordinates=[];
				
				var NumPoints=9;
				var Latitude=MinLatitude;
				
				for (var RowIndex=0;RowIndex<NumRows;RowIndex++)
				{
					if (Coordinates[RowIndex].length<=1) // do nothing
					{
					}
					else if (Coordinates[RowIndex].length==2) // straight line
					{
						TheView.PaintRefLine(Coordinates[RowIndex][0].Easting,Coordinates[RowIndex][0].Northing,
							Coordinates[RowIndex][1].Easting,Coordinates[RowIndex][1].Northing);
					}
					else
					{
						var PreviousCoordinate=Coordinates[RowIndex][0];
						var Coordinate1=Coordinates[RowIndex][1];
						var Coordinate2=Coordinates[RowIndex][2];
						var NextCoordinate=null;
						
						//*********************************************************************************
						// Paint the first part of the graticule as a 3-point Bezier curve
						
						// get the Bezier points for the start of the curve
						var Points=CMUtilityBezier.GetSecondOrderEndPoints3D(10,
								PreviousCoordinate.Easting,PreviousCoordinate.Northing,0,
								Coordinate1.Easting,Coordinate1.Northing,0,
								Coordinate2.Easting,Coordinate2.Northing,0);
						
						// draw the line from the first line of longitude to the start of the Beizer points
						this.PaintParallelSegment(TheView,PreviousCoordinate.Easting,PreviousCoordinate.Northing,Points[0][0],Points[1][0],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
						
						// draw the Bezier curve
						for (var i=0;i<Points[0].length-1;i++)
						{
							this.PaintParallelSegment(TheView,Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1],
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
						}
						// draw segment form the end of the Bezier points to the second meridian
						this.PaintParallelSegment(TheView,Points[0][Points[0].length-1],Points[1][Points[0].length-1],
								Coordinate1.Easting,Coordinate1.Northing,
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
						
						//*********************************************************************************
						// Paint the middle part of the graticule as a 4-point Bezier curve
						
						for (var ColumnIndex=1;ColumnIndex<NumColumns-2;ColumnIndex++) // draw lines of longitude (6 degrees each)
						{
							var NextCoordinate=Coordinates[RowIndex][ColumnIndex+2];
							
							// get the next Bezier curve
							var Points=CMUtilityBezier.GetSecondOrderPoints2D(10,
								PreviousCoordinate.Easting,PreviousCoordinate.Northing, // for start slope
								Coordinate1.Easting,Coordinate1.Northing, // start point
								Coordinate2.Easting,Coordinate2.Northing, // end point
								NextCoordinate.Easting,NextCoordinate.Northing); // for end slope
							
							// meridan to the first Beizer point
							this.PaintParallelSegment(TheView,
									Coordinate1.Easting,Coordinate1.Northing,Points[0][0],Points[1][0],
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
						
							// draw this curve
							for (var i=0;i<Points[0].length-1;i++)
							{
								this.PaintParallelSegment(TheView,
										Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1],
										ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
							}
							
							// from the last Bezier point to the next meridian
							this.PaintParallelSegment(TheView,
									Points[0][Points[0].length-1],Points[1][Points[0].length-1],Coordinate2.Easting,Coordinate2.Northing,
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
							
							// shift the coordinates
							PreviousCoordinate=Coordinate1;
							Coordinate1=Coordinate2;
							Coordinate2=NextCoordinate;
						}
						//*********************************************************************************
						// Paint the last part of the graticule as a 3-point Bezier curve
						
						var Points=CMUtilityBezier.GetSecondOrderEndPoints3D(10,
								Coordinate2.Easting,Coordinate2.Northing,0,
								Coordinate1.Easting,Coordinate1.Northing,0,
								PreviousCoordinate.Easting,PreviousCoordinate.Northing,0);
						
						// from meridian to the first Bezier point
						this.PaintParallelSegment(TheView,
								Coordinate1.Easting,Coordinate1.Northing,Points[0][Points[0].length-1],Points[1][Points[0].length-1],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
								
						for (var i=Points[0].length-1;i>=1;i--)
						{
							this.PaintParallelSegment(TheView,
									Points[0][i],Points[1][i],Points[0][i-1],Points[1][i-1],
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
						}
						this.PaintParallelSegment(TheView,
								Points[0][0],Points[1][0],Coordinate2.Easting,Coordinate2.Northing,
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
						
						Latitude+=Spacing;
					}
				}
			}
		}
		//********************************************************************************
		// draw the lat lons that are outside the bounds but do not intersect with the border
	
		TheView.ResetCollisions();
		
		if (Coordinates.length!=0)
		{
			var FontSize=this.SetupLabelFont(TheView,-1); // setup the font but not from a feature
			var NumColumns=Coordinates[0].length;
			var NumRows=Coordinates.length;
			
			// paint latitudes along the west border
			if (MinLongitude==this.Bounds.West)
			{
				for (var Row=0;Row<NumRows;Row++)
				{
					var TheCoordinate=Coordinates[Row][0];
					
					var PixelWidth=TheView.GetTextWidthInPixels(Text);
					
					var RefWidth=TheView.GetRefWidthFromPixelWidth(4);
					
					var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Latitude,false,true);
					
					TheView.PaintRefText(Text,TheCoordinate.Easting-RefWidth,TheCoordinate.Northing,FontSize,"right",0)
				}
			}
			// paint latitudes along the east border
			if (MaxLongitude==this.Bounds.East)
			{
				for (var Row=0;Row<NumRows;Row++)
				{
					var TheCoordinate=Coordinates[Row][NumColumns-1];
					
					var RefWidth=TheView.GetRefWidthFromPixelWidth(4);
					
					var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Latitude,false,true);
					
					TheView.PaintRefText(Text,TheCoordinate.Easting+RefWidth,TheCoordinate.Northing,FontSize,"",0)
				}
			}
			// paint longitudes along the south border
			if (MinLatitude==this.Bounds.South)
			{
				for (var Column=0;Column<NumColumns;Column++)
				{
					var TheCoordinate=Coordinates[NumRows-1][Column];
					
					var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Longitude,true,true);
			
					TheView.PaintRefText(Text,TheCoordinate.Easting,TheCoordinate.Northing,FontSize,"center",0)
				}
			}
			// paint longitudes along the north border
			if (MaxLatitude==this.Bounds.North)
			{
				for (var Column=0;Column<NumColumns;Column++)
				{
					var TheCoordinate=Coordinates[0][Column];
					
					var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Longitude,true,true);
					
					TheView.PaintRefText(Text,TheCoordinate.Easting,TheCoordinate.Northing,FontSize,"center",0)
				}
			}
		}
		//*********************************************************
		// draw the border width coordinates in it.
		
		var TheCanvasElement=TheView.GetCanvasElement();
		
		var CanvasWidth=TheCanvasElement.width;
		var CanvasHeight=TheCanvasElement.height;
		
		var NewStyle={fillStyle:"White",strokeStyle:"rgba(0,0,0,0)"};
		TheView.SetStyle(NewStyle);
		
		var BorderWidth=11;
		
		TheView.PaintRect(0,BorderWidth,0,CanvasHeight); // left
		TheView.PaintRect(0,CanvasWidth,0,BorderWidth); // top
		TheView.PaintRect(CanvasWidth-BorderWidth,CanvasWidth,0,CanvasHeight); // right
		TheView.PaintRect(0,CanvasWidth,CanvasHeight-BorderWidth,CanvasHeight); // bottom
		
		var NewStyle={fillStyle:"rgba(0,0,0,0)",strokeStyle:"Black"};
		TheView.SetStyle(NewStyle);
		
		TheView.PaintRect(BorderWidth,CanvasWidth-BorderWidth,BorderWidth,CanvasHeight-BorderWidth); // bottom
		
		// draw the coordinates in the border
		
		var NewStyle={fillStyle:"Black",strokeStyle:"Black"};
		TheView.SetStyle(NewStyle);
		
		// draw coordinates in the top border
		
		TheView.ResetCollisions();
		
		if (this.TopIntersectionCoordinates!=null)
		{
			for (var i=0;i<this.TopIntersectionCoordinates.length;i++)
			{
				var TheCoordinate=this.TopIntersectionCoordinates[i];
				
				var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Longitude,true,true);
				
				var RefOffset=TheView.GetRefHeightFromPixelHeight(9);
				
//				this.PaintLongitude(TheView,TheCoordinate,RefOffset,FontSize);
				TheView.PaintRefText(Text,TheCoordinate.Easting,TheCoordinate.Northing+RefOffset,FontSize,"center",0)
			}
		}
		// draw coordinates in the bottom border
		
		if (this.BottomIntersectionCoordinates!=null)
		{
			for (var i=0;i<this.BottomIntersectionCoordinates.length;i++)
			{
				var TheCoordinate=this.BottomIntersectionCoordinates[i];
				
				var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Longitude,true,true);
				
				var RefOffset=-TheView.GetRefHeightFromPixelHeight(1);
				
//				this.PaintLongitude(TheView,TheCoordinate,RefOffset,FontSize);
				TheView.PaintRefText(Text,TheCoordinate.Easting,TheCoordinate.Northing+RefOffset,FontSize,"center",0)
			}
		}
		// draw coordinates in the left border
		
		if (this.LeftIntersectionCoordinates!=null)
		{
			for (var i=0;i<this.LeftIntersectionCoordinates.length;i++)
			{
				var TheCoordinate=this.LeftIntersectionCoordinates[i];
				
				var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Latitude,true,true);
				
				var RefOffset=TheView.GetRefWidthFromPixelWidth(9);
				
//				this.PaintLatitude(TheView,TheCoordinate,RefOffset,FontSize,true,-Math.PI/2);
				TheView.PaintRefText(Text,TheCoordinate.Easting+RefOffset,TheCoordinate.Northing,FontSize,"center",-Math.PI/2)
			}
		}
		
		// draw coordinates in the right border
		
		if (this.RightIntersectionCoordinates!=null)
		{
			for (var i=0;i<this.RightIntersectionCoordinates.length;i++)
			{
				var TheCoordinate=this.RightIntersectionCoordinates[i];
				
				var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Latitude,true,true);
				
				var RefOffset=-TheView.GetRefWidthFromPixelWidth(10);
				
//				this.PaintLatitude(TheView,TheCoordinate,RefOffset,FontSize,true,Math.PI/2);
				TheView.PaintRefText(Text,TheCoordinate.Easting+RefOffset,TheCoordinate.Northing,FontSize,"center",Math.PI/2)
			}
		}
		if (TheStyle!=undefined) TheView.RestoreStyle();
	}
}

