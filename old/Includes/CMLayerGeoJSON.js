//******************************************************************
// CMLayerGeoJSON Class
//******************************************************************

//******************************************************************
// Global Variables
//******************************************************************

// object reference for the balloon if it is displayed
//CMLayerGeoJSON.InfoWindow=null;

//******************************************************************
// CMLayerGeoJSON Constructor
//******************************************************************
function CMLayerGeoJSON() 
{
	this.TheData=null;
	
}
CMLayerGeoJSON.prototype=new CMLayer(); // inherit prototype functions from PanelBase()

CMLayerGeoJSON.prototype.contructor=CMLayerGeoJSON; // override the constructor to go to ours

//**************************************************************
// Prviate functions
//**************************************************************
//**************************************************************
// Functions specifically for vector data
//**************************************************************
//
// Get the boounds of the specified data in GeoJSON Format
// Inputs:
// - TheData: An object containing GeoJSON data
// Outputs:
// - An object containining: xMin,xMax,yMin,yMax
//
CMLayerGeoJSON.prototype.GetBoundingBoxFromGeoJSON=function(TheData) 
{
	var TheBounds={};
	this.FeatureBounds=[];
	
	// We want to use the “features” key of the FeatureCollection (see above)
	var TheFeatures=TheData.features;

	// Loop through each “feature”
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
	return(TheBounds);
}

//**************************************************************
// Functions for attributes
//**************************************************************
CMLayer.prototype.GetNumAttributeRows=function() 
{ 
	var Result=0;
	if (this.TheData!=null)
	{
		Result=this.TheData.features.length;
	}
	return(Result); 
}
CMLayer.prototype.GetNumAttributeColumns=function() 
{ 
	var Result=0;
	if (this.TheData!=null)
	{
		var Properties=this.TheData.features[0].properties;
		
		for (var key in Properties) Result++;
	}
	return(Result); 
}
CMLayer.prototype.GetAttributeHeading=function(ColumnIndex) 
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
CMLayer.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) 
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
CMLayer.prototype.AddAttributeHeading=function(NewHeading,DefaultValue) 
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

CMLayer.prototype.GetAttributeCellByHeading=function(Heading,RowIndex) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		var Properties=this.TheData.features[RowIndex].properties;
		
		Result=Properties[Heading];
	}
	return(Result); 
}
CMLayer.prototype.SetAttributeCell=function(ColumnIndex,RowIndex,Value) 
{ "use strict";
	var Result="";
	if (this.TheData!==null)
	{
		var Properties=this.TheData.features[RowIndex].properties;
		
		Properties[ColumnIndex]=Value;
	}
	return(Result); 
};
CMLayer.prototype.SetAttributeCellByHeading=function(Heading,RowIndex,Value) 
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
CMLayerGeoJSON.prototype.SetURL=function(URL,NewView,ZoomToBounds) 
{
	var TheRequest=new XMLHttpRequest(); // wait staff at the resturant
	TheRequest.open("GET",URL,true); // the URL is what we ordered
	TheRequest.TheView=NewView;
	TheRequest.TheURL=URL;
	TheRequest.TheLayer=this;
	TheRequest.ZoomToBounds=ZoomToBounds;
			
	TheRequest.onreadystatechange=function() 
	{
		//alert("onreadystatechange"+this.readyState);
		if( this.readyState == 4)  // done
		{
//			alert("status="+this.status);
			if( this.status == 200) // OK
			{
				var TheText=TheRequest.responseText;

				var TheGeoJSONObject=JSON.parse(TheText);
				
				var TheProjector=this.TheLayer.GetProjector();
				
				if (TheProjector!=null) 
				{
//					alert("projecting");
					TheProjector.ProjectGeoJSONFromGeographic(TheGeoJSONObject);
				}
				
				this.TheLayer.SetData(TheGeoJSONObject);
				
				if (this.ZoomToBounds)
				{
					this.TheView.ZoomToBounds(this.TheLayer.GetBounds());
				}
				if (this.TheLayer.GetCanvasMap()!=null)
				{
					this.TheLayer.GetCanvasMap().AddToDebugPanel(this.TheLayer.GetName()+" Received info, repainting:"+CMUtilities.GetSeconds());
				}
				this.TheLayer.Repaint(); 
				
				if (this.TheLayer.OnLoad!=null) 
				{
					this.TheLayer.OnLoad();
				}
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
};
/*
* Set the vector data from a GeoJSON object
*/
CMLayerGeoJSON.prototype.SetData=function(TheData) 
{
	this.TheData=TheData;
	
	if (this.ShiftToGoogleMercator) 
	{
		ShiftDataToGoogleMercator(TheData);
	}
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
CMLayerGeoJSON.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
	if ((this.IsVisible())&&(this.TheData!=null))
	{
		var Tolerance=TheView.GetRefWidthFromPixelWidth(this.ClickTolerance);
		
		var TheFeatures=this.TheData.features;
	
			// Loop over the features…
		for (var i=0;( i < TheFeatures.length)&&(FeatureIndex==-1); i++) 
		{
			if (this.IsFeatureVisible(i))
			{
				var TheFeature=TheFeatures[i];
				
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
					// …pulling out the coordinates…
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
				if (Result) FeatureIndex=i;
			}
		}
	}
	return(FeatureIndex);
};

CMLayerGeoJSON.prototype.MouseDown=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	if ((this.IsVisible())&&(this.GetClickable())&&
		((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT))) // check if we where clicked in
	{
		var FeatureIndex=this.In(TheView,RefX,RefY);
		
		if (FeatureIndex!=-1)
		{
			this.ShowInfoWindow(FeatureIndex,TheView,RefX,RefY);
			
			Used=true;
		}
	}
	return(Used);
};

CMLayerGeoJSON.prototype.ShowInfoWindow=function(FeatureIndex,TheView,RefX,RefY) 
{
	var TheFeatures=this.TheData.features;

	var TheFeature=TheFeatures[FeatureIndex];
	
	var Properties=TheFeature.properties;
	
	var TheHTML=this.GetFeatureProperty(CMLayer.INFO,FeatureIndex,null);
	
	if (TheHTML!=null)
	{
	//	var TheHTML=Properties[this.GetHTMLAttribute()];
		
		var InfoWindow=TheView.CreateInfoWindow("CMLayerGeoJSON.InfoWindow",RefX,RefY,this.GetInfoWindowWidth(),30,TheHTML);
		
		CanvasMap.SetPopupWindow(InfoWindow);
	}
};

//******************************************************************
// CMLayer Painting Functions
//******************************************************************
/*
* Paints a layer into the canvas
* This is a little complicated because the geometries can contain
* polylines, polygons or points. 
*/
CMLayerGeoJSON.prototype.Paint=function(TheView) 
{
	if ((this.GetVisible())&&(this.TheData!=null))
	{
		this.GetCanvasMap().AddToDebugPanel(this.GetName()+" Starting Paint:"+CMUtilities.GetSeconds());
		
		var TheIconImage=this.GetProperty(CMLayer.ICON_IMAGE);
		
		var TheStyle=this.GetStyle();
		
		TheView.SetStyle(TheStyle);
		
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		// Get the features from the data
		TheFeatures=this.TheData.features;
	
		var ViewBounds=TheView.GetExtent();
			
		// draw each feature
		for (var i=0; i < TheFeatures.length; i++) 
		{
			if ((this.IsFeatureVisible(i))&&(CMUtilities.BoundsOverlap(ViewBounds,this.FeatureBounds[i])))
			{
				// setup the fill color
				
				var TheFeature=TheFeatures[i];
				
				var TheFeatureStyle=this.GetFeatureProperty(CMLayer.FEATURE_STYLE,i,TheStyle);
				
				if (TheFeatureStyle!==null) { TheView.SetStyle(TheFeatureStyle,false); }
				
				// get the geometry so we can see if it is a point feature
				
				var TheGeometry=TheFeature.geometry;
				
				var Result=false;
				if (TheGeometry.type=="Point") // draw a point as an icon or a mark
				{
					var TheCoordinates=TheGeometry.coordinates;
					
					var ThisFeaturesIconImage=this.GetFeatureProperty(CMLayer.ICON_IMAGE,i,TheIconImage);
					
					this.PaintPoint(TheView,i,TheCoordinates[0],TheCoordinates[1],ThisFeaturesIconImage);
					
				}
				else // draw a polyline or polygon
				{
					var TheGeometry=TheFeatures[i].geometry;
					
					TheView.PaintRefGeometry(TheGeometry);
				}
			}
		}
		TheView.RestoreStyle();
		
		this.GetCanvasMap().AddToDebugPanel(this.GetName()+" Leaving Paint:"+CMUtilities.GetSeconds());
	}
}
/*
* Paints a layer into the canvas
* This is a little complicated because the geometries can contain
* polylines, polygons or points. 
*/
CMLayerGeoJSON.prototype.PaintSelected=function(TheView) 
{
	if ((this.GetVisible())&&(this.TheData!=null))
	{
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		// Get the features from the data
		TheFeatures=this.TheData.features;
	
		// paint the mouse over if any
		
		TheView.SaveStyle();
		
		if ((this.MouseOverFeatureIndex!=-1)&&(this.IsFeatureVisible(this.MouseOverFeatureIndex))) // in a feature
		{
			var TheStyle=this.GetFeatureProperty(CMLayer.MOUSE_OVER_STYLE,this.MouseOverFeatureIndex);
			
			if (TheStyle!==null)
			{
				TheView.SetStyle(TheStyle,false);
				 
				var TheGeometry=TheFeatures[this.MouseOverFeatureIndex].geometry;
				
				TheView.PaintRefGeometry(TheGeometry);
			}
		}
		// paint the selected feature
		
		if ((this.SelectedFeatureIndex!=-1)&&(this.IsFeatureVisible(this.SelectedFeatureIndex)))
		{
			var TheStyle=this.GetFeatureProperty(CMLayer.SELECTED_STYLE,this.MouseOverFeatureIndex);
			
			if (TheStyle!==null)
			{
				TheView.SetStyle(TheStyle,false);
				
				var TheGeometry=TheFeatures[this.SelectedFeatureIndex].geometry;
				
				TheView.PaintRefGeometry(TheGeometry);
			}
		}
		TheView.RestoreStyle();
	}
}

//******************************************************************
// CMLayer Searching Functions
//******************************************************************

/*
* Requests search results from a layer.  The scene calls this function.
*/
CMLayerGeoJSON.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
//	var TheText="";
	
	if ((this.GetVisible())&&(this.TheData!=null))
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
								
								ThisResult.TheLayer=this;
								ThisResult.FeatureIndex=i;
								
								// setup function called when user clicks on search result
								
								ThisResult.onclick=function()
								{
									this.TheLayer.TheScene.UnselectAll();
									this.TheLayer.SetSelectedFeature(this.FeatureIndex);
									
									var TheBounds=this.TheLayer.FeatureBounds[this.FeatureIndex];
									var TheView=this.TheLayer.TheScene.GetView(0);
									
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
// CMLayer Display functions
//******************************************************************

CMLayerGeoJSON.prototype.HasSettingsDialog=function() 
{ 
	return(true); 
}
//******************************************************************
// Public CMLayerGeoJSON functions
//******************************************************************

/**
* Add a new point to the GeoJSON data
*/
CMLayerGeoJSON.prototype.AddPoint=function(X,Y)
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

