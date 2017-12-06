//******************************************************************
// CMDataset Class
// This is effecitvely an abstract class that provides an API between
// the layer class and the data that may be shared between muliptle layers.
// The data typically contains individual spatial features with attributes.
//******************************************************************

//******************************************************************
// Global Definitions
//******************************************************************
/**
* Types of data sets. These will load different Dataset handlers.
*
* @public, @enum
*/
CMDataset.GEOJSON=1;
CMDataset.PYRAMID=2;
CMDataset.PYRAMID_OPEN_FORMAT=3;
CMDataset.RASTER=4;
CMDataset.SQL=5;

/**
* Types of data sets
* @protected
*/
CMDataset.MESSAGE_DATASET_LOADED=CMBase.GetUniqueNumber();
CMDataset.MESSAGE_DATASET_SELECTION_CHANGED=CMBase.GetUniqueNumber();
CMDataset.MESSAGE_DATASET_MOUSE_OVER_FEATURE_CHANGED=CMBase.GetUniqueNumber();

/**
* Status of requests to obtain data
*
* @protected, @enum
*/
CMDataset.LOAD_STATUS_NONE=1; // have not started a load yet
CMDataset.LOAD_STATUS_LOADING=2; // waiting for element to load
CMDataset.LOAD_STATUS_LOADED=3; // element had loaded and is ready to go
CMDataset.LOAD_STATUS_PENDING=4; // element is waiting in the que
CMDataset.LOAD_STATUS_CANCELED=5; // request was canceled, probably from the user changing the zoom level

/**
* Types of requrests
*
* @protected, @enum
*/
CMDataset.REQUEST_TYPE_IMAGE=1; // img element with a "src" attribute
CMDataset.REQUEST_TYPE_TEXT=2; // traditional REST request

//******************************************************************
// CMDataset Constructor
//******************************************************************
/*
* The que that stores the requests that are waiting to be requested.
* The que does not contain the CurrentRequest.  The que is a first in
* first out (FIFO) que.  
* @private
*/
CMDataset.RequestQue=[];
/*
* The current request that is being processed and then the one CMDataset is 
* waiting on to load.  The CurrentRequest is not in the que.
* @private
*/
CMDataset.CurrentRequest=null;

/*
* Called by the layers to make a request to obtain data.  Adds the request to the 
* que and executes it when all other requests are completed.  If successful,
* TheFunction() is called with TheRequest as the "this" object.
*
* @protected
* @param TheRequest - an HTML request object with the following fields:
*  		LoadStatus:CMDataset.LOAD_STATUS_NONE,
*		Type:CMDataset.REQUEST_TYPE_IMAGE,
*		TheImage:this.TheRaster,
*		src:ThePath,
*		TheFunction:function()
*		{ 
*			this.TheTile.TheDataset.GetParent(CMScene).Repaint();  // global
*		}
*/
CMDataset.MakeRequest=function(TheRequest)
{
	// add the request to itself so the function below can access it
	TheRequest.TheImage.TheRequest=TheRequest;
	
	// create the online function for this request
	TheRequest.TheImage.onload=function()
	{ 
		// set the status to loaded so the tile can be drawn
		this.TheRequest.LoadStatus=CMDataset.LOAD_STATUS_LOADED;
		
		// if there is another request in the que, make it now
		if (CMDataset.RequestQue.length>0)
		{
			CMDataset.CurrentRequest=CMDataset.RequestQue[0]; // get the request
			CMDataset.RequestQue.shift(); // remove the request from the que
			CMDataset.CurrentRequest.LoadStatus=CMDataset.LOAD_STATUS_LOADING; // was pending, about to be loading
			CMDataset.CurrentRequest.TheImage.src=CMDataset.CurrentRequest.src; // start the request
		}
		else // otherwise, reset the current request (all requests completed)
		{
			CMDataset.CurrentRequest=null;
		}
		// call the specified function (typically does a repaint)
		this.TheRequest.TheFunction();
	}
	
	// if this is the only request, start it now
	if (CMDataset.CurrentRequest==null)
	{
		CMDataset.CurrentRequest=TheRequest;
		TheRequest.LoadStatus=CMDataset.LOAD_STATUS_LOADING;
		TheRequest.TheImage.src=TheRequest.src;
	}
	else // otherwise, setup the request to be processed when the next request is loaded
	{
		TheRequest.LoadStatus=CMDataset.LOAD_STATUS_PENDING;
		CMDataset.RequestQue.push(TheRequest);
	}
}
/*
* Called by the scene when the zoom level is changed to reset the current
* requests for tiles.
* @protected
*/
CMDataset.ResetRequests=function()
{
	var CurrentRequests=CMDataset.RequestQue; // get the current requests
	
	CMDataset.RequestQue=[]; // reset the array of requests
	
	for (var i=0;i<CurrentRequests.length;i++)
	{
		var TheRequest=CurrentRequests[i];
		
		CurrentRequests[i]=null; // free up the array entry
		
		TheRequest.LoadStatus=CMDataset.LOAD_STATUS_CANCELED;
	}
}
//******************************************************************
// CMDataset Constructor
//******************************************************************
/*
* Constructor
* @projected - typically only called by Layer objects.
*/
function CMDataset() 
{
	CMBase.call(this);
	this.URL=null;
	
	this.SelectedFeature=-1;
	this.MouseOverFeatureIndex=-1; // array of flags for rows?
	this.ClickTolerance=8;
}
CMDataset.prototype=Object.create(CMBase.prototype); // inherit prototype functions from PanelBase()

CMDataset.prototype.contructor=CMDataset; // override the constructor to go to ours

//**************************************************************
// Functions for attributes
//**************************************************************
/**
* Returns the number of rows of attributes in the current dataset
* @override
* @public
* @returns - Number of rows or 0 if no data loaded
*/
CMDataset.prototype.GetNumAttributeRows=function() 
{ 
	return(0); 
}
/**
* Returns the number of columns of attributes in the current dataset
* @override
* @public
* @returns - Number of columns or 0 if no data loaded
*/
CMDataset.prototype.GetNumAttributeColumns=function() 
{ 
	return(0); 
}
/**
* Returns the a heading for a specified column
* @override
* @public
* @returns - Specified column heading or "" if no data loaded.
*/
CMDataset.prototype.GetAttributeHeading=function(ColumnIndex) 
{ 
	return(""); 
}
/**
* Gets the contents of an attribute cell (row and column)
* @override
* @public
* @param ColumnIndex
* @param RowIndex
* @returns - Specified value or "" if no data loaded.
*/
CMDataset.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) 
{ 
	return(""); 
}
/**
* Inserts a new column into the dataset with the specified heading and
* sets all values ni the column to the specified DefaultValue
* @override
* @public
* @param NewHeading
* @param DefaultValue
*/
CMDataset.prototype.AddAttributeHeading=function(NewHeading,DefaultValue) 
{ 
}

/**
* Gets the contents of an attribute cell by using a column Heading and RowIndex
* @override
* @public
* @param Heading
* @param RowIndex
* @returns - Specified value or "" if no data loaded.
*/
CMDataset.prototype.GetAttributeCellByHeading=function(Heading,RowIndex) 
{ 
	return(""); 
}
/**
* Sets the value of a cell in an attribute table using a row and column index.
* @override
* @public
* @param ColumnIndex
* @param RowIndex
* @param Value
*/
CMDataset.prototype.SetAttributeCell=function(ColumnIndex,RowIndex,Value) 
{ "use strict";
};
/**
* Sets the value of a cell in an attribute table using a row and column heading.
* @override
* @public
* @param Heading
* @param RowIndex
* @param Value
*/
CMDataset.prototype.SetAttributeCellByHeading=function(Heading,RowIndex,Value) 
{ 
};
/**
* Helper function to return an entire array for an attribute
* @override
* @public
* @param Heading - the atribute/column heading to get the array from
*/
CMDataset.prototype.GetAttributeArrayByHeading=function(Heading) 
{ 
	var NumAttributeRows=this.GetNumAttributeRows();
	
	var Result=[];
	for (var i=0;i<NumAttributeRows;i++) 
	{
		Result[i]=this.GetAttributeCellByHeading(Heading,i);
	}
	return(Result); 
}
//**************************************************************
// Functions for Projectors
//**************************************************************
/**
* Sets up a projector for layer data to be projected on loading the data.
* @public
* @param NewProjector - an STProjector object to project layer data after it is loaded.
*/
CMDataset.prototype.SetProjector=function(NewProjector)
{
	this.TheProjector=NewProjector;
}
/**
* Gets the current projector used to project data on load.
* @public
* @returns - Current projector or null.
*/
CMDataset.prototype.GetProjector=function()
{
	return(this.TheProjector);
}

//**************************************************************
// Functions specifically for setting up data sets
//**************************************************************

/*
* Called to obtain the data for the layer from a URL.
* This is the base call and is typically overriden by subclasses.
* @protected, @override
* @param URL - URL to use to request data
* @param ZoomToBounds - true to have the current view zoom to the bounds of the data when received.
*/
CMDataset.prototype.SetURL=function(URL,ZoomToBounds) 
{
	alert("TCMDataset.SetURL() should be overriden in a subclass");
	
/*	var TheRequest=new XMLHttpRequest(); // wait staff at the resturant
	TheRequest.open("GET",URL,true); // the URL is what we ordered
	TheRequest.TheURL=URL;
	TheRequest.TheDataset=this;
	TheRequest.ZoomToBounds=ZoomToBounds;
			
	TheRequest.onreadystatechange=function() 
	{
		//alert("onreadystatechange"+this.readyState);
		if( this.readyState == 4)  // done
		{
			if( this.status == 200) // OK
			{
				var TheText=TheRequest.responseText;

				var TheGeoJSONObject=JSON.parse(TheText);
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
	*/
};
/*
* Set the vector data from a GeoJSON object directly.
* @protected
* @override
* @param TheData - The GeoJSON object
*/
CMDataset.prototype.SetData=function(TheData) 
{
	this.TheData=TheData;
};

//******************************************************************
// CMData Mouse event handling
//******************************************************************
/**
* Returns the number of features in the dataset.
* @protected
* @returns - The number of features in the dataset, 0 for raster data sets
*/
CMDataset.prototype.GetNumFeatures=function() 
{
	return(0);
}
/**
* Checks if the specified coordinate is in the specified feature
* jjg - should we pass in the ClickTolerance?
* @protected
* @param TheView - the view that the RefX and RefY are in (used to determine click tolerances)
* @param RefX - X coordinate value for the point to test
* @param RefY - Y coordinate value for the point to test
* @param FeatureIndex - Index of the features to test
*/
CMDataset.prototype.InFeature=function(TheView,RefX,RefY,FeatureIndex) 
{
	return(false);
}
/**
* Checks if the specified coordintate is in a feature.
* jjg - should we pass in the ClickTolerance?
* @protected
* @param TheView - the view that the RefX and RefY are in (used to determine click tolerances)
* @param RefX - X coordinate value for the point to test
* @param RefY - Y coordinate value for the point to test
*/
CMDataset.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	return(FeatureIndex);
};
/*
* Paints a dataset into the specified view
* @protected. @override
* @param TheLayer - The layer that contains the data to be painted.
* @param TheView - View to paint the data into
* @param SelectedOnly - true to just paint the selected data otherwise all data will be painted.
*/
CMDataset.prototype.Paint=function(TheLayer,TheView,SelectedOnly) 
{
};


//******************************************************************
// CMData Searching Functions
//******************************************************************

/*
* Requests search results from a layer.  
* @protected - typically called by the layer
*/
CMDataset.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{

}
/**
* Called by parent layer to get an icon that may be specific to this type of layer
* @protected - typically called by the layer
*/
CMDataset.prototype.GetIcon=function(TheLayer,Default) 
{
	return(Default);
}
/**
* Sets the selected feature based on its index.
* @protected - typically called by the layer
* @param NewSelectedFeatureIndex - Index to the feature that is now to be selected.
*/
CMDataset.prototype.SetSelectedFeature=function(NewSelectedFeatureIndex) 
{
	if (this.SelectedFeature!=NewSelectedFeatureIndex)
	{
		this.SelectedFeature=NewSelectedFeatureIndex;
		this.SendMessageToListeners(CMDataset.MESSAGE_DATASET_SELECTION_CHANGED);
	}
}
/**
*
*/
CMDataset.prototype.GetSelectedFeature=function() 
{
	return(this.SelectedFeature);
}
/**
* Sets the selected feature based on its index.
* @protected - typically called by the layer
* @param NewSelectedFeatureIndex - Index to the feature that is now to be selected.
*/
CMDataset.prototype.SetMouseOverFeature=function(NewMouseOverFeatureIndex) 
{
	if (this.MouseOverFeatureIndex!=NewMouseOverFeatureIndex)
	{
		this.MouseOverFeatureIndex=NewMouseOverFeatureIndex;
		this.SendMessageToListeners(CMDataset.MESSAGE_DATASET_MOUSE_OVER_FEATURE_CHANGED);
	}
}
/**
*
*/
CMDataset.prototype.GetMouseOverFeature=function() 
{
	return(this.MouseOverFeatureIndex);
}


//******************************************************************
// Public CMDataset functions
//******************************************************************

/**
* Add a new point to the GeoJSON data
*/
CMDataset.prototype.AddPoint=function(X,Y)
{
}

//******************************************************************
// CMData static Functions
//******************************************************************
/*
* This is the one static array that contains all the data sets used in the current
* instance of CanvasMap.  This allows maps to share data reducing memory and network
* overhead.
* @private
*/
CMDataset.TheDataSets=[];

/*
* Returns an appropriate data object for the request.  called by CMLayerDataset to
* obtain a new or existing dataset.
* @protected, @static
* @param URL - URL to the data to load into the dataset
* @param DataSetType - Type of data from the CMDataset types.
*/
CMDataset.GetDataObject=function(URL,DataSetType) 
{
	var TheDataSet=null;
	
	// look for the data set in the existing data sets
	for (var i=0;i<CMDataset.TheDataSets.length;i++)
	{
		if (CMDataset.TheDataSets[i].URL==URL) TheDataSet=CMDataset.TheDataSets[i];
	}
	// if the data set was not found, create a new one
	if (TheDataSet==null) // did not find the dataset
	{
		switch (DataSetType)
		{
		case CMDataset.GEOJSON:
		case undefined:
			TheDataSet=new CMDatasetGeoJSON();
			break;
		case CMDataset.PYRAMID:
			TheDataSet=new CMDatasetPyramid();
			break;
		case CMDataset.PYRAMID_OPEN_FORMAT:
			TheDataSet=new CMDatasetPyramidOpenFormat();
			break;
		case CMDataset.RASTER:
			alert("Sorry, CMDataset.RASTER is not yet supported");
			break;
		case CMDataset.SQL:
			TheDataSet=new CMDatasetSQL();
			break;
		}
//		TheDataSet.SetParent(this);
		
		CMDataset.TheDataSets.push(TheDataSet);
	}
	return(TheDataSet);
}
