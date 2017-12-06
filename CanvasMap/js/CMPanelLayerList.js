//******************************************************************
// SetupSettingsPanel Class
//******************************************************************
/*-- Changes check box size and margin --*/
CMPanelLayerList.LAYER_LIST_ITEM_HEIGHT=24;
CMPanelLayerList.LAYER_POPUP_MENU_ITEM_HEIGHT=24;

//******************************************************************
// Constructor
//******************************************************************

/**
* @private
*/
function CMPanelLayerList(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelLayerList requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	var TheScene=TheCanvasMap.GetScene();
	TheScene.AddListener(CMScene.MESSAGE_LAYER_LIST_CHANGED,this,function(TheScene,TheListener,AdditionalInfo)
	{
		TheListener.AddLayerList(TheScene);
	});
	
	this.TheElement=null;
	
	this.LayerListItemHeight=CMPanelLayerList.LAYER_LIST_ITEM_HEIGHT;
	this.LayerPopupMenuItemHeight=CMPanelLayerList.LAYER_POPUP_MENU_ITEM_HEIGHT;
}

CMPanelLayerList.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelLayerList.prototype.contructor=CMPanelLayerList; // override the constructor to go to ours
//******************************************************************
// Private Functions
//******************************************************************
//******************************************************************
// CMScene functions to create and manage the layer list
// 
// This is a relatively complicated set of code to allow users
// to move, edit, and access properties in the layer list.
// This provides a layer list similar to a GIS application that
// is not appropriate for most web apps.
//******************************************************************
/**
* @private
*/
CMPanelLayerList.prototype.AddLayerToList=function(TheElement,LayerIndex,Left,LayerInListTop,TheScene)
{
	var TheLayer=TheScene.Layers[LayerIndex];
	
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
	TheCheckBox.TheLayer=TheLayer;
	TheCheckBox.checked=TheLayer.GetVisible(); // check if the layer is currently visible
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
	
	var TheIcon=TheLayer.GetIcon();
	
	if (CMUtilities.IsDefined(TheIcon))
	{
		CMUtilities.AbsolutePosition(TheIcon,Left+28,-5,16,16);
	
		// Set the position of the check boxes
	
		LayerInList.appendChild(TheIcon);
	}
	//***************************************************************************
	// add the name
	
	var TheLayerName=document.createElement('div');
	TheLayerName.className="CM_LayerListNameClass";
	
	var TheName=TheLayer.Name;
	if (TheName===null) TheName="Untitled";
	TheLayerName.innerHTML=TheName;
	
	TheLayerName.TheLayer=TheLayer;
	TheLayerName.TheScene=TheScene;
	TheLayerName.TheElement=TheElement;
	TheLayerName.LayerInList=LayerInList;
	TheLayerName.TheLayerList=this;

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
			
			var ThePopupMenu=CMUtilities.GetPopupMenu("CM_LayerPopupMenu",event.clientX,event.clientY);
			
			//*******************************************************************
			// Add the popup menu items
			
			this.TheLayer.FillPopupMenu(ThePopupMenu);
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
	// to use for spacing out the items and adding the dragging bar.  They all failed and absolute positioning was used instead.
//	var Height=LayerInList.css('height');
//	var LayerInListHeight=jQuery(LayerInList).outerHeight(false); // there are still some things that only jQuery does well.
//	var LayerListWidth=jQuery(TheElement).outerWidth(false); // there are still some things that only jQuery does well.
//	LayerInListTop+=LayerInList.getBoundingClientRect().height;
//	var Height=LayerInList.getBoundingClientRect().css('height');
}

//******************************************************************
// Functions
//******************************************************************

CMPanelLayerList.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;
}
/**
* Setup the properties panel for a selected object
*/
CMPanelLayerList.prototype.Setup=function(TheObject)
{
	var SettingsPopup=this.TheElement;
	
	while (SettingsPopup.hasChildNodes()) 
	{
		SettingsPopup.removeChild(SettingsPopup.lastChild);
	}
	

}

/**
* Add the layer list to the specified DOM element.
* This will typically be a div tag in the map page.
* Override to provide your own layer list.
* @protected, @override
* @param TheElement
*/
CMPanelLayerList.prototype.AddLayerList=function(TheScene) 
{
	TheElement=this.TheElement;
	TheElement.LayerListPanel=this;
	
	// first, remove all the existing elements from the element
	while (TheElement.firstChild) // while there is a first element in the dialog
	{
		// removing the first element moves the next element to the first position
		// so this little loop will remove all the elements from another element
		TheElement.removeChild(TheElement.firstChild);
	}
	
	//TheElement.TheScene=this; // used in event handlers
	
	var Left=TheElement.style.left;
	var Top=TheElement.style.top;
	
	// TheElement.style.borderColor="#cccccc"; // border color for the layers list. style moved to CanvasMap.css.
	Left=0;
	Top=0;
	var LayerInListTop=0;
	for (var i=0;(i<TheScene.Layers.length);i++)
	{
		var LayerInListTop=Top+(i*this.LayerListItemHeight);
		
		this.AddLayerToList(TheElement,i,Left,LayerInListTop,TheScene);
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
			
			var TheCanvasMap=this.LayerListPanel.GetParent();
			var TheScene=TheCanvasMap.GetScene();
			
			var TheElementPosition=$(this).offset();
			var NewY=event.clientY-TheElementPosition.top;
			var NewIndex=Math.floor(NewY/this.LayerListPanel.LayerListItemHeight);
			TheScene.MoveLayer(this.DraggingLayer,NewIndex);
			
			this.DraggingDiv.style.visibility= "hidden";
			this.DraggingDiv=null;
			
			this.LayerListPanel.AddLayerList(TheScene);
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