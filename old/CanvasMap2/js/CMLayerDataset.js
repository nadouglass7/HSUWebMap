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
CMLayer.prototype.CMItem_SetParent=CMItem.prototype.SetParent;

CMLayer.prototype.SetParent=function(NewParent)
{
	this.CMItem_SetParent(NewParent);
	
	if (this.TheDataset!=null) this.TheDataset.SetParent(this.GetParent(CMScene));
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

CMLayerDataset.prototype.CMLayer_UpdateSettingsFromAttributes=CMLayerDataset.prototype.UpdateSettingsFromAttributes;

CMLayerDataset.prototype.UpdateSettingsFromAttributes=function()
{
	this.CMLayer_UpdateSettingsFromAttributes();
	
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