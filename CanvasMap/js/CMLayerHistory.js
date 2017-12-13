//******************************************************************
// CMLayerHistory Class
//******************************************************************
var TheThings=
[
 	{ // 0
	 	Name:"Alexander von Humboldt",
		StartDate: 1769-09-14,
		EndDate: 1859-05-06,
	 },
	 {
		 Name:"Frances Drake",
		 StartDate: 2001-01-01,
		 EndDate:2001-01-01,
	 }
];

var SpatialData=
[
 	{ // 0
		Longitude: -120,
	 	Latitude: 40
	 },
	 {
		Longitude: 0,
		Latitude:0
	 }
]

var RelThingsToSpatialData=
[
 	[0,0], // humboldt to arcata
	[1,1] // drake to africa
];

//******************************************************************
// CMLayerHistory_ToolHandler (move later?)
//******************************************************************

function CMLayerHistory_ToolHandler(ObjectType)
{
	this.ObjectType=ObjectType;
} 
CMLayerHistory_ToolHandler.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
//	if (this.TheLayer.Dragging==false) // not creating something already
	{
		var ItemIndex=-1;
		
		var NewObject=null;
		
		switch (this.ObjectType)
		{
		case "Rectangle":
			ItemIndex=this.TheLayer.AddPoint(RefX,RefY);
			break;
		}
	
		this.TheLayer.SelectedIndex=ItemIndex;
		
		Used=true;
	}
	
	return(Used);
}
CMLayerHistory_ToolHandler.prototype.MouseMove=function(TheView,RefX,RefY) 
{
	return(false);
}
CMLayerHistory_ToolHandler.prototype.MouseUp=function(TheView,RefX,RefY) 
{
	return(false);
}
//****************************************************************
// Web service calls
//**************************************************************** 
function GetData()
{
	var URL="http://localhost/cwis438/includes/canvasmap/History/WebService.py?id=12&test=122"
	
	var TheRequest=new XMLHttpRequest(); // wait staff at the resturant
	TheRequest.open("GET",URL,true); // the URL is what we ordered
	TheRequest.TheURL=URL;
	TheRequest.TheDataset=this;
			
	TheRequest.onreadystatechange=function() 
	{
		if( this.readyState == 4)  // done
		{
//			alert("status="+this.status);
			if( this.status == 200) // OK
			{
				var TheText=TheRequest.responseText;

				var TheGeoJSONObject=JSON.parse(TheText);
				
				var j=12;
				// project the data if needed
				
/*				var TheProjector=this.TheDataset.GetProjector();
				
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
				// repaint last so the layer has the chance to chagne the painting settings
	*/			this.TheDataset.GetParent(CMScene).Repaint(); 
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
};
//******************************************************************
// CMLayerHistory Constructor
//******************************************************************
function CMLayerHistory() 
{
	CMLayer.call(this);

	this.TheItems=[]; // should be children jjg
	
	this.SelectedIndex=-1; // jjg remove?
	
	this.ToolGroupElement=null;
	
	this.TheProjector=new CMProjectorGoogleMaps();
	this.TheProjector.SetZoomLevel(18);
	
	this.ToolGroupElement=null;
	
}

CMLayerHistory.prototype=Object.create(CMLayerDataset.prototype); // inherit prototype functions

CMLayerHistory.prototype.contructor=CMLayerHistory; // override the constructor to go to ours

//******************************************************************
// CMLayerHistory private functions
//******************************************************************
/**
* @private
*/
CMLayerHistory.prototype.Unselected=function() 
{
	if (this.ToolGroupElement!=null)
	{
		var TheCanvasMap=this.GetParent(CMMainContainer);
		var TheToolPanel=TheCanvasMap.GetToolPanel();
		
		TheToolPanel.RemoveTool("CMLayerObjects_RectImage");
		
		TheToolPanel.RemoveToolGroupElement(this.ToolGroupElement);
		this.ToolGroupElement=null;
		
		var TheView=TheCanvasMap.GetView();
		
		TheView.SetToolHandler(null);
	}
}

//******************************************************************
// CMBase Functions
//******************************************************************
CMLayerHistory.prototype.GetNumChildren=function() 
{
	return(this.TheItems.length);
}
CMLayerHistory.prototype.GetChild=function(Index) 
{
	return(this.TheItems[Index]);
}
// override the layer UnselectAll() function
CMLayerHistory.prototype.CMLayer_UnselectAll=CMLayer.prototype.UnselectAll;

CMLayerHistory.prototype.UnselectAll=function(SendMessage) 
{
	this.CMLayer_UnselectAll(SendMessage);
	
	for (var i=0;i<this.TheItems.length;i++)
	{
		this.TheItems[i].UnselectAll(SendMessage);
	}
	this.Unselected();
}
CMLayerHistory.prototype.CMLayer_SetSelected=CMLayer.prototype.SetSelected;

CMLayerHistory.prototype.SetSelected=function(New) 
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
				
				CMLayerHistory.SetupTool(RectTool,this,"Rectangle");
				
				//
				
				this.ToolGroupElement=TheToolPanel.MakeToolGroup([RectTool]);
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
CMLayerHistory.SetupTool=function(TheTool,TheLayer,ObjectType)
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
		var TheToolHandler=new CMLayerHistory_ToolHandler(this.ObjectType);
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
CMLayerHistory.prototype.CMLayer_GetTimeSlices=CMLayer.prototype.GetTimes;

CMLayerHistory.prototype.GetTimes=function(TheTimeSlices) 
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
CMLayerHistory.prototype.In=function(TheView,RefX,RefY) 
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

CMLayerHistory.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
//	if ((this.IsVisible())&&(this.GetClickable())) // check if we where clicked in
	{
		//var Result=this.TheProjector.ProjectToGeographic(RefX,RefY);
		
		var Tolerance=TheView.GetRefWidthFromPixelWidth(8);
		
		var Used=false;
		for (var i=0;(i<SpatialData.length)&&(Used==false);i++)
		{
			var Latitude=SpatialData[i].Latitude;
			var Longitude=SpatialData[i].Longitude;
			
			var Result=this.TheProjector.ProjectFromGeographic(Longitude,Latitude);
			
			var Easting=Result.Easting;
			var Northing=Result.Northing;
			
			if ((Math.abs(Easting-RefX)<Tolerance)&&(Math.abs(Northing-RefY)<Tolerance))
			{
				var TheElement=document.getElementById("HistoryPanel");
				
				var TheHTML="";
				for (var j=0;j<RelThingsToSpatialData.length;j++)
				{
					if (RelThingsToSpatialData[j][0]==i)
					{
						var ThingIndex=RelThingsToSpatialData[j][1];
						
						TheHTML+=TheThings[ThingIndex].Name;
					}
				}
				
				TheElement.innerHTML=TheHTML;
				Used=true;
			}
		}
		
	}
	return(Used);
};
/*		if ((Used==false)&&(this.Creating))
		{
			var TheItem=this.TheItems[this.SelectedIndex];
			
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
*//*		if ((Used==false)&&((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT)))
		{
			var ItemIndex=this.In(TheView,RefX,RefY);
			
			if (ItemIndex!=-1)
			{
				this.TheItems[ItemIndex].MouseDown(TheView,RefX,RefY,TheEvent);
				
				if (this.TheItems[ItemIndex].GetSelected())
				{
					this.SelectedIndex=ItemIndex;
					Used=true;
				}
*//*				this.Dragging=true;
				this.SelectedPart=this.InPart(TheView,RefX,RefY,ItemIndex);
				this.SetAnchor(RefX,RefY,ItemIndex,this.SelectedPart) ;
				this.SelectedIndex=ItemIndex;
*/				
	//		}
//		}

CMLayerHistory.prototype.MouseMove=function(TheView,RefX,RefY,TheEvent) 
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
CMLayerHistory.prototype.MouseUp=function(TheView,RefX,RefY,TheEvent)
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

CMLayerHistory.prototype.ShowInfoWindow=function(FeatureIndex,TheView,RefX,RefY) 
{
	var TheFeatures=this.TheData.features;

	var TheFeature=TheFeatures[FeatureIndex];
	
	var Properties=TheFeature.properties;
	
	var TheHTML=this.GetFeatureSetting("Layer","InfoText",FeatureIndex,null);
	
	if (TheHTML!=null)
	{
		var InfoWindow=TheView.CreateInfoWindow("CMLayerHistory.InfoWindow",RefX,RefY,this.GetInfoWindowWidth(),30,TheHTML);
		
		CMMainContainer.SetPopupWindow(InfoWindow);
	}
};

//******************************************************************
// CMLayerHistory Painting Functions
//******************************************************************
/*
* Paints a layer into the canvas
* This is a little complicated because the geometries can contain
* polylines, polygons or points. 
*/
CMLayerHistory.prototype.Paint=function(TheView) 
{
	if ((this.IsVisible()))//&&(this.TheItems!=null))
	{
		this.GetCanvasMap().AddToDebugPanel(this.GetName()+" Starting Paint:"+CMUtilities.GetSeconds());
		
		var TheStyle=this.GetStyle(TheView);
		
		if (TheStyle!=undefined) TheView.SetStyle(TheStyle);
			
		for (var i=0;i<SpatialData.length;i++)
		{
			var Latitude=SpatialData[i].Latitude;
			var Longitude=SpatialData[i].Longitude;
			
			var Result=this.TheProjector.ProjectFromGeographic(Longitude,Latitude);
			
			var Easting=Result.Easting;
			var Northing=Result.Northing;
			
			TheView.PaintRefCircle(Easting,Northing,4);
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
CMLayerHistory.prototype.PaintSelected=function(TheView) 
{
	if (this.IsVisible())
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
// Public CMLayerHistory functions
//******************************************************************

CMLayerHistory.prototype.AddPoint=function(RefX,RefY) 
{
	
	var Result=this.TheProjector.ProjectToGeographic(RefX,RefY);
	
	var TheObject=
	{
		Longitude:Result.Longitude,
		Latitude:Result.Latitude
	}
	
	SpatialData.push(TheObject);
	
	this.GetParent(CMScene).LayerContentChanged(this);
	
	return(SpatialData.length-1);
}
