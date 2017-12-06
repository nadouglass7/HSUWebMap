//******************************************************************
// CMLayerDataset Class
//******************************************************************

//******************************************************************
// Global Variables
//******************************************************************

//******************************************************************
// CMLayerDataset Constructor
//******************************************************************
function CMLayerDataset() 
{
	CMLayer.call(this);
	this.TheDataset=null; // default
}
CMLayerDataset.prototype=Object.create(CMLayer.prototype); // inherit prototype functions from PanelBase()

CMLayerDataset.prototype.contructor=CMLayerDataset; // override the constructor to go to ours

//**************************************************************
// CMItem Functions
//**************************************************************
CMLayerDataset.prototype.CMLayer_SetParent=CMLayer.prototype.SetParent;

CMLayerDataset.prototype.SetParent=function(NewParent)
{
	this.CMLayer_SetParent(NewParent);
	
	if (this.TheDataset!=null) this.TheDataset.SetParent(this.GetParent(CMScene));
}

/**
* Unselects all features in the layer.  
* @public
*/
CMLayerDataset.prototype.CMLayer_UnselectAll=CMLayer.prototype.UnselectAll;

CMLayerDataset.prototype.UnselectAll=function(SendMessageFlag) 
{
	this.CMLayer_UnselectAll(SendMessageFlag);
	
	if ((this.TheDataset!=null)&&(this.TheDataset.GetSelectedFeature()!=-1)) // something is selected
	{ 
//		this.SelectedFeatureIndex=-1;
		this.TheDataset.SetSelectedFeature(-1);
		
		if (SendMessageFlag) // call the scene to let everyone know the selection changed
		{
			// call the scene to let everyone know the selection changed
			var TheScene=this.GetParent(CMScene);
			TheScene.SelectionChanged(this);
		}
	}
}
//**************************************************************
// CMItem Functions for painting
//**************************************************************

/*
* Paints a layer into the canvas.  This function is provided for 
* subclasses to override.  The code below shows the sequence of steps
* a layer class should take to paint itself into the canvas.
* @override
* @param TheView - the view to paint into.
*/
CMLayerDataset.prototype.Paint=function(TheView) 
{
	if ((this.IsVisible())&&(this.TheDataset!=null))
	{
		var TheStyle=this.GetStyle(TheView);
		
		if (TheStyle!==null) { TheView.SetStyle(TheStyle); }
		
		this.TheDataset.Paint(this,TheView,false);
		
		if (TheStyle!==null) { TheView.RestoreStyle(); }
	}
}
/**
* Just paint the selected features.  This is called after all the other features have
* been painted to paint the selected features on top
* @override
* @param TheView - the view to paint into.
*/
CMLayerDataset.prototype.PaintSelected=function(TheView) 
{
	if ((this.IsVisible())&&(this.TheDataset!=null))
	{
		// paint mouse over
		
		var TheStyle=this.GetStyle(TheView,undefined,"MouseOverStyle");
		
		if (CMUtilities.IsDefined(TheStyle)) 
		{ 
			TheView.SetStyle(TheStyle);
		
			this.TheDataset.Paint(this,TheView,false,true);
		
			TheView.RestoreStyle();
		}
		// paint the selected features
		var TheStyle=this.GetStyle(TheView,undefined,"SelectedStyle");
		
		if (CMUtilities.IsDefined(TheStyle)) 
		{ 
			TheView.SetStyle(TheStyle);
		
			this.TheDataset.Paint(this,TheView,true);
		
			TheView.RestoreStyle(); 
		}
	}
}
//**************************************************************
// CMLayer Functions
//**************************************************************
/**
* Check if the feature is visible in the view.
* This should be called by subclasses but can also be called to limit a layer's bounds after loading.
* @public
* @param NewBounds - Object for Bounds with format {XMin,XMax,YMin,YMax}
*/
CMLayerDataset.prototype.SetBounds=function(NewBounds) 
{
	if (this.GetDataset()!=undefined) 
	{
		this.GetDataset().SetBounds(NewBounds);
	
		var TheScene=this.GetParent(CMScene);
		TheScene.SetBoundsDirty();
	}
}
/**
* Returns the bounds of the data within the layer.  Computed after loading the data.
* @public
* @returns Bounds - with format {XMin,XMax,YMin,YMax}
*/
CMLayerDataset.prototype.GetBounds=function() 
{
	var TheBounds=undefined;
	
	if (this.GetDataset()!=undefined) 
	{
		TheBounds=this.GetDataset().GetBounds();
	}
	return(TheBounds);
}

CMLayerDataset.prototype.CMLayer_SettingsChanged=CMLayerDataset.prototype.SettingsChanged;

CMLayerDataset.prototype.SettingsChanged=function()
{
	this.CMLayer_SettingsChanged();
	
	if (this.SettingsDirty)
	{
		// setup any properties that were set by attributes
		if (this.SettingsAttributes!=null)
		{
			var TheDataset=this.GetDataset();
			
			// go through all the properties that come from attributes
			for (var SettingsGroupKey in this.SettingsAttributes)
			{
				var SettingsGroup=this.SettingsAttributes[SettingsGroupKey];
				
				for (var SettingsKey in SettingsGroup)
				{
					var AttributeName=SettingsGroup[SettingsKey];
					
					// update the attributes
					for (var j=0;j<TheDataset.GetNumAttributeRows();j++)
					{
						var Value=TheDataset.GetAttributeCellByHeading(AttributeName,j);
						
						if ((Value!==undefined)&&(Value!==""))
						{
							if ((SettingsGroupKey=="IconImage")&&(SettingsKey=="URL"))
							{
								var TheImage;  //=JSON.parse(Value); // image object with the URL
								TheImage=new Image(); 
								TheImage.Loaded=false;
								TheImage.TheLayer=this;
								
								TheImage.onload=function() 
								{ 
									this.Loaded=true;
		
									this.TheLayer.Repaint(); 
								};
								TheImage.src=Value; 
							}
							else if ((SettingsGroupKey=="Mark")&&(SettingsKey=="Type"))
							{
								if (Value==="MARK_CIRCLE") Value=CMLayer.MARK_CIRCLE;
								if (Value==="MARK_TRIANGLE") Value=CMLayer.MARK_TRIANGLE;
								if (Value==="MARK_SQUARE") Value=CMLayer.MARK_SQUARE;
								if (Value==="MARK_STAR") Value=CMLayer.MARK_STAR;
							}
							else if ((SettingsGroupKey=="Mark")&&(SettingsKey=="Size"))
							{
								Value=parseInt(Value);
							}
							else // all others are HTML 5 Canvas Styles
							{
								Value=Value;
							}
							this.SetFeatureSetting(SettingsGroupKey,SettingsKey,j,Value);
						}
					}
				}
			}
			this.Repaint();
			this.SettingsDirty=false;
		}
	}
}
//CMLayerDataset.prototype.CMLayer_SetProjector=CMLayer.prototype.SetProjector;

CMLayerDataset.prototype.SetProjector=function(NewProjector)
{
//	this.CMLayer_SetProjector(NewProjector);
	
	if (this.TheDataset!=null) 
	{
		this.TheDataset.SetProjector(NewProjector); // jjg temp kludge
	}
}
//**************************************************************
// CMLayer functions for features
//**************************************************************

/**
* Sets the feature that is selected
* @public
* @param NewFeatureIndex - >=0 indicates a feature, -1 is for none.
*/
CMLayerDataset.prototype.SetSelectedFeature=function(New) 
{
	if ((this.TheDataset!=null)&&(New!=this.TheDataset.GetSelectedFeature()))
	{
		this.TheDataset.SetSelectedFeature(New); // sends message
		
		// call the scene to let everyone know the selection changed
		var TheScene=this.GetParent(CMScene);
		
		TheScene.SelectionChanged(this);
	}
}
/**
* Sets the current feature that the mouse is over
* @public
* @param NewFeatureIndex - index to the feature the mouse is over (typcially returned by In())
*/
CMLayerDataset.prototype.SetMouseOverFeature=function(New) 
{
	if ((this.TheDataset!=null)&&(this.TheDataset.GetMouseOverFeature()!=New)) // something is selected
	{ 
		this.TheDataset.SetMouseOverFeature(New);
	}
}
/**
* Returns the current feature that the mouse is over
* @public
* @returns FeatureIndex - index to the feature the mouse is over (typcially returned by In()), or -1 for none
*/
CMLayerDataset.prototype.ResetMouseOverFeature=function() 
{
	if ((this.TheDataset!=null)&&(this.TheDataset.GetMouseOverFeature()!=-1)) // something is selected
	{ 
		this.TheDataset.SetMouseOverFeature(-1);
	}
}
//**************************************************************
// CMLayer functions for feature interaction
//**************************************************************

CMLayerDataset.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
	if (this.TheDataset!=null)
	{
		var NumFeatures=this.TheDataset.GetNumFeatures();
		
		for (var i=0;(i<NumFeatures)&&(FeatureIndex==-1);i++)
		{
			if (this.TheDataset.InFeature(TheView,RefX,RefY,i)) // coordinate is in the feature
			{
				// make sure the feature is visible in the layer
				if (this.IsFeatureVisible(i)) FeatureIndex=i;
			}
		}
	}
	return(FeatureIndex);
};
//******************************************************************
// CMLayer Search Functions
//******************************************************************

CMLayerDataset.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
	if (this.TheDataset!=null)
	{
		this.TheDataset.GetSearchResults(SearchPhrase,ResultsPanel);
	}
}
/*
* returns the icon for the layer list
* @override
* @protected
* @returns - an element that can be placed next to the layer in the layer list (should be 16x16)
*/
CMLayerDataset.prototype.CMLayer_GetIcon=CMLayer.prototype.GetIcon;

CMLayerDataset.prototype.GetIcon=function()
{
	var TheIcon=this.CMLayer_GetIcon();
	
	if (this.TheDataset!=null)
	{
		TheIcon=this.TheDataset.GetIcon(this,TheIcon);
	}
	return(TheIcon);
}

//**************************************************************
// CMLayerDataset functions for managing the dataset
//**************************************************************

/*
* Called to obtain the data for the layer from a URL.
*
* TheView is required so the layer can be repainted when data is received. 
* @override, @public
* @param URL - the URL to use to obtain data
* @param NewView - the view for the scene 
*/
CMLayerDataset.prototype.SetURL=function(URL,ZoomToBounds,DataSetType,TheProjector) 
{
	var TheScene=this.GetParent(CMScene);
	
	// create the new data set or get an existing one
	this.TheDataset=CMDataset.GetDataObject(URL,DataSetType);
	this.TheDataset.SetParent(TheScene); 
	
	// Call the layer's OnLoad() function when the dataset loads the data
	this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_LOADED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		ThisLayer.OnLoad();
		ThisLayer.GetScene().LayerListChanged(); // jjg - a bit of a hack to get the layer list to repaint once we have the data (i.e. can determine if the GeoJSON data is string).
	});
	// Make sure the scene is repained when the selection changes
	this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_SELECTION_CHANGED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		ThisLayer.GetScene().Repaint();
	});
	
	// Make sure the scene is repained when the mouse over changes
	this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_MOUSE_OVER_FEATURE_CHANGED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		ThisLayer.GetScene().Repaint();
	});
	
	// add a projector if one is provided
	if (TheProjector!=undefined) this.TheDataset.SetProjector(TheProjector);
	
	this.TheDataset.SetURL(URL,ZoomToBounds);
}
/*
* Set the vector data from a GeoJSON object
* @public
*/
CMLayerDataset.prototype.SetData=function(TheData,ZoomToBounds,DataSetType,TheProjector) 
{
	var TheScene=this.GetParent(CMScene);
	
	// create the new data set or get an existing one
	this.TheDataset=CMDataset.GetDataObject(URL,DataSetType);
	this.TheDataset.SetParent(TheScene); 
	
	// link this layer to the data set
	this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_LOADED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		ThisLayer.OnLoad();
	});
	
	// add a projector if one is provided
	if (TheProjector!=undefined) this.TheDataset.SetProjector(TheProjector);
	
	this.TheDataset.SetData(TheData);
};
/*
* gets the dataset from this object
* @public
*/
CMLayerDataset.prototype.GetDataset=function() 
{
	return(this.TheDataset);
};/*
* sets the dataset from this object
* @public
*/
CMLayerDataset.prototype.SetDataset=function(NewDataset) 
{
	this.TheDataset=NewDataset;
};

//******************************************************************
// Public CMLayerDataset functions
//******************************************************************

/**
* Add a new point to the GeoJSON data
*/
CMLayerDataset.prototype.AddPoint=function(X,Y)
{
	if (this.TheDataset!=null)
	{
		this.TheDataset.AddPoint(X,Y);
	}
	else
	{
		alert("Sorry, a dataset must be set before we can add points to a layer");
	}
}
