//******************************************************************
// CMPanelTimeSlider Class
//******************************************************************

//******************************************************************
// Constructor
//******************************************************************
function CMPanelTimeSlider(TheCanvasMap) 
{
	this.TheCanvasMap=TheCanvasMap;
	
	this.RightSide=100;
	this.VerticalSpacing=20;
	this.TimeSpacing=50;
	
	this.SelectedRow=0;
	this.SelectedColumn=0;

	// setup the time panel DOM element
	
	var TimePanelElement;
	
	this.SetElement=function(NewElement)
	{
		TimePanelElement=NewElement;
	
		var TheElement=document.createElement("canvas");
		TheElement.width=500;
		TheElement.height=500;
		
		TheElement.id="TIME_EDITOR_CANVAS";
		TimePanelElement.appendChild(TheElement);
			
		TimePanelElement.GetColumnFromEvent=function(TheEvent)
		{
			var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this);
			var X=Coordinate.x;
				
			var TheColumn=Math.floor((X-this.TimePanel.RightSide)/this.TimePanel.TimeSpacing);
		
			return(TheColumn);
		}
		TimePanelElement.GetSelectedRowFromEvent=function(TheEvent)
		{
			var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this);
			var Y=Coordinate.y;
				
			var Row=Math.floor((Y)/this.TimePanel.VerticalSpacing-1);
		
			return(Row);
		}
		TimePanelElement.TimePanel=this;
		
		// add the event listener for when the user presesed down with the mouse button in the timepanel
	
		TimePanelElement.addEventListener('mousedown', function(TheEvent)
		{
			//CMMainContainer.HidePopupWindow();
			
			var TheColumn=this.GetColumnFromEvent(TheEvent);
			var TheRow=this.GetSelectedRowFromEvent(TheEvent);
			
			var NumRows=this.TimePanel.GetNumRows();
			
			var TheScene=this.TimePanel.TheCanvasMap.GetScene();
			var TheTimeSlices=TheScene.GetTimes();
			
			var TheSlice=TheTimeSlices[TheColumn];
			
			var NumTimeSlices=TheTimeSlices.length;
			if (NumTimeSlices<=0) NumTimeSlices=1;
			
			event.preventDefault();
			if (event.button==0) // left mouse button was pressed, select a new cell
			{
				// if the click was in a valid cell, select it
				
				if ((TheColumn>=-1)&&(TheColumn<NumTimeSlices)&&(TheRow>=-1)&&(TheRow<NumRows))
				{
					this.TimePanel.SelectedRow=TheRow;
					this.TimePanel.SelectedColumn=TheColumn;
					
					this.TimePanel.TheCanvasMap.GetScene().SetTimeRange(TheTimeSlices[TheColumn]);
					
					TheScene.Repaint();
					this.TimePanel.PaintTimeEditor();
					
					//
		
					if (this.TimePanel.SelectedRow==0) 
					{
						this.TimePanel.SettingsPanel.Setup(TheScene);
						TheScene.SetSelected(true);
					}
					else // see if a layer or object was selected
					{
						var TheObject=this.TimePanel.GetRowObject(this.TimePanel.SelectedRow);
						
						if (TheObject!=null) // found an object to select
						{
							this.TimePanel.SettingsPanel.Setup(TheObject);
							TheObject.SetSelected(true);
						}
					}
				}
			}
			if (event.button!=0)  // right button was clicked
			{
				if (TheRow==-1) // top row
				{
					// get the popup menu element
					
					var ThePopupMenu=CMUtilities.GetPopupMenu("CM_LayerPopupMenu",TheEvent.clientX,TheEvent.clientY);
					
					// add the "Insert Right" popup menu item
					
					if (TheColumn>=0) // not the first column, add "Insert Left"
					{
						var InsertSlice=TheSlice+1;
						if (TheColumn!=TheTimeSlices.length-1) // not the last time slice
						{
							InsertSlice=(TheTimeSlices[TheColumn+1]+TheSlice)/2; // put the slice between the selected and next slice
						}
						var PropertiesElement=document.createElement('div');
						PropertiesElement.setAttribute("id","CM_SettingsElement");
						PropertiesElement.className="CM_LayerListPopupMenuItem";
						PropertiesElement.innerHTML="Insert Right...";
						PropertiesElement.TheSlice=InsertSlice;
						
						PropertiesElement.TimePanel=this.TimePanel;
						
						PropertiesElement.ThePopupMenu=ThePopupMenu;
						
						PropertiesElement.addEventListener('click', function(event)
						{
							var TheScene=this.TimePanel.TheCanvasMap.GetScene();
							TheScene.InsertTime(this.TheSlice);
							
							this.ThePopupMenu.style.visibility= "hidden";
							event.stopPropagation();
						});
						ThePopupMenu.appendChild(PropertiesElement);
					}
					
					// add the "Insert Left" popup menu item if we are not at the first slice
					
					if (TheColumn>0) // not the first column, add "Insert Left"
					{
						var InsertSlice=(TheTimeSlices[TheColumn-1]+TheSlice)/2; // insert between the selected and previous slices
						
						var PropertiesElement=document.createElement('div');
						PropertiesElement.setAttribute("id","CM_SettingsElement");
						PropertiesElement.className="CM_LayerListPopupMenuItem";
						PropertiesElement.innerHTML="Insert Left...";
						PropertiesElement.TheSlice=InsertSlice;
							
						PropertiesElement.TimePanel=this.TimePanel;
						
						PropertiesElement.ThePopupMenu=ThePopupMenu;
						
						PropertiesElement.addEventListener('click', function(event)
						{
							var TheScene=this.TimePanel.TheCanvasMap.GetScene();
							TheScene.InsertTime(this.TheSlice);
							
							this.ThePopupMenu.style.visibility= "hidden";
							event.stopPropagation();
						});
						ThePopupMenu.appendChild(PropertiesElement);
					}
					
					//**************************************************************************
					if (TheColumn>0) // not the first column, add "Delete"
					{
						var PropertiesElement=document.createElement('div');
						PropertiesElement.setAttribute("id","CM_SettingsElement");
						PropertiesElement.className="CM_LayerListPopupMenuItem";
						PropertiesElement.innerHTML="Delete...";
						PropertiesElement.TheSlice=TheSlice;
						
						PropertiesElement.TimePanel=this.TimePanel;
						
						PropertiesElement.ThePopupMenu=ThePopupMenu;
						
						PropertiesElement.addEventListener('click', function(event)
						{
							var TheScene=this.TimePanel.TheCanvasMap.GetScene();
							TheScene.DeleteTime(this.TheSlice);
							
							this.ThePopupMenu.style.visibility= "hidden";
							event.stopPropagation();
						});
						ThePopupMenu.appendChild(PropertiesElement);
					}
					if (ThePopupMenu.childNodes.length==0) CMMainContainer.HidePopupWindow();
				}
				else // not the top row
				{
					// get the popup menu element
					
					var ThePopupMenu=CMUtilities.GetPopupMenu("CM_LayerPopupMenu",TheEvent.clientX,TheEvent.clientY);
					
					if (TheColumn>=0) // see if we can "Add" or "Delete" settings
					{
						var TheObject=this.TimePanel.GetRowObject(this.TimePanel.SelectedRow);
						var TheTimeSlices=TheObject.GetTimes();
						var TimeIndex=TheTimeSlices.indexOf(TheSlice);
						
						var PropertiesElement=document.createElement('div');
						PropertiesElement.setAttribute("id","CM_SettingsElement");
						PropertiesElement.className="CM_LayerListPopupMenuItem";
						PropertiesElement.TheSlice=TheSlice;
						
						PropertiesElement.TimePanel=this.TimePanel;
						
						PropertiesElement.ThePopupMenu=ThePopupMenu;
						
						if (TimeIndex==-1) // insert time slice settings
						{
							PropertiesElement.innerHTML="Add Settings...";
							PropertiesElement.addEventListener('click', function(event)
							{
								var TheObject=this.TimePanel.GetRowObject(this.TimePanel.SelectedRow);
								
								TheObject.InsertTime(this.TheSlice);
								
								this.ThePopupMenu.style.visibility= "hidden";
								event.stopPropagation();
								
								this.TimePanel.PaintTimeEditor();
							});
							// only add the element if "Add Settnigs" was added
							
							ThePopupMenu.appendChild(PropertiesElement);
						}
						else if (TimeIndex!=0) // delete time slice settings
						{
							PropertiesElement.innerHTML="Delete Settings...";
							PropertiesElement.addEventListener('click', function(event)
							{
								var TheObject=this.TimePanel.GetRowObject(this.TimePanel.SelectedRow);
								
								TheObject.DeleteTime(this.TheSlice);
								
								this.ThePopupMenu.style.visibility= "hidden";
								event.stopPropagation();
							});
							
							// only add the element if "Delete Settnigs" was added
							
							ThePopupMenu.appendChild(PropertiesElement);
						}
						
					}
					if (ThePopupMenu.childNodes.length==0) CMMainContainer.HidePopupWindow();
				}
			}
			event.stopPropagation(); // stop the document from hidding a popup window
			event.preventDefault(); // keeps regular menu from appearing
			return(false); // old way to keep regular menu from appearing (not sure this is needed)
		});
	}
	
	var TheScene=TheCanvasMap.GetScene();
	
	TheScene.AddListener(CMScene.MESSAGE_LAYER_LIST_CHANGED,this,function(TheScene,TheListener,AdditionalInfo)
	{
		TheListener.PaintTimeEditor();
	});
	TheScene.AddListener(CMScene.MESSAGE_TIME_SLICES_CHANGED,this,function(TheScene,TheListener,AdditionalInfo)
	{
		TheListener.PaintTimeEditor();
	});
	TheScene.AddListener(CMScene.MESSAGE_SELECTION_CHANGED,this,function(TheScene,TheListener,AdditionalInfo)
	{
		TheListener.PaintTimeEditor();
	});

	this.PaintTimeEditor();
}

//******************************************************************
// Private static  functions
//******************************************************************

//******************************************************************
// Private functions
//******************************************************************
/**
* 
* @private
*/
CMPanelTime.prototype.GetRowObject=function(RowNumber)
{
	var TheObject=null;
	var TheScene=this.TheCanvasMap.GetScene();
	
	if (RowNumber==0) 
	{
		TheObject=TheScene;
	}
	else // see if a layer or item within the layer are the selected row
	{
		var NumLayers=TheScene.Layers.length;
	
		var CurrentRow=1;
		for (var i=0;(i<NumLayers)&&(TheObject==null);i++)
		{
			var TheLayer=TheScene.GetLayer(i);
			 
			if (CurrentRow==RowNumber) 
			{
				TheObject=TheLayer;
			}
			
			CurrentRow++;
			
			// make sure the correct entry is selected
			var NumChildren=TheLayer.GetNumChildren();
	
			for (var j=0;(j<NumChildren)&&(TheObject==null);j++)
			{
				var TheChild=TheLayer.GetChild(j);
				
				if (CurrentRow==RowNumber) 
				{
					TheObject=TheChild;
				}
				CurrentRow++;
			}
		}
	}
	return(TheObject);
}

/**
* Move to CMUtilities?
* @private
*/
function AppendElement(ElementType,TheParent)
{
	var TheChild = document.createElement(ElementType);
	TheParent.appendChild(TheChild);	
	return(TheChild);			
}


/**
* @private
*/
CMPanelTime.prototype.GetColumnLeft=function(TheColumn)
{
	var TheColumnLeft=this.RightSide+TheColumn*this.TimeSpacing;
	return(TheColumnLeft);
}
/**
* @private
*/
CMPanelTime.prototype.GetRowTop=function(Row)
{
	var RowTop=(Row+1)*this.VerticalSpacing; // +1 for the header row
	return(RowTop);
}

//******************************************************************
// Get and Set functions
//******************************************************************
/**
* Set the assocaittion with a settings panel (make into listener?)
*/
CMPanelTime.prototype.SetSettingsPanel=function(SettingsPanel)
{
	this.SettingsPanel=SettingsPanel;
}
//******************************************************************
// Painting functions
//******************************************************************
/**
* Move to CMUtilities? CMView?
* @private
*/
function PaintLine(TheContext,X1,Y1,X2,Y2)
{
	TheContext.beginPath();
	TheContext.moveTo(X1,Y1);
	TheContext.lineTo(X2,Y2);
	TheContext.stroke();
}
/**
* Return the number of rows (also number of items) move to CMScene?
*/
CMPanelTime.prototype.GetNumRows=function()
{
	var TheScene=this.TheCanvasMap.GetScene();
	
	var NumLayers=TheScene.Layers.length;
	
	var NumRows=NumLayers+1; // plus one for the scene
	
	for (var i=0;i<NumLayers;i++)
	{
		 var TheLayer=TheScene.GetLayer(i);
		
		NumRows+=TheLayer.GetNumChildren();
	}
	return(NumRows);
}
/**
* Internal utility for painting the time slice settings symbol
* @private
*/
CMPanelTime.prototype.PaintTimeSliceSettingsSymbols=function(AllTimeSlices,TheItem,Y,TheContext)
{
	for (var TimeIndex=0;TimeIndex<AllTimeSlices.length;TimeIndex++)
	{
		var TheTimeSlice=AllTimeSlices[TimeIndex];
		
		var TimeSliceSettings=TheItem.GetSettings(TheTimeSlice);
//		var ChildTimeSlice=TheChildTimeSlices[ChildTimeSliceKey];
		
//		var TimeIndex=TimeSlices.indexOf(ChildTimeSlice);
		
		if (TimeSliceSettings!=null)
		{
			var X=this.RightSide+TimeIndex*this.TimeSpacing;
			
			var TheText="O";
			
			TheContext.fillText(TheText,X+4,Y-4);
		}
	}
}
/**
* @protected
*/
CMPanelTime.prototype.PaintTimeEditor=function()
{
	var TheScene=this.TheCanvasMap.GetScene();

	var TimeSlices=TheScene.GetTimes();

	var TimePanelElement=document.getElementById("TIME_EDITOR_CANVAS");
	
	if (TimePanelElement!=null)
	{
		var TheContext=TimePanelElement.getContext("2d");
		
		var TheScene=this.TheCanvasMap.GetScene();
		
		var NumLayers=TheScene.Layers.length;
		
		var ElementWidth=TimePanelElement.offsetWidth;
		var ElementHeight=TimePanelElement.offsetWidth;
	
		var NumRows=0;
	
		// clear the background
		
		TheContext.fillStyle="#ffffff";
		TheContext.fillRect(0,0,ElementWidth,ElementHeight);
		TheContext.fill();
		
		var Y=(NumRows+1)*this.VerticalSpacing;
				
		PaintLine(TheContext,0,Y,ElementWidth,Y);
		
		NumRows++;
		
		// paint the scene's row
		
		TheContext.strokeStyle="#000000";
		TheContext.lineWidth=1;
		
		var Y=(NumRows+1)*this.VerticalSpacing;
		
		TheContext.font="14px  arial";
		TheContext.fillStyle="#000000";
		
		TheContext.fillText("Layers",4,Y-4);
		
		//
			
		this.PaintTimeSliceSettingsSymbols(TimeSlices,TheScene,Y,TheContext);
				
		PaintLine(TheContext,0,Y,ElementWidth,Y);
		
		// paint the layers and their content (objects)
		
		NumRows++;
		
		for (var i=0;i<NumLayers;i++)
		{
			 var TheLayer=TheScene.GetLayer(i);
			
			// paint the layer name
			var Name=TheLayer.GetName();
			
			var Y=(NumRows+1)*this.VerticalSpacing;
			
			TheContext.fillText(Name,4,Y-4);
			
			//
			
			//var TheLayerTimeSlices=TheLayer.GetTimes([]);
				
			this.PaintTimeSliceSettingsSymbols(TimeSlices,TheLayer,Y,TheContext);
			
			//
			
			PaintLine(TheContext,0,Y,ElementWidth,Y);
			
			NumRows++;
			
			// paint the children below the layer
			var NumChildren=TheLayer.GetNumChildren();
	
			for (var j=0;j<NumChildren;j++)
			{
				var TheChild=TheLayer.GetChild(j);
			
				var Y=(NumRows+1)*this.VerticalSpacing;
			
				TheContext.fillText(TheChild.GetName(),14,Y-4);
				
				// paint the cells
				
				//var TheChildTimeSlices=TheChild.GetTimes([]);
				
				this.PaintTimeSliceSettingsSymbols(TimeSlices,TheChild,Y,TheContext);
				
				PaintLine(TheContext,0,Y,ElementWidth,Y);
				
				NumRows++;
			}
		}
		// paint the lines for the time slices
		
		for (var i=0;i<TimeSlices.length;i++)
		{
			var X=this.RightSide+i*this.TimeSpacing;
			
			var TheText=TimeSlices[i];
			
			TheContext.fillText(TheText,X+4,this.VerticalSpacing-4);
			
			PaintLine(TheContext,X,0,X,ElementHeight);
		}
		var X=this.RightSide+TimeSlices.length*this.TimeSpacing;
		PaintLine(TheContext,X,0,X,ElementHeight);
		
		//
		
		if (this.SelectedColumn!=-1)
		{
			var X=this.GetColumnLeft(this.SelectedColumn);
			
			var Y=this.GetRowTop(this.SelectedRow);
			
			TheContext.strokeStyle="#000000";
			TheContext.lineWidth=2;
			TheContext.rect(X+1,Y+1,this.TimeSpacing-2,this.VerticalSpacing-2);
			TheContext.stroke();
		}
	}
}
