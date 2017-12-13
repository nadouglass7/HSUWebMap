//******************************************************************
// CMDatasetGeoJSON Class
//******************************************************************

//******************************************************************
// Global Variables
//******************************************************************

//******************************************************************
// CMDatasetGeoJSON Constructor
//******************************************************************
function CMDatasetGeoJSON() 
{
	CMDataset.call(this);
	this.TheData=null;

	//this.FeatureBounds is added when data is loaded
}
CMDatasetGeoJSON.prototype=Object.create(CMDataset.prototype); // inherit prototype functions from PanelBase()

CMDatasetGeoJSON.prototype.contructor=CMDatasetGeoJSON; // override the constructor to go to ours

//**************************************************************
// Prviate functions
//**************************************************************
//**************************************************************
// Functions specifically for vector data
//**************************************************************
/**
* Get the boounds of the specified data in GeoJSON Format
* @private
* @param TheData - An object containing GeoJSON data
* @returns - An object containining: xMin,xMax,yMin,yMax
*/
CMDatasetGeoJSON.prototype.GetBoundingBoxFromGeoJSON=function(TheData) 
{
	var TheBounds={};
	this.FeatureBounds=[];
	
	if (TheData!=null)
	{
		// We want to use the features key of the FeatureCollection (see above)
		var TheFeatures=TheData.features;
	
		// Loop through each feature
		for (var i=0; i < TheFeatures.length; i++) 
		{
			var TheGeometry=TheFeatures[i].geometry;
			
			var TheFeatureBounds={};
			
			CMUtilities.ApplyToGeometryCoordinates(TheGeometry,CMUtilities.UpdateGeoJSONCoordinateBounds,TheFeatureBounds);
			
			if (Object.keys(TheBounds).length==0)
			{
				TheBounds.XMin=TheFeatureBounds.XMin;
				TheBounds.XMax=TheFeatureBounds.XMax;
				TheBounds.YMin=TheFeatureBounds.YMin;
				TheBounds.YMax=TheFeatureBounds.YMax;
			}
			else
			{
				// Update the TheBounds recursively by comparing the current
				// xMin/xMax and yMin/yMax with the coordinate 
				// we're currently checking
				if (TheBounds.XMin > TheFeatureBounds.XMin) TheBounds.XMin =TheFeatureBounds.XMin;
				if (TheBounds.XMax < TheFeatureBounds.XMax) TheBounds.XMax=TheFeatureBounds.XMax;
				if (TheBounds.YMin >TheFeatureBounds.YMin) TheBounds.YMin =TheFeatureBounds.YMin;
				if (TheBounds.YMax < TheFeatureBounds.YMax) TheBounds.YMax =TheFeatureBounds.YMax;
			}
			this.FeatureBounds[i]=TheFeatureBounds;
		}
	}
	return(TheBounds);
}
//**************************************************************
// Private paint functions
//**************************************************************
/*
* Paint a geometry that is in reference coordinates (i.e. GeoJSON)
* @private
* @param TheGeometry
*/
CMDatasetGeoJSON.prototype.PaintRefGeometry=function(TheLayer,TheView,FeatureIndex,TheGeometry,SelectedOnly)
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

			this.PaintRefLineString(TheLayer,TheView,FeatureIndex,TheCoordinates,SelectedOnly);
		}
	}
	else if (TheGeometry.type=="Polygon")
	{
		for (var j=0;j<TheGeometry.coordinates.length;j++) // first polygon is exterior, others are interior (this needs to be cached)
		{
			TheCoordinates=TheGeometry.coordinates[j];

			this.PaintRefPolygon(TheLayer,TheView,FeatureIndex,TheCoordinates,SelectedOnly);
		}
	}
	else if (TheGeometry.type=="MultiPolygon")
	{
		for (var i=0;i<TheGeometry.coordinates.length;i++) // each loop is a separate area
		{
			var TheCoordinateArrays=TheGeometry.coordinates[i];
			
			for (var j=0;j<TheCoordinateArrays.length;j++) // first polygon is exterior, others are interior (this needs to be cached)
			{
				TheCoordinates=TheCoordinateArrays[j];

				this.PaintRefPolygon(TheLayer,TheView,FeatureIndex,TheCoordinates,SelectedOnly);
			}
		}
	}
	else if (TheGeometry.type=="GeometryCollection")
	{
		for (var j=0;j<TheGeometry.geometries.length;j++)
		{
			this.PaintRefGeometry(TheLayer,TheView,FeatureIndex,TheGeometry.geometries[j],SelectedOnly);
		}
	}
}
CMDatasetGeoJSON.prototype.PaintRefPolygon=function(TheLayer,TheView,FeatureIndex,TheCoordinates,SelectedOnly)
{
	TheLayer.PaintPoly(TheView,FeatureIndex,TheCoordinates,true,SelectedOnly);
}
CMDatasetGeoJSON.prototype.PaintRefLineString=function(TheLayer,TheView,FeatureIndex,TheCoordinates,SelectedOnly)
{
	TheLayer.PaintPoly(TheView,FeatureIndex,TheCoordinates,false,SelectedOnly);
}
//**************************************************************
// Functions for Bounds
//**************************************************************

/**
* Check if the feature is visible in the view.
* This should be called by subclasses but can also be called to limit a layer's bounds after loading.
* @public
* @param NewBounds - Bounds with format {XMin,XMax,YMin,YMax}
*/
CMDatasetGeoJSON.prototype.SetBounds=function(NewBounds) 
{
	this.TheBounds=NewBounds;
}
/**
* Returns the bounds of the data within the layer.  Computed after loading the data.
* @public
* @returns Bounds - with format {XMin,XMax,YMin,YMax}
*/
CMDatasetGeoJSON.prototype.GetBounds=function() 
{
	return(this.TheBounds);
}
CMDatasetGeoJSON.prototype.GetFeatureBounds=function(FeatgureIndex) 
{
	return(this.FeatureBounds[FeatgureIndex]);
}


//**************************************************************
// Functions for attributes
//**************************************************************
CMDatasetGeoJSON.prototype.GetNumAttributeRows=function() 
{ 
	var Result=0;
	if (this.TheData!=null)
	{
		Result=this.TheData.features.length;
	}
	return(Result); 
}
CMDatasetGeoJSON.prototype.GetNumAttributeColumns=function() 
{ 
	var Result=0;
	if (this.TheData!=null)
	{
		var Properties=this.TheData.features[0].properties;
		
		for (var key in Properties) Result++;
	}
	return(Result); 
}
CMDatasetGeoJSON.prototype.GetAttributeHeading=function(ColumnIndex) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		var Properties=this.TheData.features[0].properties;
		var TheKey=null;
		var Column=0;
		for (var key in Properties) 
		{
			if (Column==ColumnIndex) TheKey=key;
			Column++;
		}
		if (TheKey!=null)
		{
			Result=TheKey;
		}
	}
	return(Result); 
}
CMDatasetGeoJSON.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		var Properties=this.TheData.features[0].properties;
		var TheKey=null;
		var Column=0;
		for (var key in Properties) 
		{
			if (Column==ColumnIndex) TheKey=key;
			Column++;
		}
		if (TheKey!=null)
		{
			Result=this.TheData.features[RowIndex].properties[TheKey];
		}
	}
	return(Result); 
}
CMDatasetGeoJSON.prototype.AddAttributeHeading=function(NewHeading,DefaultValue) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		var TheFeatures=this.TheData.features;
		
		for (i=0;i<TheFeatures.length;i++)
		{
			TheFeatures[i].properties[NewHeading]=DefaultValue;
		}
	}
	return(Result); 
}

CMDatasetGeoJSON.prototype.GetAttributeCellByHeading=function(Heading,RowIndex) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		var Properties=this.TheData.features[RowIndex].properties;
		
		Result=Properties[Heading];
	}
	return(Result); 
}
CMDatasetGeoJSON.prototype.SetAttributeCell=function(ColumnIndex,RowIndex,Value) 
{ "use strict";
	var Result="";
	if (this.TheData!==null)
	{
		var Properties=this.TheData.features[RowIndex].properties;
		
		Properties[ColumnIndex]=Value;
	}
	return(Result); 
};
CMDatasetGeoJSON.prototype.SetAttributeCellByHeading=function(Heading,RowIndex,Value) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		var Properties=this.TheData.features[RowIndex].properties;
		
		Properties[Heading]=Value;
	}
};

//**************************************************************
// Functions specifically for vector data
//**************************************************************

/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
*/
CMDatasetGeoJSON.prototype.SetURL=function(URL,ZoomToBounds) 
{
	this.URL=URL;
	
	var TheRequest=new XMLHttpRequest(); // wait staff at the resturant
	TheRequest.open("GET",URL,true); // the URL is what we ordered
	TheRequest.TheURL=URL;
	TheRequest.TheDataset=this;
	TheRequest.ZoomToBounds=ZoomToBounds;
			
	TheRequest.onreadystatechange=function() 
	{
		if (this.readyState == 4)  // done
		{
			if (this.status == 200) // OK
			{
				var TheText=TheRequest.responseText;

				var TheGeoJSONObject=JSON.parse(TheText);
				
				// project the data if needed
				
				var TheProjector=this.TheDataset.GetProjector();
				
				if (TheProjector!=null) 
				{
					TheProjector.ProjectGeoJSONFromGeographic(TheGeoJSONObject);
				}
				
				// save the data in the data object
				
				this.TheDataset.SetData(TheGeoJSONObject);
				
				// zoom to the data
				
				if (this.ZoomToBounds)
				{
					var TheMainContainer=this.TheDataset.GetParent(CMMainContainer);
					
					TheMainContainer.ZoomToBounds(this.TheDataset.GetBounds());
				}
				// update the debuging panel if desired
				if (this.TheDataset.GetParent(CMMainContainer)!=null)
				{
					this.TheDataset.GetParent(CMMainContainer).AddToDebugPanel(this.TheDataset.GetName()+" Received info, repainting:"+CMUtilities.GetSeconds());
				}
				
				// call the layer's specified on load function if provided
//				if (this.TheDataset.OnLoad!=null) 
				{
					this.TheDataset.SendMessageToListeners(CMDataset.MESSAGE_DATASET_LOADED);
				}
				// repaint last so the layer has the chance to chagne the painting settings (listeners made this obsolete)
	//			this.TheDataset.GetParent(CMScene).Repaint(); 
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
};
/*
* Set the vector data from a GeoJSON object
*/
CMDatasetGeoJSON.prototype.SetData=function(TheData) 
{
	this.TheData=TheData; // this is makeing rendering break!
	
	var TheBounds=this.GetBoundingBoxFromGeoJSON(TheData);
	
	this.SetBounds(TheBounds);
};

//******************************************************************
// CMLayer Mouse event handling
//******************************************************************
/*
* returns the feature index for the coordinate in projected space
* returns -1 if the coordinate is not in a feature
*/
CMDatasetGeoJSON.prototype.GetNumFeatures=function() 
{
	var Result=0;
	if ((this.TheData!=null)) Result=this.TheData.features.length;
	return(Result);
}
CMDatasetGeoJSON.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
	if ((this.TheData!=null)) 
	{
		var Tolerance=TheView.GetRefWidthFromPixelWidth(this.ClickTolerance);
		
		var TheFeatures=this.TheData.features;
	
		// Loop over the features
		for (var i=0;( i < TheFeatures.length)&&(FeatureIndex==-1); i++) 
		{
			var Result=this.InFeature(TheView,RefX,RefY,i);
			
			if (Result) FeatureIndex=i;
		}
	}
	return(FeatureIndex);
}
/**
* Checks if the specified coordinate is in the specified feature
*/
CMDatasetGeoJSON.prototype.InFeature=function(TheView,RefX,RefY,FeatureIndex) 
{
	var Result=false;
	
	if (this.TheData!=null) 
	{
		var Tolerance=TheView.GetRefWidthFromPixelWidth(this.ClickTolerance);
		
		var TheFeatures=this.TheData.features;
	
		var TheFeature=TheFeatures[FeatureIndex];
		
		var TheGeometry=TheFeature.geometry;
		
		var Result=false;
		if (TheGeometry.type=="Point")
		{
			var TheCoordinates=TheGeometry.coordinates;
			
			if ((Math.abs(TheCoordinates[0]-RefX)<=Tolerance)&&(Math.abs(TheCoordinates[1]-RefY)<=Tolerance))
			{
				Result=true;
			}
		}
		else if (TheGeometry.type=="LineString")
		{
			var TheCoordinates=TheGeometry.coordinates;
			
			Result=CMUtilities.InGeoJSONPolyline(RefX,RefY,TheCoordinates,Tolerance);
		}
		else if (TheGeometry.type=="MultiLineString")
		{
			for (var j=0;j<(TheGeometry.coordinates.length)&&(Result==false);j++)
			{
				TheCoordinates=TheGeometry.coordinates[j];
	
				Result=CMUtilities.InGeoJSONPolyline(RefX,RefY,TheCoordinates,Tolerance);
			}
		}
		else if (TheGeometry.type=="Polygon")
		{
			// pulling out the coordinates
			TheCoordinates=TheGeometry.coordinates[0];
	
			Result=CMUtilities.InGeoJSONPolygon(RefX,RefY,TheCoordinates);
		}
		else if (TheGeometry.type=="MultiPolygon")
		{
			for (var j=0;(j<TheGeometry.coordinates.length)&&(Result==false);j++)
			{
				TheCoordinates=TheGeometry.coordinates[j][0];
	
				Result=CMUtilities.InGeoJSONPolygon(RefX,RefY,TheCoordinates);
			}
		}
	}
	return(Result);
};


//******************************************************************
// CMDatasetGeoJSON Painting Functions
//******************************************************************
/*
* Paints a layer into the canvas
* This is a little complicated because the geometries can contain
* polylines, polygons or points. 
*/
CMDatasetGeoJSON.prototype.Paint=function(TheLayer,TheView,SelectedOnly,MouseOverOnly) 
{
	if ((TheView instanceof CMView2D)&&(this.TheData!=null)) //(this.GetVisible())&&
	{
		if (MouseOverOnly==undefined) MouseOverOnly=false;
		
		this.GetParent(CMMainContainer).AddToDebugPanel(this.GetName()+" Starting Paint:"+CMUtilities.GetSeconds());
		
		// Get the features from the data
		var TheFeatures=this.TheData.features; 
	
		var ViewBounds=TheView.GetExtent();
			
		// draw each feature
		for (var FeatureIndex=0; FeatureIndex < TheFeatures.length; FeatureIndex++) 
		{
			// jjg - not the most efficient approach
			var Draw=false; 
			if ((SelectedOnly==false)&&(MouseOverOnly==false))
			{
				Draw=true;
			}
			else if ((SelectedOnly)&&(this.SelectedFeature==FeatureIndex)) 
			{
				Draw=true;
			}
			else if ((MouseOverOnly)&&(this.MouseOverFeatureIndex==FeatureIndex)) 
			{
				Draw=true;
			}
			if (Draw)
			{
				var TheFeatureBounds=this.GetFeatureBounds(FeatureIndex);
				
				if ((CMUtilities.BoundsOverlap(ViewBounds,TheFeatureBounds)))
				{
					// setup the fill color
					
					var TheFeature=TheFeatures[FeatureIndex];
					
					// get the geometry so we can see if it is a point feature
					 
					var TheGeometry=TheFeature.geometry;
					
					var Result=false;
					if (TheGeometry.type=="Point") // draw a point as an icon or a mark
					{
						var TheCoordinates=TheGeometry.coordinates;
						
						TheLayer.PaintPoint(TheView,FeatureIndex,TheCoordinates[0],TheCoordinates[1],SelectedOnly);
					}
					else // draw a polyline or polygon
					{
						var TheGeometry=TheFeatures[FeatureIndex].geometry;
						
						this.PaintRefGeometry(TheLayer,TheView,FeatureIndex,TheGeometry,SelectedOnly);
					}
				}
			}
		}
		this.GetParent(CMMainContainer).AddToDebugPanel(this.GetName()+" Leaving Paint:"+CMUtilities.GetSeconds());
	}
}



//******************************************************************
// CMLayer Searching Functions
//******************************************************************

/*
* Requests search results from a layer.  The scene calls this function.
*/
CMDatasetGeoJSON.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
//	var TheText="";
	
	if ((this.TheData!=null)) //(this.GetVisible())&&
	{
		// Get the features from the data
		TheFeatures=this.TheData.features;
	
		// draw each feature
		for (var i=0; i < TheFeatures.length; i++) 
		{
			var TheFeature=TheFeatures[i];
			
			var Properties=TheFeature.properties;
			
	//		for (var j=0;j<Properties.length;j++)
			{
//				var TheProperty=Properties[j]; // one row of key/value pairs
				
				var Found=false;
				
				for (var key in Properties) 
				{
  					if ((Found==false)&&(Properties.hasOwnProperty(key)))
					{
						var TheProperty=Properties[key];
						
						if (typeof(TheProperty)=="string")
						{
							TheProperty=TheProperty.toLowerCase();
							
							if (TheProperty.indexOf(SearchPhrase)!=-1)
							{
								var ThisResult=document.createElement("DIV");
								ThisResult.innerHTML=Properties[key];
								ThisResult.className="CM_SearchResult";
								
								ThisResult.TheDataset=this;
								ThisResult.FeatureIndex=i;
								
								// setup function called when user clicks on search result
								ThisResult.onclick=function()
								{
									var TheScene=this.TheDataset.GetParent(CMScene);
									TheScene.UnselectAll();
									this.TheDataset.SetSelectedFeature(this.FeatureIndex);
									
									var TheBounds=this.TheDataset.FeatureBounds[this.FeatureIndex];
									var TheView=TheScene.GetView(0);
									
									this.className="CM_SearchResultSelected";
									
									TheView.ZoomToBounds(TheBounds);
								}
								ResultsPanel.appendChild(ThisResult);
								
								Found=true;
							}
						}
				  	}
				}
				
			}
		}
	}
}


//******************************************************************
// Public CMDatasetGeoJSON functions
//******************************************************************

/**
* Add a new point to the GeoJSON data
*/
CMDatasetGeoJSON.prototype.AddPoint=function(X,Y)
{
	var Projector=this.GetProjector();
	
	if (Projector!=null)
	{
		var Result=Projector.ProjectFromGeographic(X,Y);
		X=Result.Easting;
		Y=Result.Northing;
	}

	var TheFeature={ 
		"type": "Feature", 
		"properties": { "scalerank": 10}, 
		"geometry": { 
			"type": "Point", "coordinates": [ X, Y ] } };
	
	if (this.TheData==null)
	{
		this.TheData={
			"type": "FeatureCollection",
			"features":[]
		};
	}
	var TheFeatures=this.TheData.features;
	
	TheFeatures.push(TheFeature);
	
	this.GetBoundingBoxFromGeoJSON(this.TheData);
}

