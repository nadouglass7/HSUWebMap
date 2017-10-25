/******************************************************************************************************************
* CMScene
* Contains a list of layers and a list of background layers.
* Also has a background style that will be drawn if set.
*
* @module CMScene
******************************************************************************************************************/
//******************************************************************
// definitions
//******************************************************************

// These need to be moved to the CSS file or set as functions

/*-- Changes check box size and margin --*/
CMScene.LAYER_LIST_ITEM_HEIGHT=24;
CMScene.LAYER_POPUP_MENU_ITEM_HEIGHT=24;

//******************************************************************
// CMScene Class
//******************************************************************
/*
* Constructor for the CMScene class
* @public, @constructs
*/
function CMScene(TheCanvasMap) 
{
	this.TheCanvasMap=TheCanvasMap;
	
	this.Views=[];
	
 	this.Layers=[];
	
	this.Backgrounds=[];
	this.SelectedBackgroundIndex=-1;
	
 	this.MapElements=[];
	
	this.TheBounds=null;
	
	this.TheLayerList=null;
	
	// div element for the attribute table
	this.AttributeTableElement=null;

	this.SearchResultsPanel=null; // jjg - this may not be the best place for this.
	
	this.NumRepaintBlocks=0;
	this.NeedRepaint=false;
	
	this.BackgroundColor="#FFFFFF"; // obsolete for style
	this.BackgroundStyle=null;
	
	this.LayerListItemHeight=CMScene.LAYER_LIST_ITEM_HEIGHT;
	this.LayerPopupMenuItemHeight=CMScene.LAYER_POPUP_MENU_ITEM_HEIGHT;
}
//******************************************************************
// Private Functions
//******************************************************************
CMScene.prototype.Private_UpdateAttributeTable=function(TheLayer) 
{
	var NewAttributeTableElement=this.AttributeTableElement;
	
	var NumRows=TheLayer.GetNumAttributeRows();
	var NumColumns=TheLayer.GetNumAttributeColumns();
	
	var TheHTML="<table border='1px' cellpadding='1' cellspacing='0'>";
	TheHTML+="<tr>";
	for (var i=0;i<NumColumns;i++) 
	{
		TheHTML+="<th>";
		TheHTML+=TheLayer.GetAttributeHeading(i);
		TheHTML+="</th>";
	}
	TheHTML+="</tr>";
	
	for (var Row=0;Row<NumRows;Row++)
	{
		TheHTML+="<tr>";
		for (var i=0;i<NumColumns;i++) 
		{
			TheHTML+="<td>";
			TheHTML+=TheLayer.GetAttributeCell(i,Row);
			TheHTML+="</td>";
		}
		TheHTML+="</tr>";
	}
	TheHTML+="</table>";
	NewAttributeTableElement.innerHTML=TheHTML;
}
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
/*
* Allows layers to get the CanvasMap they are in
* @protected
* @returns TheCanvasMap - the CanvasMap the scene is located in
*/
CMScene.prototype.GetCanvasMap=function() 
{
	return(this.TheCanvasMap);
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
	
	TheLayer.SetScene(this);
	 
	var LayerIndex=this.Backgrounds.length;
	
	this.Backgrounds[LayerIndex]=TheLayer;
	
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
		this.Backgrounds[New].ZoomLevelChanged(); // this reset the tiles
	}
	this.Repaint();
}
/*
* Depricated
*/
CMScene.prototype.SetBackgroundColor=function(New)
{
	this.BackgroundColor=New;
}
/*
* Sets the background style
* @public
* @param BackgroundStyle - 
*/
CMScene.prototype.SetBackgroundStyle=function(New)
{
	this.BackgroundStyle=New;
}

//******************************************************************
// CMLayer Management
//******************************************************************
/*
* Adds a layer to the scene
* @protected
* @param TheLayer
* @returns LayerIndex 
*/
CMScene.prototype.AddLayer=function(TheLayer) 
{
	TheLayer.SetScene(this);
	
	var LayerIndex=this.Layers.length;
	
	this.Layers[LayerIndex]=TheLayer;
	
	return(LayerIndex);
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
	
	this.Repaint();
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
	TheElement.SetScene(this);
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
	TheView.SetScene(this);
	
	var ViewIndex=this.Views.length;
	
	this.Views[ViewIndex]=TheView;
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
	this.SearchResultsPanel=SearchResults;
	
	for (var i=0;i<this.Layers.length;i++)
	{
		this.Layers[i].GetSearchResults(TheText,SearchResults);
	}
}
/**
* Called when the zoom level has changed from the CanvasMap and view.
* @protected
*/
CMScene.prototype.ZoomLevelChanged=function() 
{
	for (var i=0;i<this.Backgrounds.length;i++)
	{
		this.Backgrounds[i].ZoomLevelChanged();
	}
	for (var i=0;i<this.Layers.length;i++)
	{
		this.Layers[i].ZoomLevelChanged();
	}
	for (var i=0;i<this.MapElements.length;i++)
	{
		this.MapElements[i].ZoomLevelChanged();
	}
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

//******************************************************************
// Event handlers
//******************************************************************
/*
* Not used
*/
CMScene.prototype.In=function(TheView,RefX,RefY) 
{
	var Result=null;
	
	// in operates the opposite direction as painting
	
	for (var i=this.Layers.length-1;(i>=0)&&(Result==null);i--)
	{
		var FeatureIndex=this.Layers[i].In(TheView,RefX,RefY);
		
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
CMScene.prototype.MouseDown=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	for (var i=this.Layers.length-1;(i>=0)&&(Used==false);i--)
	{
		Used=this.Layers[i].MouseDown(TheView,RefX,RefY);
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
CMScene.prototype.MouseMove=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	for (var i=this.Layers.length-1;(i>=0)&&(Used==false);i--)
	{
		Used=this.Layers[i].MouseMove(TheView,RefX,RefY);
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
CMScene.prototype.MouseUp=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	for (var i=this.Layers.length-1;(i>=0)&&(Used==false);i--)
	{
		Used=this.Layers[i].MouseUp(TheView,RefX,RefY);
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
			var TheCanvas=this.TheCanvasMap.GetElement(CanvasMap.CANVAS);
			
			var ParentWidth=jQuery(TheCanvas).width();

			if (TheSticky.MoveFlag)
			{
				TheMapElement.X=ParentWidth-TheSticky.Offset-TheMapElement.Width;
			}
			else // size
			{
				TheMapElement.Width=ParentWidth-TheMapElement.X-TheSticky.Offset;
			}
		}
	
		var TheSticky=TheMapElement.GetBottomSticky();
		
		if (TheSticky!=null)
		{
			var TheCanvas=this.TheCanvasMap.GetElement(CanvasMap.CANVAS);
			
			var ParentHeight=jQuery(TheCanvas).height();

			if (TheSticky.MoveFlag)
			{
				TheMapElement.Y=ParentHeight-TheSticky.Offset-TheMapElement.Height;
			}
			else // size
			{
				TheMapElement.Height=ParentHeight-TheMapElement.Y-TheSticky.Offset;
			}
		}
	}
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
		
		if (this.BackgroundColor!=null) // being depricated
		{
			TheView.SetStyle({fillStyle:this.BackgroundColor});
			TheView.PaintBackground();
			TheView.RestoreStyle();
		}
		
		if (this.BackgroundStyle!=null)
		{
			TheView.SetStyle(this.BackgroundStyle);
			TheView.PaintBackground(this.BackgroundColor);
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
	this.GetCanvasMap().AddToDebugPanel("CMScene.Repaint Enter: "+CMUtilities.GetSeconds());
	
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
* Called when the layers settings changed.
* @public
* @param TheLayer
*/
CMScene.prototype.LayerSettingsChanged=function(TheLayer)
{
	// rebuild the layer list if it has been created
	if (this.TheLayerList!=null) this.AddLayerList(this.TheLayerList);
}
//******************************************************************
// CMScene functions to create and manage the layer list
// 
// This is a relatively complicated set of code to allow users
// to move, edit, and access properties in the layer list.
// This provides a layer list similar to a GIS application that
// is not appropriate for most web apps.
//******************************************************************
CMScene.prototype.Private_AddLayerToList=function(TheElement,LayerIndex,Left,LayerInListTop)
{
	//***************************************************************************
	// create the overall div tag for the layer in the list
	
	var LayerInList=document.createElement('div');
	LayerInList.className="CM_LayerListItemClass";
	TheElement.appendChild(LayerInList);

	//***************************************************************************
	// add the check box
	
	var TheCheckBox=document.createElement('input');
	TheCheckBox.className="CM_LayerListCheckBoxClass";
	
	TheCheckBox.type="checkbox"
	TheCheckBox.TheLayer=this.Layers[LayerIndex];
	TheCheckBox.checked=this.Layers[LayerIndex].Visible; // check if the layer is currently visible
	TheCheckBox.addEventListener('click', function()
	{
		if (this.checked)
		{
			this.TheLayer.SetVisible(true);
		}
		else // unchecked
		{
			this.TheLayer.SetVisible(false);
		}
	});

	CMUtilities.AbsolutePosition(TheCheckBox,Left+2,-6,30,this.LayerListItemHeight);
	
	// Set the position of the check boxes
	LayerInList.appendChild(TheCheckBox);

	//***************************************************************************
	// add the icon
	
	var TheIcon=this.Layers[LayerIndex].GetProperty(CMLayer.ICON_IMAGE);

	if (TheIcon==null)
	{
		var TheIcon=document.createElement('div');
		TheIcon.className="CM_LayerListIconClass";
		TheIcon.TheLayer=this.Layers[LayerIndex];
	
		var TheStyle=this.Layers[LayerIndex].TheStyle;
		
		if (TheStyle!=null)
		{
			for (var key in TheStyle)
			{
				var Value=TheStyle[key];
				
				if (key=="fillStyle") TheIcon.style.backgroundColor=Value;
				if (key=="strokeStyle") TheIcon.style.borderColor=Value;
			}
		}
	}
	CMUtilities.AbsolutePosition(TheIcon,Left+28,-5,16,16);
	
	// Set the position of the check boxes
	
	LayerInList.appendChild(TheIcon);

	//***************************************************************************
	// add the name
	
	var TheLayerName=document.createElement('div');
	TheLayerName.className="CM_LayerListNameClass";
	TheLayerName.innerHTML=this.Layers[LayerIndex].Name;
	TheLayerName.TheLayer=this.Layers[LayerIndex];
	TheLayerName.TheScene=this;
	TheLayerName.TheElement=TheElement;
	TheLayerName.LayerInList=LayerInList;

	CMUtilities.AbsolutePosition(TheLayerName,Left+48,0,170,this.LayerListItemHeight);
	
	//***************************************************************************
	// Mouse down to drag the layer
	//***************************************************************************
	
	this.DraggingDiv=null;
	
	document.addEventListener( "contextmenu", function(event) {
		event.preventDefault(); // keeps regular menu from appearing
		return(false); // old way to keep regular menu from appearing (not sure this is needed)
	});

	//***************************************************************************
	// event listener for when the user right clicks on the list
	// - regular click is for moving, right click for opening the menu
	
	TheLayerName.addEventListener('mousedown', function(event)
	{
		event.preventDefault();
		if (event.button==0) // left mouse button was pressed, move the layer in the list
		{
			// find the offset to the mouse click in the name
			
			this.DraggingDiv=document.getElementById("DraggingDiv");
			
			if (this.DraggingDiv==null)
			{
				this.DraggingDiv=document.createElement('div');
				this.DraggingDiv.className="CM_DraggingDivClass";
				this.DraggingDiv.id="DraggingDiv";
			}
			this.DraggingDiv.style.visibility="visible";
			
			this.TheElement.appendChild(this.DraggingDiv);
			
			this.TheElement.DraggingDiv=DraggingDiv;
			this.TheElement.DraggingLayer=this.TheLayer;
			
			// set the inital position of the div
			
			var TheElementPosition=$(this.TheElement).offset();
			
			CMUtilities.AbsolutePosition(this.DraggingDiv,0,event.clientY-TheElementPosition.top,200,0);
		}
		else // right mouse button was pressed, display the popup menu
		{
			//*******************************************************************
			// Create the popup menu if it has not been created already and remove it's contents
			// we use one LayerPopupMenu element for all layers and 
			// just change it's contents when it is selected
			
			var ThePopupMenu=document.getElementById("LayerPopupMenu");
			if (ThePopupMenu==null)
			{
				ThePopupMenu=document.createElement("DIV"); // create the DIV element
				ThePopupMenu.className="CM_LayerPopupMenu";
				
				ThePopupMenu.id="LayerPopupMenu"; // set the ID so we can get it back
			
				document.body.appendChild(ThePopupMenu); // add the dialog element to the document
			}
			// remove all the elements from the popup menu
			while (ThePopupMenu.firstChild) // while there is a first element in the dialog
			{
				// removing the first element moves the next element to the first position
				// so this little loop will remove all the elements from another element
				ThePopupMenu.removeChild(ThePopupMenu.firstChild);
			}
			this.ThePopupMenu=ThePopupMenu;
			
			//*******************************************************************
			// Add the popup menu items
			
			var TheDialogHeight=this.LayerPopupMenuItemHeight;
			
			// add a handler to make the popup disappear if the mouse moves out of it
			
/*			PropertiesElement.addEventListener('mouseleave', function(event)
			{
				this.ThePopupMenu.style.visibility= "hidden";
			});
*/			// create the settings menu item and add it to the popup
			if (this.TheLayer.HasSettingsDialog())
			{
				TheDialogHeight+=this.LayerPopupMenuItemHeight;
				
				var PropertiesElement=document.createElement('div');
				PropertiesElement.setAttribute("id","CM_SettingsElement");
				PropertiesElement.className="CM_LayerListPopupMenuItem";
				PropertiesElement.innerHTML="Settings...";
				
				PropertiesElement.TheLayer=this.TheLayer;
				PropertiesElement.TheScene=this.TheScene;
				
				PropertiesElement.ThePopupMenu=ThePopupMenu;
				
				PropertiesElement.addEventListener('click', function(event)
				{
					this.ThePopupMenu.style.visibility= "hidden";
					this.TheLayer.ShowSettingsDialog();
					
					event.stopPropagation();
				});
				ThePopupMenu.appendChild(PropertiesElement);
			}
			//********************************************
			// create the delete menu item
			var DeleteElement=document.createElement('div');
			DeleteElement.setAttribute("id","CM_DeleteElement");
			DeleteElement.className="CM_LayerListPopupMenuItem";
			
			DeleteElement.innerHTML="Delete";
			
			DeleteElement.TheLayer=this.TheLayer;
			DeleteElement.TheScene=this.TheScene;
			DeleteElement.TheElement=this.TheElement;
			
			DeleteElement.ThePopupMenu=ThePopupMenu;
			
			DeleteElement.addEventListener('click', function(event)
			{
				this.ThePopupMenu.style.visibility= "hidden";
				var LayerIndex=this.TheScene.GetLayerIndex(this.TheLayer);
				this.TheScene.DeleteLayer(LayerIndex);
				this.TheScene.AddLayerList(this.TheElement); // rebuild the list
					
				event.stopPropagation();
			});
			
			ThePopupMenu.appendChild(DeleteElement);
			
			//********************************************
			// See if we should add the "Zoom to" option
			
			if (this.TheLayer.GetBounds()!=null)
			{
				TheDialogHeight+=this.LayerPopupMenuItemHeight;
					
				var ZoomToElement=document.createElement('div');
				ZoomToElement.className="CM_LayerListPopupMenuItem";
				ZoomToElement.setAttribute("id","CM_ZoomToExtent");
				ZoomToElement.innerHTML="Zoom To This Layer";
				
				ZoomToElement.TheLayer=this.TheLayer;
				ZoomToElement.TheScene=this.TheScene;
				ZoomToElement.TheElement=this.TheElement;
				ZoomToElement.LayerInList=this.LayerInList;
				
				ZoomToElement.ThePopupMenu=ThePopupMenu;
				
				ZoomToElement.addEventListener('click', function(event)
				{
					this.ThePopupMenu.style.visibility="hidden";
					
					var TheBounds=this.TheLayer.GetBounds();
					var TheView=this.TheScene.GetView(0);
					
					TheView.ZoomToBounds(TheBounds);
					
					event.stopPropagation();
				});
				ThePopupMenu.appendChild(ZoomToElement);
			}
			
			//********************************************
			// See if we should add the "Attribute Table" option
			
			if ((this.TheScene.AttributeTableElement!=null))
			{
				TheDialogHeight+=this.LayerPopupMenuItemHeight;
					
				var AttributeTableElement=document.createElement('div');
				AttributeTableElement.className="CM_LayerListPopupMenuItem";
				AttributeTableElement.setAttribute("id","CM_ZoomToExtent");
				AttributeTableElement.innerHTML="Attribute Table";
				
				AttributeTableElement.TheLayer=this.TheLayer;
				AttributeTableElement.TheScene=this.TheScene;
				
				AttributeTableElement.ThePopupMenu=ThePopupMenu;
				
				AttributeTableElement.addEventListener('click', function(event)
				{
					this.ThePopupMenu.style.visibility="hidden";
					
					this.TheScene.Private_UpdateAttributeTable(this.TheLayer);
					
					event.stopPropagation();
				});
				ThePopupMenu.appendChild(AttributeTableElement);
			}
			//********************************************
			// append and position the dialog
			
			CMUtilities.AbsolutePosition(ThePopupMenu,event.clientX,event.clientY,200,TheDialogHeight);
			
			CanvasMap.SetPopupWindow(ThePopupMenu); // reset any existing popups and make this one current
			
			ThePopupMenu.style.visibility="visible"; // make this popup visible
		}
		
		event.stopPropagation(); // stop the document from hidding a popup window
		event.preventDefault(); // keeps regular menu from appearing
		return(false); // old way to keep regular menu from appearing (not sure this is needed)
	});
	TheLayerName.addEventListener('mouseup', function(event)
	{
		event.preventDefault();
		return(false); // old way to keep regular menu from appearing (not sure this is needed)
	});
	
	// 

	LayerInList.appendChild(TheLayerName);
	
//	LayerInList.style.border="2px solid #ff0000"; // for debugging
	
	var LayerListWidth=jQuery(TheElement).outerWidth(false);
	
	CMUtilities.AbsolutePosition(LayerInList,Left+2,LayerInListTop,LayerListWidth,this.LayerListItemHeight);
	
	// these were all attempts to get the height of the element in the list after it was added
	// to use for spacing out the items.  They all failed.
//	var Height=LayerInList.css('height');
//	var LayerInListHeight=jQuery(LayerInList).outerHeight(false); // there are still some things that only jQuery does well.
//	var LayerListWidth=jQuery(TheElement).outerWidth(false); // there are still some things that only jQuery does well.
//	LayerInListTop+=LayerInList.getBoundingClientRect().height;
//	var Height=LayerInList.getBoundingClientRect().css('height');
}

/**
* Add the layer list to the specified DOM element.
* This will typically be a div tag in the map page.
* Override to provide your own layer list.
* @public, @override
* @param TheElement
*/
CMScene.prototype.AddLayerList=function(TheElement) 
{
	this.TheLayerList=TheElement;
	
	// first, remove all the existing elements from the element
	while (TheElement.firstChild) // while there is a first element in the dialog
	{
		// removing the first element moves the next element to the first position
		// so this little loop will remove all the elements from another element
		TheElement.removeChild(TheElement.firstChild);
	}
	
	TheElement.TheScene=this; // used in event handlers
	
	var Left=TheElement.style.left;
	var Top=TheElement.style.top;
	
	// TheElement.style.borderColor="#cccccc"; // border color for the layers list. style moved to CanvasMap.css.
	Left=0;
	Top=0;
	var LayerInListTop=0;
	for (var i=0;(i<this.Layers.length);i++)
	{
		var LayerInListTop=Top+(i*this.LayerListItemHeight);
//		LayerInListTop+=TheElement.style.height;
		
		this.Private_AddLayerToList(TheElement,i,Left,LayerInListTop);
	}
	//**************************************************************************
	//TheElement.style.border="2px solid #00ff00";
		// moving the cursor for the layer
		
	TheElement.addEventListener('mousemove', function(event)
	{
		if (this.DraggingDiv!=null)
		{
			{
				// set the inital position of the div
				
				var TheElementPosition=$(this).offset();
				
				CMUtilities.AbsolutePosition(this.DraggingDiv,0,event.clientY-TheElementPosition.top,200,0);
			}
			event.preventDefault();
			return(false); // old way to keep regular menu from appearing (not sure this is needed)
		}
	});
	//*****************************************************
	// mouse released to move the layer to a new location
	
	TheElement.addEventListener('mouseup', function(event)
	{
		if (this.DraggingDiv!=null) // the user is dragging a layer in the list
		{
			event.preventDefault();
			
			var TheElementPosition=$(this).offset();
			var NewY=event.clientY-TheElementPosition.top;
			var NewIndex=Math.floor(NewY/this.TheScene.LayerListItemHeight);
			this.TheScene.MoveLayer(this.DraggingLayer,NewIndex);
			
			this.DraggingDiv.style.visibility= "hidden";
			this.DraggingDiv=null;
			
			this.TheScene.AddLayerList(this);
		}
		return(false); // old way to keep regular menu from appearing (not sure this is needed)
	});
	TheElement.addEventListener('mouseleave', function(event)
	{
		if (this.DraggingDiv!=null)
		{
			this.DraggingDiv.style.visibility= "hidden";
			this.DraggingDiv=null;
			event.preventDefault();
		}
	});
};
/**
* Add the background layer list to the specified DOM element.
* This will typically be a div tag in the map page.
* Override to provide your own layer list.
* @public, @override
* @param TheElement
*/
CMScene.prototype.AddBackgroundList=function(TheElement) 
{
	// first, remove all the existing elements from the element
	while (TheElement.firstChild) // while there is a first element in the dialog
	{
		// removing the first element moves the next element to the first position
		// so this little loop will remove all the elements from another element
		TheElement.removeChild(TheElement.firstChild);
	}
	
	TheElement.TheScene=this; // used in event handlers
	
	var Left=TheElement.style.left;
	var Top=TheElement.style.top;
	
	// TheElement.style.borderColor="#cccccc"; // border color for the layers list. style moved to CanvasMap.css.
	Left=0;
	Top=6;
	for (var i=0;(i<this.Backgrounds.length);i++)
	{
		var TheBackground=this.Backgrounds[i];
		
		if (i!=this.SelectedBackgroundIndex) TheBackground.SetVisible(false);
		
		//
		
		var LayerInListTop=Top+(i*this.LayerListItemHeight);
		
		// create the overall div tag for the layer in the list
		
		var LayerInList=document.createElement('div');
		LayerInList.className="CM_BackgroundListItemClass";
	
		var LayerListWidth=jQuery(TheElement).outerWidth(false);
	
		CMUtilities.AbsolutePosition(LayerInList,Left+2,LayerInListTop,LayerListWidth,this.LayerListItemHeight);
		
		TheElement.appendChild(LayerInList);
	
		// add the check box
		
		var TheCheckBox=document.createElement('input');
		TheCheckBox.className="CM_BackgroundListRadioButtonClass";
		TheCheckBox.name="Background";
		TheCheckBox.value=this.Backgrounds[i].Name;
		TheCheckBox.type="radio";
//		TheCheckBox.style.width="20%";
		
		TheCheckBox.TheScene=this;
		TheCheckBox.TheBackground=this.Backgrounds[i];
		TheCheckBox.ThisIndex=i;
		
		TheCheckBox.addEventListener('click', function()
		{
			if (this.checked)
			{
				this.TheScene.SetSelectedBackgroundIndex(this.ThisIndex);
			}
		});
		TheCheckBox.checked=false;
		
		if (this.SelectedBackgroundIndex==i) TheCheckBox.checked=true;
		
		// debugging
		
	//	TheCheckBox.style.border="1px solid blue";
	
		CMUtilities.AbsolutePosition(TheCheckBox,Left+2,-6,14,this.LayerListItemHeight);
		
// Sets the position of the check boxes
		
//		TheCheckBox.style.margin="12px 0px 0px 3px";
//		TheCheckBox.style.height="20px";
//		TheCheckBox.style.cssFloat = "left";

		LayerInList.appendChild(TheCheckBox);

		//****************************************************************
		// add the name
		
		var TheLayerName=document.createElement('div');
		TheLayerName.className="CM_BackgroundListNameClass";
		TheLayerName.innerHTML=this.Backgrounds[i].Name;
//		TheLayerName.style.border="1px solid red";
//		TheLayerName.style.width="80%";
	
		CMUtilities.AbsolutePosition(TheLayerName,Left+30,0,150,this.LayerListItemHeight);
	
		// 
	
		LayerInList.appendChild(TheLayerName);
//		LayerInList.style.border="2px solid #ff0000";

	}
};
//******************************************************************
// Additional public functions
//******************************************************************

/**
* Called by layers to force the bounds to be recomputed.
* @protected
* @param NewAttributeTableElement
*/
CMScene.prototype.SetBoundsDirty=function() 
{ 
	this.TheBounds=null;
}
/**
* Gets the bounds of all the layer bounds combined.
* @public
* @param NewAttributeTableElement
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
				if (TheLayer.TheBounds.XMin<this.TheBounds.XMin) this.TheBounds.XMin=TheLayer.TheBounds.XMin;
				if (TheLayer.TheBounds.XMax>this.TheBounds.XMax) this.TheBounds.XMax=TheLayer.TheBounds.XMax;
				if (TheLayer.TheBounds.YMin<this.TheBounds.YMin) this.TheBounds.YMin=TheLayer.TheBounds.YMin;
				if (TheLayer.TheBounds.YMax>this.TheBounds.YMax) this.TheBounds.YMax=TheLayer.TheBounds.YMax;
			}
		}
	}
	return(this.TheBounds);
}
/**
* Sets the DOM element that will be used to display the attribute table
* @public
* @param NewAttributeTableElement
*/
CMScene.prototype.SetAttributeTableElement=function(NewAttributeTableElement) 
{ 
	this.AttributeTableElement=NewAttributeTableElement; 
}
/**
* Unselect all information in the layers
* @public
*/
CMScene.prototype.UnselectAll=function() 
{
	for (var i=0;i<this.Layers.length;i++)
	{
		this.Layers[i].UnselectAll();
	}
	// make sure the search results are unselected
	
	if (this.SearchResultsPanel!=null)
	{
		var TheChildren=this.SearchResultsPanel.children;
		
		for (var i=0;i<TheChildren.length;i++)
		{
			TheChildren[i].className="CM_SearchResult";
		}
	}
}

