//******************************************************************
// CMDatasetSQL Class
// This is a test class for a database layer based on SQL.
//******************************************************************

//******************************************************************
// Global Variables
//******************************************************************

//******************************************************************
// CMDatasetSQL Constructor
//******************************************************************
function CMDatasetSQL() 
{
	CMDataset.call(this);
	this.TheData=null;
	this.TheBounds;
	
	this.LatitudeIndex=0;
	this.LongitudeIndex=1;
	this.AttributeHeadings;
	
	//this.FeatureBounds is added when data is loaded
}
CMDatasetSQL.prototype=Object.create(CMDatasetGeoJSON.prototype); // inherit prototype functions 

CMDatasetSQL.prototype.contructor=CMDatasetSQL; // override the constructor to go to ours

//**************************************************************
// Prviate functions
//**************************************************************
CMDatasetSQL.prototype.FindBounds=function(TheData)
{
	var TheBounds={};
	
	if ((TheData!=null)&&(TheData.length>0))
	{
		var Latitude=TheData[0][this.LatitudeIndex];
		var Longitude=TheData[0][this.LongitudeIndex];

		TheBounds.XMin=Longitude;
		TheBounds.XMax=Longitude;
		TheBounds.YMin=Latitude;
		TheBounds.YMax=Latitude;
		
		// Loop through each feature
		for (var i=1; i < TheData.length; i++) // loop through the rows
		{
			var Latitude=TheData[i][this.LatitudeIndex];
			var Longitude=TheData[i][this.LongitudeIndex];
			
			// Update the TheBounds recursively by comparing the current
			// xMin/xMax and yMin/yMax with the coordinate 
			// we're currently checking
			if (TheBounds.XMin > Longitude) TheBounds.XMin = Longitude;
			if (TheBounds.XMax < Longitude) TheBounds.XMax = Longitude;
			if (TheBounds.YMin > Latitude) TheBounds.YMin = Latitude;
			if (TheBounds.YMax < Latitude) TheBounds.YMax = Latitude;
		}
	}
	return(TheBounds);
}
//**************************************************************
// Public functions
//**************************************************************
CMDatasetSQL.prototype.GetResponse=function(Query,TheFunction)
{
	var Request="";
	
	for (var Key in Query)
	{
		if (Request=="") Request+="?";
		else Request+="&";
		
		Request+=Key+"="+Query[Key];
	}
	var URL="/cwis438/webservices/MMSN/DatabaseQuery_Array.py";
	
	var Request=URL+Request;
	Request=encodeURI(Request);

	//
	var TheRequest = new XMLHttpRequest();
	TheRequest.TheFunction=TheFunction;
	TheRequest.TheDataset=this;
	TheRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			//document.getElementById("demo").innerHTML =
			var TheResponse=this.responseText;

			var index=TheResponse.indexOf("{");
			
			var TheJSON=TheResponse.substr(index);
			var TheResult=JSON.parse(TheJSON);
			
			var TheError=TheResult.Error;
			this.TheDataset.TheData=TheResult.Result;
			
			if (this.TheFunction!=null) this.TheFunction(TheResult2,TheError,TheResponse);
			
			this.TheDataset.TheBounds=this.TheDataset.FindBounds(TheResult.Result);
		}
	};
	TheRequest.open("GET", Request, true);
	TheRequest.send();
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
CMDatasetSQL.prototype.SetBounds=function(NewBounds) 
{
	this.TheBounds=NewBounds;
}
/**
* Returns the bounds of the data within the layer.  Computed after loading the data.
* @public
* @returns Bounds - with format {XMin,XMax,YMin,YMax}
*/
CMDatasetSQL.prototype.GetBounds=function() 
{
	return(this.TheBounds);
}
CMDatasetSQL.prototype.GetFeatureBounds=function(FeatgureIndex) 
{
	var Latitude=this.TheData[FeatgureIndex][this.LatitudeIndex];
	var Longitude=this.TheData[FeatgureIndex][this.LongitudeIndex];

	var TheBounds={};
	TheBounds.XMin=Longitude;
	TheBounds.XMax=Longitude;
	TheBounds.YMin=Latitude;
	TheBounds.YMax=Latitude;
	return(TheBounds);
}

//**************************************************************
// CMDataset Functions for attributes
//**************************************************************
CMDatasetSQL.prototype.GetNumAttributeRows=function() 
{ 
	var Result=0;
	if (this.TheData!=null)
	{
		Result=this.TheData.length;
	}
	return(Result); 
}
CMDatasetSQL.prototype.GetNumAttributeColumns=function() 
{ 
	var Result=0;
	if (this.TheData!=null)
	{
		var Properties=this.TheData[0].length;
	}
	return(Result); 
}
CMDatasetSQL.prototype.GetAttributeHeading=function(ColumnIndex) 
{ 
	var Result="";
	if (this.AttributeHeadings!=null)
	{
		Result=this.AttributeHeadings[ColumnIndex];
	}
	return(Result); 
}
CMDatasetSQL.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		var Properties=this.TheData[RowIndex][ColumnIndex];
	}
	return(Result); 
}
CMDatasetSQL.prototype.AddAttributeHeading=function(NewHeading,DefaultValue) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		alert("not implemented");
	}
	return(Result); 
}

CMDatasetSQL.prototype.GetAttributeCellByHeading=function(Heading,RowIndex) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		var Index=-1;
		for (var i=0;i<this.AttributeHeadings.length;i++)
		{
			if (this.AttributeHeadings[i]==Heading) Index=i;
		}
	}
	return(Result); 
}
CMDatasetSQL.prototype.SetAttributeCell=function(ColumnIndex,RowIndex,Value) 
{ "use strict";
	var Result="";
	if (this.TheData!==null)
	{
		this.TheData[RowIndex][ColumnIndex]=Value;
	}
	return(Result); 
};
CMDatasetSQL.prototype.SetAttributeCellByHeading=function(Heading,RowIndex,Value) 
{ 
	var Result="";
	if (this.TheData!=null)
	{
		var Index=-1;
		for (var i=0;i<this.AttributeHeadings.length;i++)
		{
			if (this.AttributeHeadings[i]==Heading) Index=i;
		}
		this.TheData[RowIndex][Index]=Value;
	}
};

//**************************************************************
// Functions specifically for vector data
//**************************************************************

/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
*/
CMDatasetSQL.prototype.SetURL=function(URL,ZoomToBounds) 
{
	alert("Use Setresponse() instead of SetURL with SQL Layers");
/*	this.URL=URL;
	
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
*/};
/*
* Set the vector data from a GeoJSON object
*/
CMDatasetSQL.prototype.SetData=function(TheData) 
{
	this.TheData=TheData; // this is makeing rendering break!
	
	var TheBounds=this.FindBounds(TheData);
	
	this.SetBounds(TheBounds);
};

//******************************************************************
// CMLayer Mouse event handling
//******************************************************************
/*
* returns the feature index for the coordinate in projected space
* returns -1 if the coordinate is not in a feature
*/
CMDatasetSQL.prototype.GetNumFeatures=function() 
{
	var Result=0;
	if ((this.TheData!=null)) Result=this.TheData.length;
	return(Result);
}
CMDatasetSQL.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
	if ((this.TheData!=null)) 
	{
		var Tolerance=TheView.GetRefWidthFromPixelWidth(this.ClickTolerance);
		
		// Loop over the features
		for (var i=0;( i < this.TheData.length)&&(FeatureIndex==-1); i++) 
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
CMDatasetSQL.prototype.InFeature=function(TheView,RefX,RefY,FeatureIndex) 
{
	var Result=false;
	
	if (this.TheData!=null) 
	{
		var Tolerance=TheView.GetRefWidthFromPixelWidth(this.ClickTolerance);
		
		var TheFeature=this.TheData[FeatureIndex];
		
		var Result=false;
		if (this.LatitudeIndex>=0)
		{
			var Latitude=TheFeature[this.LatitudeIndex];
			var Longitude=TheFeature[this.LatitudeIndex];
			
			if ((Math.abs(Longitude-RefX)<=Tolerance)&&(Math.abs(Latitude-RefY)<=Tolerance))
			{
				Result=true;
			}
		}
/*		else if (TheGeometry.type=="LineString")
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
*/	}
	return(Result);
};


//******************************************************************
// CMDatasetSQL Painting Functions
//******************************************************************
/*
* Paints a layer into the canvas
* This is a little complicated because the geometries can contain
* polylines, polygons or points. 
*/
CMDatasetSQL.prototype.Paint=function(TheLayer,TheView,SelectedOnly,MouseOverOnly) 
{
	if ((TheView instanceof CMView2D)&&(this.TheData!=null)) //(this.GetVisible())&&
	{
		if (MouseOverOnly==undefined) MouseOverOnly=false;
		
		this.GetParent(CMMainContainer).AddToDebugPanel(this.GetName()+" Starting Paint:"+CMUtilities.GetSeconds());
		
		var ViewBounds=TheView.GetExtent();
			
		// draw each feature
		for (var FeatureIndex=0; FeatureIndex < this.TheData.length; FeatureIndex++) 
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
					var TheRow=this.TheData[FeatureIndex];
					
					// setup the fill color
					
					if (this.LatitudeIndex>=0) // points
					{
						var Latitude=TheRow[this.LatitudeIndex];
						var Longitude=TheRow[this.LongitudeIndex];
						
						TheLayer.PaintPoint(TheView,FeatureIndex,Longitude,Latitude,SelectedOnly);
					}
					else // draw a polyline or polygon
					{
						alert("Polys not yet implemented");
//						var TheGeometry=TheFeatures[FeatureIndex].geometry;
						
//						this.PaintRefGeometry(TheLayer,TheView,FeatureIndex,TheGeometry,SelectedOnly);
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
not tested
*/
CMDatasetSQL.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
//	var TheText="";
	
	if ((this.TheData!=null)) //(this.GetVisible())&&
	{
		// Get the features from the data
		var TheRows=this.TheData;
	
		// draw each feature
		for (var i=0; i < TheRows.length; i++) 
		{
			var TheRow=TheFeatures[i];
			
			for (var j=0;j<TheRow.length;j++)
			{
				var TheProperty=Properties[j]; // 
				
				var Found=false;
				
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


//******************************************************************
// Public CMDatasetSQL functions
//******************************************************************

//******************************************************************
// Public CMDatasetSQL functions
//******************************************************************
CMDatasetSQL.prototype.SetLatitudeIndex=function(NewIndex)
{
	this.LatitudeIndex=NewIndex;
}

CMDatasetSQL.prototype.SetLongitudeIndex=function(NewIndex)
{
	this.LongitudeIndex=NewIndex;
}

CMDatasetSQL.prototype.SetAttributeHeadings=function(NewAttributeHeadings)
{
	this.AttributeHeadings=NewAttributeHeadings;
}

