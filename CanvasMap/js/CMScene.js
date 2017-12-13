/******************************************************************************************************************
* CMScene
* Contains a list of layers and a list of background layers.
* Also has a background style that will be drawn if set.
*
* @module CMScene
******************************************************************************************************************/
//******************************************************************
// Global definitions
//******************************************************************
/**
* Message definitions
*/
CMScene.MESSAGE_LAYER_LIST_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_LAYER_CONTENT_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_LAYER_SETTINGS_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_BACKGROUNDS_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_TIME_SLICES_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_TIME_RANGE_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_SELECTION_CHANGED=CMBase.GetUniqueNumber();

/**
* Below are the settings definitions.
* @public, @settings
*/
CMScene.SettingDefintions=
{
	Fill:
	{
		fillStyle: { Name:"Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
	}
};

//******************************************************************
// CMScene Class
//******************************************************************
/*4
* Constructor for the CMScene class
* @public, @constructs
*/
function CMScene(TheCanvasMap) 
{
	CMItem.call(this);

	this.SetParent(TheCanvasMap);
	
	// contained objects
	this.Views=[];
	
 	this.Layers=[];
	
	this.Backgrounds=[];
	this.SelectedBackgroundIndex=-1;
	
 	this.MapElements=[]; // should either be in the view or in a layer
	
	// settings
	
	this.TimeSlices=
	[{
		Time:0,
		Settings:
		{
			Fill:
			{
				fillStyle:"rgb(210,220,255)" // a nice light blue for the ocean
			},
		}
	}];
	
	this.TheProjector=null;
	
	this.MinTime=0; 
	
	// private properties
	this.Times=[0];
	
	this.TheBounds=null;

	this.NumRepaintBlocks=0;
	this.NeedRepaint=false;
}

CMScene.prototype=Object.create(CMItem.prototype); // inherit prototype functions from PanelBase()

CMScene.prototype.contructor=CMScene; // override the constructor to go to ours

//******************************************************************
//  Protected functions
//******************************************************************
/*
* Allows layers to get the view that they are drawn in.
* @protected
* @param ViewIndex - allows future expansion to have mulitple views in one scene
*/
CMScene.prototype.GetView=function(ViewIndex) 
{
	var Result=null;
	
	Result=this.Views[ViewIndex];
	
	return(Result);
}
CMScene.prototype.GetNumViews=function() 
{
	var Result=this.Views.length;
	
	return(Result);
}
/*
* Allows layers to get the CanvasMap they are in
* @protected
* @returns TheCanvasMap - the CanvasMap the scene is located in
*/
CMScene.prototype.GetCanvasMap=function() 
{
	var Result=this.GetParent(CMMainContainer);
	return(Result);
}

//******************************************************************
// CMBase Functions
//******************************************************************

CMScene.prototype.GetTimes=function(TheTimeSlices) 
{
	return(this.Times);
}

//******************************************************************
// Background Management
//******************************************************************
/*
* Adds a background layer to the scene
* @public
* @param TheLayer
* @returns LayerIndex 
*/
CMScene.prototype.AddBackground=function(TheLayer) 
{
	if (this.SelectedBackgroundIndex==-1) this.SelectedBackgroundIndex=0;
	
	TheLayer.SetParent(this);
	 
	var LayerIndex=this.Backgrounds.length;
	
	this.Backgrounds[LayerIndex]=TheLayer;
	
	this.SendMessageToListeners(CMScene.MESSAGE_BACKGROUNDS_CHANGED);
	
	return(LayerIndex);
}
/*
* Sets which background will be selected for painting
* @public
* @param BackgroundIndex - 
*/
CMScene.prototype.SetSelectedBackgroundIndex=function(New)
{
	if (this.SelectedBackgroundIndex!=-1)
	{
		this.Backgrounds[this.SelectedBackgroundIndex].SetVisible(false);
	}
	
	this.SelectedBackgroundIndex=New;
	
	if (New!=-1)
	{
		this.Backgrounds[New].SetVisible(true);
	}
	this.Repaint();
}

/*
* Sets the background style
* @public
* @param BackgroundStyle - 
*//*
CMScene.prototype.SetBackgroundStyle=function(New)
{
	this.TimeSlices[0].Setings.Fill=New;
}*/
//******************************************************************
// CMBase Settings Functions
//******************************************************************

CMScene.prototype.GetSettingsDefinitions=function() 
{
	var Result={};
	
	for (Key in CMScene.SettingDefintions)
	{
		Result[Key]=CMScene.SettingDefintions[Key];
	}

	return(Result); 
}

//******************************************************************
// public CMScene functions for layer Management
//******************************************************************
/*
* Adds a layer to the scene
* @public
* @param TheLayer
* @returns LayerIndex 
*/
CMScene.prototype.AddLayer=function(TheLayer) 
{
	TheLayer.SetParent(this);
	
	var LayerIndex=this.Layers.length;
	
	this.Layers[LayerIndex]=TheLayer;
	
	// make sure the layer's time slices are reprented
	
	var NewTimes=TheLayer.GetTimes(this.Times);
	
	for (Time in NewTimes)
	{
		var Index=this.Times.indexOf(Time);
		
		if (Index==-1) // time slice is not in the time slice array
		{
			this.InsertTime(Time);
		}
	}
	this.LayerListChanged();
	
	return(LayerIndex);
}
/*
* Get the current number of layers
* @public
* @returns - the number of layers in the scene
*/
CMScene.prototype.GetNumLayers=function() 
{
	return(this.Layers.length);
}
/*
* Return the layer object at the specified index
* @public
* @param Index - 
*/
CMScene.prototype.GetLayer=function(Index) 
{
	return(this.Layers[Index]);
}
/*
* Return the index for the specified layer.  If the 
* layer does not appear in the CMScene, return -1
* @public
* @param TheLayer - 
* @returns LayerIndex
*/
CMScene.prototype.GetLayerIndex=function(TheLayer) 
{
	var Result=-1;
	
	for (var i=0;i<this.Layers.length;i++)
	{
		if (this.Layers[i]==TheLayer) Result=i;
	}
	return(Result);
}
/*
* Swap the layer with the one above it.
* @public
* @param Index - 
*/
CMScene.prototype.MoveLayerUp=function(Index) 
{
	var TheLayer=this.Layers[Index];
	if (Index>=0)
	{
		this.Layers[Index]=this.Layers[Index-1];
		this.Layers[Index-1]=TheLayer;
	}
	this.LayerListChanged();
	this.Repaint();
}
/*
* Swap the specified layer with the one below it.
* @public
* @param Index - 
*/
CMScene.prototype.MoveLayerDown=function(Index) 
{
	var TheLayer=this.Layers[Index];
	if (Index<this.Layers.length)
	{
		this.Layers[Index]=this.Layers[Index+1];
		this.Layers[Index+1]=TheLayer;
	}
	this.LayerListChanged();
	this.Repaint();
}

/**
* Remove the layer at the specified index from the list of layers
* @public
* @param Index - 
*/
CMScene.prototype.DeleteLayer=function(Index) 
{
	var Result=this.Layers.splice(Index,1);

	this.LayerListChanged();
	this.Repaint();
	
	return(Result);
}
/**
* Moves a layer to a new position in the layer list 
* @public
* @param TheLayer - 
* @param NewIndex - 
*/
CMScene.prototype.MoveLayer=function(TheLayer,NewIndex) 
{
	var CurrentIndex=this.GetLayerIndex(TheLayer);
	
	// make sure the new index is still within the list of layers
	
	if (NewIndex<0) NewIndex=0;
	if (NewIndex>=this.Layers.length) NewIndex=this.Layers.length-1;
	
	if (NewIndex<CurrentIndex) // move the layer up in the list (shift the layers from the new index to the old down one layer
	{
		for (var i=CurrentIndex;i>NewIndex;i--)
		{
			this.Layers[i]=this.Layers[i-1];
		}
		this.Layers[NewIndex]=TheLayer;
	}
	else if (NewIndex>CurrentIndex) // move the layer down in the list
	{
		for (var i=CurrentIndex;i<NewIndex;i++)
		{
			this.Layers[i]=this.Layers[i+1];
		}
		this.Layers[NewIndex]=TheLayer;
	}
	this.LayerListChanged();
	
	this.Repaint();
}
/**
* Get the search results from each layer.  The layers will insert 
* elements into the SearchResults element
*
* Called by CanvasMap
* @protected
*/
CMScene.prototype.GetSearchResults=function(TheText,SearchResults) 
{
//	this.SearchResultsPanel=SearchResults;
	
	for (var i=0;i<this.Layers.length;i++)
	{
		this.Layers[i].GetSearchResults(TheText,SearchResults);
	}
}
//******************************************************************
// Map Elements
//******************************************************************
/**
* Add a new map element to the scene (e.g. a scale bar)
* @public
* @param TheElement - 
*/
CMScene.prototype.AddMapElement=function(TheElement) 
{
	this.MapElements.push(TheElement);
	TheElement.SetParent(this);
}

//******************************************************************
// Messages from the views that are then sent to the layers
//******************************************************************
/**
* Called by CanvasMap to add a view for this scene.
* @protected
*/
CMScene.prototype.AddView=function(TheView) 
{
	TheView.SetParent(this);
	
	var ViewIndex=this.Views.length;
	
	this.Views[ViewIndex]=TheView;
	
	this.SetTimeRange(0);
}


/**
* Called when the view is panned
* @protected
*/
CMScene.prototype.ViewMoved=function(TheView) 
{
	for (var i=0;i<this.Backgrounds.length;i++)
	{
		this.Backgrounds[i].ViewMoved(TheView);
	}
	for (var i=0;i<this.Layers.length;i++)
	{
		this.Layers[i].ViewMoved(TheView);
	}
	for (var i=0;i<this.MapElements.length;i++)
	{
		this.MapElements[i].ViewMoved(TheView);
	}
}

/**
* Sets the minimum and maximum time for elements in the map.
* This is under development and currently layers need to
* check the time before painting into the view.
* @public
* @param MinTime - lowest allowed value for the time
*/
CMScene.prototype.SetTimeRange=function(MinTime)
{
	this.MinTime=MinTime;
	
	this.SendMessageToListeners(CMScene.MESSAGE_TIME_RANGE_CHANGED);
}
/**
* Gets the current setting for the time range.
* @public
* @returns time range as a JSON object with MinTime, MaxTime
*/
CMScene.prototype.GetTimeRange=function()
{
	return(this.MinTime);
}

//******************************************************************
// Event handlers
//******************************************************************
/*
* Not used
*/
CMScene.prototype.In=function(TheView,RefX,RefY,TheEvent) 
{
	var Result=null;
	
	// in operates the opposite direction as painting
	
	for (var i=this.Layers.length-1;(i>=0)&&(Result==null);i--)
	{
		var FeatureIndex=this.Layers[i].In(TheView,RefX,RefY,TheEvent);
		
		if (FeatureIndex!=-1)
		{
			Result=
			{
				LayerIndex: i,
				FeatureIndex: FeatureIndex
			}
		}
	}
	return(Result);
};
/**
* Called when there is a mouse down event received by CanvasMap
* @public
* @override
* @param TheView - the view that recieved the event
* @param RefX - reference horiziontal coordinate value
* @param RefY - reference vertical coordinate value
*/
CMScene.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	for (var i=this.Layers.length-1;(i>=0)&&(Used==false);i--)
	{
		Used=this.Layers[i].MouseDown(TheView,RefX,RefY,TheEvent);
	}
	return(Used);
};
/**
* Called when there is a mouse move event received by CanvasMap
* @public
* @override
* @param TheView - the view that recieved the event
* @param RefX - reference horiziontal coordinate value
* @param RefY - reference vertical coordinate value
*/
CMScene.prototype.MouseMove=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	for (var i=this.Layers.length-1;(i>=0)&&(Used==false);i--)
	{
		Used=this.Layers[i].MouseMove(TheView,RefX,RefY,TheEvent);
	}
	return(Used);
};
/**
* Called when there is a mouse up event received by CanvasMap
* @public
* @override
* @param TheView - the view that recieved the event
* @param RefX - reference horiziontal coordinate value
* @param RefY - reference vertical coordinate value
*/
CMScene.prototype.MouseUp=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	for (var i=this.Layers.length-1;(i>=0)&&(Used==false);i--)
	{
		Used=this.Layers[i].MouseUp(TheView,RefX,RefY,TheEvent);
	}
	return(Used);
};

//******************************************************************
// Painting
//******************************************************************
/**
* Called when the window is resized
* @public
* @override
* @param TheView - the view that recieved the event
*/
CMScene.prototype.Resize=function(TheView) 
{
	for (var i=0;i<this.Layers.length;i++)
	{
		this.Layers[i].Resize(TheView);
	}
	for (var i=0;i<this.MapElements.length;i++)
	{
		var TheMapElement=this.MapElements[i];
	
		// right sticky
		
		var TheSticky=TheMapElement.GetRightSticky();
		
		if (TheSticky!=null)
		{
			var TheCanvasElement=this.GetCanvasMap().GetElement(CMMainContainer.CANVAS);
			
			var ParentWidth=jQuery(TheCanvasElement).width();

			if (TheSticky.MoveFlag)
			{
				var Width=TheSettings.Xs[1]-TheSettings.Xs[0];
				
				TheSettings.Xs[0]=ParentWidth-TheSticky.Offset-Width;
				TheSettings.Xs[1]=TheSettings.Ys[0]+Width;
//				TheMapElement.X=ParentWidth-TheSticky.Offset-TheMapElement.Width;
			}
			else // size
			{
				TheSettings.Xs[1]=ParentWidth-TheSticky.Offset;
//				TheMapElement.Width=ParentWidth-TheMapElement.X-TheSticky.Offset;
			}
		}
	
		var TheSticky=TheMapElement.GetBottomSticky();
		
		if (TheSticky!=null)
		{
			var TheCanvasElement=this.GetCanvasMap().GetElement(CMMainContainer.CANVAS);
			
			var ParentHeight=jQuery(TheCanvasElement).height();

			var TheSettings=TheMapElement.GetSetting("Rectangle","Coordinates");
			
			if (TheSticky.MoveFlag)
			{
				var Height=TheSettings.Ys[1]-TheSettings.Ys[0];
				
				TheSettings.Ys[0]=ParentHeight-TheSticky.Offset-Height;
				TheSettings.Ys[1]=TheSettings.Ys[0]+Height;
//				TheMapElement.Y=ParentHeight-TheSticky.Offset-TheMapElement.Height;
			}
			else // size
			{
				TheSettings.Ys[1]=ParentHeight-TheSticky.Offset;
//				TheMapElement.Height=ParentHeight-TheMapElement.Y-TheSticky.Offset;
			}
		}
	}
	// resize the views
	
	for (var i=0;i<this.Views.length;i++)
	{
		this.Views[i].Resize();
	}
	this.Repaint();
}
/**
* Paint the layers into the view
* @public
* @override
* @param TheView - the view that recieved the event
*/
CMScene.prototype.Paint=function(TheView) 
{
	if (this.NumRepaintBlocks==0)
	{
		this.GetCanvasMap().AddToDebugPanel("CMScene.Paint Starting:"+CMUtilities.GetSeconds());
		
		this.NeedRepaint=false;
		
		this.IncrementRepaintBlocks();
		
		// let the view know we are starting
		
		TheView.PaintStart();
		
		// clear the background
		
		var Style=this.GetStyle(TheView,0,"Fill");
		
		if (Style!=undefined)
		{
			TheView.SetStyle(Style);
			TheView.PaintBackground();
			TheView.RestoreStyle();
		}
		
		// draw the backgrounds first
		
		if (this.SelectedBackgroundIndex!=-1)
		{
			this.Backgrounds[this.SelectedBackgroundIndex].Paint(TheView);
		}
	
		// then the other layers
		
		for (var i=0;i<this.Layers.length;i++)
		{
			if (typeof this.Layers[i]=="undefined")
			{
				var j=12;
			}
			this.Layers[i].Paint(TheView);
		}
		
		// then the selected features
		
		for (var i=0;i<this.Layers.length;i++)
		{
			this.Layers[i].PaintSelected(TheView);
		}
		// paint the additional map elemetns (north arrows, scale bars, etc).
		
		for (var i=0;i<this.MapElements.length;i++)
		{
			this.MapElements[i].Paint(TheView);
		}
		
		//
		TheView.PaintEnd();
		
		//
		
		this.DecrementRepaintBlocks();
		
		this.GetCanvasMap().AddToDebugPanel("CMScene.Paint Done: "+CMUtilities.GetSeconds());
		
		if (this.NeedRepaint) this.Repaint();
	}
	else
	{
		this.GetCanvasMap().AddToDebugPanel("CMScene.Paint NeedRepaint=true: "+CMUtilities.GetSeconds());
		this.NeedRepaint=true;
	}

}
/**
* Called by the layers to repaint the scene
* @public
* @override
* @param TheView - the view that recieved the event
*/
CMScene.prototype.Repaint=function() 
{
//	this.GetCanvasMap().AddToDebugPanel("CMScene.Repaint Enter: "+CMUtilities.GetSeconds());
	
	for (var i=0;i<this.Views.length;i++)
	{
		this.Paint(this.Views[i]); // jjg for now
	}
	/*
	if (this.NumRepaintBlocks==0)
	{
		this.NeedRepaint=false;
		
		this.IncrementRepaintBlocks();
		
		for (var i=0;i<this.Views.length;i++)
		{
			this.Views[i].Paint();
		}
		this.DecrementRepaintBlocks();
		
		if (this.NeedRepaint) this.Repaint();
	}
	else
	{
		this.NeedRepaint=true;
	}*/
	this.GetCanvasMap().AddToDebugPanel("CMScene.Repaint Exit:"+CMUtilities.GetSeconds());
}
/**
* Called to block repainting when a large number of settings are made that would all
* generate repaints.
* @public
*/
CMScene.prototype.IncrementRepaintBlocks=function()
{
	this.NumRepaintBlocks++;
}
/**
* Calls to IncrementRepaintBlocks must be paired with calls to this function.
* generate repaints.
* @public
*/
CMScene.prototype.DecrementRepaintBlocks=function()
{
	this.NumRepaintBlocks--;
}
/**
* Called from a scene to indicate that a layer's settings changed.
* @protected
* @param TheLayer
*/
CMScene.prototype.LayerListChanged=function()
{
	this.SendMessageToListeners(CMScene.MESSAGE_LAYER_LIST_CHANGED,this);
}
CMScene.prototype.LayerContentChanged=function(ItemThatChanged)
{
	this.SendMessageToListeners(CMScene.MESSAGE_LAYER_CONTENT_CHANGED,ItemThatChanged);
}
CMScene.prototype.LayerSettingsChanged=function(ItemThatChanged)
{
	this.SendMessageToListeners(CMScene.MESSAGE_LAYER_SETTINGS_CHANGED,ItemThatChanged);
	this.Repaint();
}
CMScene.prototype.SelectionChanged=function(ItemThatChanged)
{
	this.SendMessageToListeners(CMScene.MESSAGE_SELECTION_CHANGED,ItemThatChanged);
	this.Repaint();
}

//******************************************************************
// Additional public functions
//******************************************************************
/**
* Set the projection for coordinate conversion
* @public
* @param TheProjector - the projector to use to project coordinates
*/
CMScene.prototype.SetProjector=function(TheProjector) { this.TheProjector=TheProjector; };
CMScene.prototype.GetProjector=function() { return(this.TheProjector); };


/**
* Called by layers to force the bounds to be recomputed.
* @protected
*/
CMScene.prototype.SetBoundsDirty=function() 
{ 
	this.TheBounds=null;
}
/**
* Gets the bounds of all the layer bounds combined.
* @public
*/
CMScene.prototype.GetBounds=function() 
{ 
	if ((this.Layers!=null)&&(this.TheBounds==null)) // bounds is dirty and we have layer data
	{
		for (var i=0;i<this.Layers.length;i++)
		{
			var TheLayer=this.Layers[i];
			
			if ((this.TheBounds==null)&&(TheLayer.TheBounds!=null))
			{
				this.TheBounds=CMUtilities.CloneBounds(TheLayer.TheBounds);
			}
			else if (TheLayer.TheBounds!=null)
			{
				CMUtilities.AddToBounds( this.TheBounds,TheLayer.TheBounds);
				
/*				if (TheLayer.TheBounds.XMin<this.TheBounds.XMin) this.TheBounds.XMin=TheLayer.TheBounds.XMin;
				if (TheLayer.TheBounds.XMax>this.TheBounds.XMax) this.TheBounds.XMax=TheLayer.TheBounds.XMax;
				if (TheLayer.TheBounds.YMin<this.TheBounds.YMin) this.TheBounds.YMin=TheLayer.TheBounds.YMin;
				if (TheLayer.TheBounds.YMax>this.TheBounds.YMax) this.TheBounds.YMax=TheLayer.TheBounds.YMax;
				
				if (TheLayer.TheBounds.ZMin!=undefined)
				{
					if (this.TheBounds.ZMin==undefined)
					{
					}
					else
					{
						if (TheLayer.TheBounds.ZMin<this.TheBounds.ZMin) this.TheBounds.ZMin=TheLayer.TheBounds.ZMin;
						if (TheLayer.TheBounds.ZMax>this.TheBounds.ZMax) this.TheBounds.ZMax=TheLayer.TheBounds.ZMax;
				}
*/			}
		}
	}
	return(this.TheBounds);
}
/**
* Insert a Time in the appropraite location in the array
* @public 
* @param Time - the time slice to insert
*/
CMScene.prototype.InsertTime=function(Time) 
{
	Time=parseFloat(Time); // make sure we have a number

	CMUtilities.InsertIntoSortedArray(this.Times,Time);
	
	this.SendMessageToListeners(CMScene.MESSAGE_TIME_SLICES_CHANGED);

}
/**
* Remove the entry for the specified Time
* @public 
* @param Time - the time slice to delete
*/
CMScene.prototype.DeleteTime=function(Time) 
{ 
	Time=parseFloat(Time); // make sure we have a number

	var Index=this.Times.indexOf(Time);
	if (Index!=-1)
	{
		this.Times.splice(Index,1);
	}
	this.SendMessageToListeners(CMScene.MESSAGE_TIME_SLICES_CHANGED);
}


/**
* Unselect all information in the layers
* @public
*/
CMScene.prototype.CMItem_UnselectAll=CMItem.prototype.UnselectAll;

CMScene.prototype.UnselectAll=function(SendMessageFlag) 
{
	this.CMItem_UnselectAll(SendMessageFlag);
	
	for (var i=0;i<this.Layers.length;i++)
	{
		this.Layers[i].UnselectAll(SendMessageFlag);
	}
	// make sure the search results are unselected
	
/*	if (this.SearchResultsPanel!=null)
	{
		var TheChildren=this.SearchResultsPanel.children;
		
		for (var i=0;i<TheChildren.length;i++)
		{
			TheChildren[i].className="CM_SearchResult";
		}
	}*/
}

