//******************************************************************
// CMLayerItems Class
//******************************************************************
//******************************************************************
// CMToolHandler (move later?)
//******************************************************************

function CMToolHandler(ObjectType)
{
	this.ObjectType=ObjectType;
} 
CMToolHandler.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
//	if (this.TheLayer.Dragging==false) // not creating something already
	{
		var ItemIndex=-1;
		
		var NewObject=null;
		
		switch (this.ObjectType)
		{
		case "Rectangle":
			NewObject=new CMItemRect(CMItemRect.RECTANGLE);
			ItemIndex=this.TheLayer.AddObject(NewObject);
			NewObject.SetControlBounds(RefX,RefX,RefY,RefY);
			break;
		case "RoundedRectangle":
			NewObject=new CMItemRect(CMItemRect.ROUNDED_RECTANGLE);
			ItemIndex=this.TheLayer.AddObject(NewObject);
			NewObject.SetControlBounds(RefX,RefX,RefY,RefY);
			break;
		case "Oval":
			NewObject=new CMItemRect(CMItemRect.OVAL);
			ItemIndex=this.TheLayer.AddObject(NewObject);
			NewObject.SetControlBounds(RefX,RefX,RefY,RefY);
			break;
		case "Curve":
			NewObject=new CMItemPoly();
			ItemIndex=this.TheLayer.AddObject(NewObject);
			
			var Xs=[RefX,RefX];
			var Ys=[RefY,RefY];
			NewObject.SetControlPoints(0,Xs,Ys);
			break;
		case "Arrow":
			NewObject=new CMItemPolyArrow();
			ItemIndex=this.TheLayer.AddObject(NewObject);
			
			var Xs=[RefX,RefX];
			var Ys=[RefY,RefY];
			NewObject.SetControlPoints(0,Xs,Ys);
			break;
		}
	
		this.TheLayer.TheItems[ItemIndex].StartCreating(RefX,RefY);
		this.TheLayer.TheItems[ItemIndex].SetSelected(true);
		
		this.TheLayer.SelectedItemIndex=ItemIndex;
		
		Used=true;
	}
	
	return(Used);
}
CMToolHandler.prototype.MouseMove=function(TheView,RefX,RefY) 
{
	return(false);
}
CMToolHandler.prototype.MouseUp=function(TheView,RefX,RefY) 
{
	return(false);
}

//******************************************************************
// CMLayerItems Constructor
//******************************************************************
function CMLayerItems() 
{
	CMLayer.call(this);

	this.TheItems=[]; // should be children jjg
	
	this.SelectedItemIndex=-1; // jjg remove?
	
	this.ToolGroupElement=null;
}

CMLayerItems.prototype=Object.create(CMLayer.prototype); // inherit prototype functions

CMLayerItems.prototype.contructor=CMLayerItems; // override the constructor to go to ours

//******************************************************************
// CMLayerItems private functions
//******************************************************************
/**
* @private
*/
CMLayerItems.prototype.Unselected=function() 
{
	if (this.ToolGroupElement!=null)
	{
		var TheCanvasMap=this.GetParent(CMMainContainer);
		var TheToolPanel=TheCanvasMap.GetToolPanel();
		
		TheToolPanel.RemoveTool("CMLayerObjects_RectImage");
		TheToolPanel.RemoveTool("CMLayerObjects_RoundedRectImage");
		TheToolPanel.RemoveTool("CMLayerObjects_OvalImage");
		TheToolPanel.RemoveTool("CMLayerObjects_CurveImage");
		TheToolPanel.RemoveTool("CMLayerObjects_ArrowImage");
		
		TheToolPanel.RemoveToolGroupElement(this.ToolGroupElement);
		this.ToolGroupElement=null;
		
		var TheView=TheCanvasMap.GetView();
		
		TheView.SetToolHandler(null);
	}
}

//******************************************************************
// CMBase Functions
//******************************************************************
CMLayerItems.prototype.GetNumChildren=function() 
{
	return(this.TheItems.length);
}
CMLayerItems.prototype.GetChild=function(Index) 
{
	return(this.TheItems[Index]);
}
// override the layer UnselectAll() function
CMLayerItems.prototype.CMLayer_UnselectAll=CMLayer.prototype.UnselectAll;

CMLayerItems.prototype.UnselectAll=function(SendMessage) 
{
	this.CMLayer_UnselectAll(SendMessage);
	
	for (var i=0;i<this.TheItems.length;i++)
	{
		this.TheItems[i].UnselectAll(SendMessage);
	}
	this.Unselected();
}
CMLayerItems.prototype.CMLayer_SetSelected=CMLayer.prototype.SetSelected;

CMLayerItems.prototype.SetSelected=function(New) 
{
	if (New!=this.GetSelected()) // selection has changed
	{
		this.CMLayer_SetSelected(New);

		var TheCanvasMap=this.GetParent(CMMainContainer);
		var TheToolPanel=TheCanvasMap.GetToolPanel();
		
		if (New)
		{
			//if (this.ToolGroupElement==null)
			{
				// add the rect tool
				
				var RectTool=TheToolPanel.AddTool("CMLayerObjects_RectImage",TheCanvasMap.ImageFolder+"Icon_Rect_Default.png",
					TheCanvasMap.ImageFolder+"Icon_Rect_Selected.png");
				
				CMLayerItems.SetupTool(RectTool,this,"Rectangle");
				
				// add the rRoundRectTool
				
				var RoundRectTool=TheToolPanel.AddTool("CMLayerObjects_RoundedRectImage",TheCanvasMap.ImageFolder+"Icon_RoundedRect_Default.png",
					TheCanvasMap.ImageFolder+"Icon_RoundedRect_Selected.png");
				
				CMLayerItems.SetupTool(RoundRectTool,this,"RoundedRectangle");
				
				// add the oval
				
				var OvalTool=TheToolPanel.AddTool("CMLayerObjects_OvalImage",TheCanvasMap.ImageFolder+"Icon_Oval_Default.png",
					TheCanvasMap.ImageFolder+"Icon_Oval_Selected.png");
				
				CMLayerItems.SetupTool(OvalTool,this,"Oval");
				
				// add the curve tool
				
				var CurveTool=TheToolPanel.AddTool("CMLayerObjects_CurveImage",TheCanvasMap.ImageFolder+"Icon_Curve_Default.png",
					TheCanvasMap.ImageFolder+"Icon_Curve_Selected.png");
				
				CMLayerItems.SetupTool(CurveTool,this,"Curve");
				
				// add the arrow tool
				
				var ArrowTool=TheToolPanel.AddTool("CMLayerObjects_ArrowImage",TheCanvasMap.ImageFolder+"Icon_Arrow_Default.png",
					TheCanvasMap.ImageFolder+"Icon_Arrow_Selected.png");
				
				CMLayerItems.SetupTool(ArrowTool,this,"Arrow");
				
				this.ToolGroupElement=TheToolPanel.MakeToolGroup([RectTool,RoundRectTool,OvalTool,CurveTool,ArrowTool]);
			}
			//else
			{
				//TheToolPanel.AddToolGroupElement(this.ToolGroupElement);
			}
		}
		else // delete the tool from the tool bar
		{
			this.Unselected();
		}
		
	}
}
/**
* Sets up a tool to be displayed in the menu bar
* @private
*/
CMLayerItems.SetupTool=function(TheTool,TheLayer,ObjectType)
{
	TheTool.TheLayer=TheLayer;
	TheTool.ObjectType=ObjectType;
	
	TheTool.Original_onclick=TheTool.onclick;
	
	TheTool.onclick=function() 
	{ 
		TheTool.Original_onclick();
		
		var TheCanvasMap=this.TheLayer.GetParent(CMMainContainer);
		var TheToolPanel=TheCanvasMap.GetToolPanel();
		
		// setup the tool handler in the view
		
		var TheView=TheCanvasMap.GetView();
		var TheToolHandler=new CMToolHandler(this.ObjectType);
		TheToolHandler.TheLayer=this.TheLayer;
		
		TheView.SetToolHandler(TheToolHandler);
	}
	TheTool.UnselectFunction=function()
	{
		var TheCanvasMap=this.TheLayer.GetParent(CMMainContainer);
		var TheView=TheCanvasMap.GetView();
		
		// reset the tool handler
		TheView.SetToolHandler(null);
	}

}
CMLayerItems.prototype.CMLayer_GetTimeSlices=CMLayer.prototype.GetTimes;

CMLayerItems.prototype.GetTimes=function(TheTimeSlices) 
{
	TheTimeSlices=this.CMLayer_GetTimeSlices(TheTimeSlices);
	
	for (var i=0;i<this.TheItems.length;i++)
	{
		TheTimeSlices=this.TheItems[i].GetTimes(TheTimeSlices);
	}
	return(TheTimeSlices);
}
//******************************************************************
// CMLayer Mouse event handling
//******************************************************************

/*
* returns the feature index for the coordinate in projected space
* returns -1 if the coordinate is not in a feature
*/
CMLayerItems.prototype.In=function(TheView,RefX,RefY) 
{
	var ItemIndex=-1;
	
	if ((this.IsVisible())&&(this.TheItems!=null))
	{
		var Tolerance=TheView.GetRefWidthFromPixelWidth(this.ClickTolerance);
		
			// Loop over the features
		for (var i=0;( i <this.TheItems.length)&&(ItemIndex==-1); i++) 
		{
			var Result=false;
			
			var Part=this.TheItems[i].InPart(TheView,RefX,RefY,3);
			
			if (Part!=-1) ItemIndex=i;
		}
	}
	return(ItemIndex);
};

CMLayerItems.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	if ((this.IsVisible())&&(this.GetClickable())) // check if we where clicked in
	{
/*		if ((Used==false)&&(this.Creating))
		{
			var TheItem=this.TheItems[this.SelectedItemIndex];
			
			var NumPoints=TheItem.Xs.length;
			
			if (TheEvent.detail==2) // double click
			{
				this.Creating=false;
				this.Dragging=false;
				TheItem.Xs.pop(); // remove the last point which was added by the second button click
				TheItem.Ys.pop(); // remove the last point which was added by the second button click
			}
			else // add a point
			{
				TheItem.Xs.splice(NumPoints-1,0,RefX);
				TheItem.Ys.splice(NumPoints-1,0,RefY);
			}
			Used=true;
			this.Repaint();
		}
*/		if ((Used==false)&&((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT)))
		{
			var ItemIndex=this.In(TheView,RefX,RefY);
			
			if (ItemIndex!=-1)
			{
				this.TheItems[ItemIndex].MouseDown(TheView,RefX,RefY,TheEvent);
				
				if (this.TheItems[ItemIndex].GetSelected())
				{
					this.SelectedItemIndex=ItemIndex;
					Used=true;
				}
/*				this.Dragging=true;
				this.SelectedPart=this.InPart(TheView,RefX,RefY,ItemIndex);
				this.SetAnchor(RefX,RefY,ItemIndex,this.SelectedPart) ;
				this.SelectedItemIndex=ItemIndex;
*/				
			}
		}
	}
	return(Used);
};
CMLayerItems.prototype.MouseMove=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	if (this.Clickable)
	{
		for (var i=0;( i <this.TheItems.length)&&(Used==false); i++) 
		{
			var Result=false;
			
			if (this.TheItems[i].GetSelected())
			{
				Used=this.TheItems[i].MouseMove(TheView,RefX,RefY,TheEvent);
			}
		}
	}
	return(Used);
};
CMLayerItems.prototype.MouseUp=function(TheView,RefX,RefY,TheEvent)
{
	var Used=false;
	
	if (this.Clickable)
	{
		for (var i=0;( i <this.TheItems.length)&&(Used==false); i++) 
		{
			var Result=false;
			
			if (this.TheItems[i].GetSelected())
			{
				Used=this.TheItems[i].MouseUp(TheView,RefX,RefY,TheEvent);
			}
		}
	}
	return(Used);
};

CMLayerItems.prototype.ShowInfoWindow=function(FeatureIndex,TheView,RefX,RefY) 
{
	var TheFeatures=this.TheData.features;

	var TheFeature=TheFeatures[FeatureIndex];
	
	var Properties=TheFeature.properties;
	
	var TheHTML=this.GetFeatureSetting("Layer","InfoText",FeatureIndex,null);
	
	if (TheHTML!=null)
	{
		var InfoWindow=TheView.CreateInfoWindow("CMLayerItems.InfoWindow",RefX,RefY,this.GetInfoWindowWidth(),30,TheHTML);
		
		CMMainContainer.SetPopupWindow(InfoWindow);
	}
};

//******************************************************************
// CMLayerItems Painting Functions
//******************************************************************
/*
* Paints a layer into the canvas
* This is a little complicated because the geometries can contain
* polylines, polygons or points. 
*/
CMLayerItems.prototype.Paint=function(TheView) 
{
	if ((this.GetVisible())&&(this.TheItems!=null))
	{
		this.GetCanvasMap().AddToDebugPanel(this.GetName()+" Starting Paint:"+CMUtilities.GetSeconds());
		
		var TheStyle=this.GetStyle(TheView);
		
		if (TheStyle!=undefined) TheView.SetStyle(TheStyle);
			
		for (var i=0;i<this.TheItems.length;i++)
		{
			var TheObject=this.TheItems[i];
			
			TheObject.Paint(TheView);
		}
		if (TheStyle!=undefined) TheView.RestoreStyle();
		
		this.GetCanvasMap().AddToDebugPanel(this.GetName()+" Leaving Paint:"+CMUtilities.GetSeconds());
	}
}
/*
* Paints a layer into the canvas
* This is a little complicated because the geometries can contain
* polylines, polygons or points. 
*/
CMLayerItems.prototype.PaintSelected=function(TheView) 
{
	if (this.GetVisible())
	{
		// paint the mouse over if any
		
		TheView.SaveStyle();
		
		for (var i=0;i<this.TheItems.length;i++)
		{
			var TheItem=this.TheItems[i];
			
			TheItem.PaintSelected(TheView);
		}

		TheView.RestoreStyle(); 
	}
}

//******************************************************************
// Public CMLayerItems functions
//******************************************************************

CMLayerItems.prototype.AddObject=function(TheObject) 
{
	this.TheItems.push(TheObject);
	TheObject.SetParent(this);
	this.Repaint();
	
	this.GetParent(CMScene).LayerContentChanged(this);
	
	return(this.TheItems.length-1);
}
