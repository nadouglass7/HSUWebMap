//******************************************************************
// CMLayerPyramid Class
//******************************************************************
//******************************************************************
// Global Variables
//******************************************************************

// object reference for the balloon if it is displayed
CMLayerPyramid.InfoWindow=null;

//******************************************************************
// CMLayerGeoJSON Constructor
//******************************************************************
function CMLayerPyramid() 
{
	// move to CMLayer
	
	this.SelectedFeatureIndex=-1;
	
	// these stay
	
	this.Attributes=null; // implemented differently here than in the GeoJSON code
	this.HeadingIndex=-1; // index into the headings array (found from HTMLAttribute in parent);
	
	this.TileWidthInPixels=256;
	
	this.PaintDebugTile=false;
	this.DebugZoomLevel=-1;
	this.DebugGlobalColumn=0;
	this.DebugGlobalRow=0;
}
CMLayerPyramid.prototype=new CMLayer(); // inherit prototype functions from PanelBase()

CMLayerPyramid.prototype.contructor=CMLayerPyramid; // override the constructor to go to ours
//******************************************************************
// CMLayer Functions
//*****************************************************************

CMLayerPyramid.prototype.HasSettingsDialog=function() 
{
	return(true);
}
//******************************************************************
// Functions used by subclasses and not overriden
//*****************************************************************
CMLayerPyramid.prototype.SetDebugTile=function(ZoomLevel,GlobalColumn,GlobalRow) 
{
	this.PaintDebugTile=true;
	this.DebugZoomLevel=ZoomLevel;
	this.DebugGlobalColumn=GlobalColumn;
	this.DebugGlobalRow=GlobalRow;
}

/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
*/
CMLayerPyramid.prototype.SetURL=function(URL,NewView,ZoomToBounds) 
{
	this.URL=URL;
	this.TheView=NewView;
	this.ZoomToBounds=ZoomToBounds;
	
	this.ZoomLevel=0;
	var URL=this.URL+"Info.js";

	var TheRequest=new XMLHttpRequest();
	
	TheRequest.open("GET",URL,true);
	TheRequest.TheView=NewView;
	TheRequest.TheURL=URL;
	TheRequest.TheLayer=this;
			
	TheRequest.onreadystatechange=function() 
	{
		if( this.readyState == 4)  // done
		{
//			alert("status="+this.status);
			if( this.status == 200) // OK
			{
				var TheText=this.responseText;

				var TheInfo=JSON.parse(TheText);
				
				//*******************
				
				this.TheLayer.SetName(TheInfo.Title);
				
				var TheBounds = TheInfo.Bounds;
				this.TheLayer.SetBounds(TheBounds);
				
				this.TheLayer.OriginalBounds=TheInfo.OriginalBounds;
				
				this.TheLayer.Attributes=TheInfo.Attributes;
				
				this.TheLayer.TileRefWidth=TheInfo.TileRefWidth;
				this.TheLayer.MinColumn=Math.round(TheInfo.MinColumn) ;
				this.TheLayer.MaxColumn=Math.round(TheInfo.MaxColumn) ;
				this.TheLayer.NumColumns=Math.round(TheInfo.NumColumns) ;
				this.TheLayer.MinRow=Math.round(TheInfo.MinRow) ;
				this.TheLayer.MaxRow=Math.round(TheInfo.MaxRow) ;
				this.TheLayer.NumRows=Math.round(TheInfo.NumRows) ;
			
				//*******************
				
				this.TheLayer.Tiles=[];
				
	//			var ZoomLevel=this.TheView.ZoomLevel+this.ZoomLevelOffset;
			
				for (Row=0;Row<this.TheLayer.NumRows;Row++)
				{
					this.TheLayer.Tiles[Row]=[];
						
					for (Column=0;Column<this.TheLayer.NumColumns;Column++)
					{
						var GlobalRow=this.TheLayer.MaxRow-Row;
						var GlobalColumn=Column+this.TheLayer.MinColumn;
						var ZoomLevel=this.TheLayer.ZoomLevel;
						
						this.TheLayer.Tiles[Row][Column]=new CMTile(this.TheLayer,ZoomLevel,GlobalColumn,GlobalRow);
						
						this.TheLayer.Tiles[Row][Column].LoadTile(this.TheView);
					}
				}
				//*******************
				if (this.TheLayer.ZoomToBounds)
				{
					this.TheView.ZoomToBounds(this.TheLayer.GetBounds());
				}
				this.TheLayer.Repaint(); 
				
				if (this.TheLayer.OnLoad!=null)  { this.TheLayer.OnLoad(); };
				
				this.TheLayer.Repaint(); 
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
}

//******************************************************************
// Mouse event handling
//******************************************************************
/*
* returns the feature index for the coordinate in projected space
* returns -1 if the coordinate is not in a feature
*/
CMLayerPyramid.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
	if (this.GetVisible())//&&(this.TheData!=null))
	{
		for (var Row=0;(Row<this.NumRows)&&(FeatureIndex==-1);Row++)
		{
			for (Column=0;(Column<this.NumColumns)&&(FeatureIndex==-1);Column++)
			{
				var TheTile=this.Tiles[Row][Column];
				
				FeatureIndex=TheTile.In(TheView,RefX,RefY);
			}
		}
	}
 	return(FeatureIndex);
};
CMLayerPyramid.prototype.GetHeadingIndex=function()
{
	if (this.HeadingIndex==-1)
	{
		for (var i=0;i<this.Attributes.Headings.length;i++)
		{
			var Heading=this.Attributes.Headings[i];
			
			if (Heading==this.HTMLAttribute)
			{
				this.HeadingIndex=i;
			}
		}
	}
}
/**
* Display the info window if the user clicked on a feature
*/
CMLayerPyramid.prototype.ShowInfoWindow=function(FeatureIndex,TheView,RefX,RefY) 
{
	if (this.HTMLAttribute!=null)
	{
		this.GetHeadingIndex();
		
		var TheColumn=this.Attributes.Values[this.HeadingIndex]; // jjg - need to reconcild headings with column indexes
		var TheHTML=TheColumn[FeatureIndex];
		
//		var InfoWindow=CMUtilities.CreateInfoWindow("CMLayerPyramid_InfoWindow",PixelX,PixelY,200,30,TheHTML);
		var InfoWindow=TheView.CreateInfoWindow("CMLayerPyramid_InfoWindow.InfoWindow",RefX,RefY,200,30,TheHTML);
		
		CanvasMap.SetPopupWindow(InfoWindow);
	}
}

CMLayerPyramid.prototype.MouseDown=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	if ((this.IsVisible())&&
		((TheView.GetTool()==CMView.TOOL_INFO)&&(TheView.GetTool()==CMView.TOOL_SELECT))) // check if we where clicked in
	{
		for (var Row=0;(Row<this.NumRows)&&(Used==false);Row++)
		{
			for (Column=0;(Column<this.NumColumns)&&(Used==false);Column++)
			{
				var TheTile=this.Tiles[Row][Column];
				
				Used=TheTile.MouseDown(TheView,RefX,RefY);
			}
		}
	}
	return(Used);
};
//**************************************************************
// Attribute functions
//**************************************************************
CMLayerPyramid.prototype.GetNumAttributeRows=function() 
{ 
	var Result=0;
	if (this.Attributes!=null)
	{
		Result=this.Attributes.Values[0].length;
	}
	return(Result); 
}
CMLayerPyramid.prototype.GetNumAttributeColumns=function() 
{ 
	var Result=0;
	if (this.Attributes!=null)
	{
		if (this.Attributes.Values.length>0)
		{
			Result=this.Attributes.Headings.length;
		}
	}
	return(Result); 
}
CMLayerPyramid.prototype.GetAttributeHeading=function(ColumnIndex) 
{ 
	var Result="";
	if (this.Attributes!=null)
	{
		Result=this.Attributes.Headings[ColumnIndex];
	}
	return(Result); 
}
CMLayerPyramid.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) 
{ 
	var Result="";
	if (this.Attributes!=null)
	{
		var TheColumn=this.Attributes.Values[ColumnIndex];
		Result=TheColumn[RowIndex];
	}
	return(Result); 
}
//******************************************************************
// Functions used by subclasses and not overriden
//******************************************************************
CMLayerPyramid.prototype.SetSelectedFeature=function(New) 
{
	if (New!=this.SelectedFeatureIndex) 
	{
		this.SelectedFeatureIndex=New;
		this.GetScene().Repaint();
	}
}
CMLayerPyramid.prototype.UnselectAll=function() 
{
	if (this.SelectedFeatureIndex!=-1) 
	{
		this.SelectedFeatureIndex=-1;
		this.GetScene().Repaint();
	}
}
/**
* Gets the bounds for a specific feature, if any
*/
CMLayerPyramid.prototype.GetFeatureBounds=function(FeatureIndex) 
{
	var Result=null;
	
	for (var Row=0;Row<this.NumRows;Row++)
	{
		for (Column=0;Column<this.NumColumns;Column++)
		{
			var TheTile=this.Tiles[Row][Column];
			
			Result=TheTile.AddToFeatureBounds(FeatureIndex,Result);
		}
	}
	return(Result);
}

//******************************************************************
// Painting
//******************************************************************
/*
* Paints a layer into the canvas
*/
CMLayerPyramid.prototype.Paint=function(TheView) 
{
	if (this.GetVisible())//&&(this.TheData!=null))
	{
		this.GetCanvasMap().AddToDebugPanel(this.GetName()+" Starting Paint:"+CMUtilities.GetSeconds());
		
		var TheStyle=this.GetStyle();
		
		if (TheStyle!=null) TheView.SetStyle(TheStyle);
		
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		for (var Row=0;Row<this.NumRows;Row++)
		{
			for (Column=0;Column<this.NumColumns;Column++)
			{
				var TheTile=this.Tiles[Row][Column];
				
				TheTile.PaintTile(TheView,this.TileRefWidth);
			}
		}
/*		if (this.SelectedFeatureIndex!=-1)
		{
			var TheGeometry=TheFeatures[this.SelectedFeatureIndex].geometry;
			
			TheContext.fillStyle="#ff0000";
			
			TheView.PaintRefGeometry(TheGeometry);
		}
*/		if (TheStyle!=null) TheView.RestoreStyle();

		this.GetCanvasMap().AddToDebugPanel(this.GetName()+" Leaving Paint:"+CMUtilities.GetSeconds());
		
	}
}
//******************************************************************
// Searching
//******************************************************************

/*
* Requests search results from a layer.  The scene calls this function
*
*/
CMLayerPyramid.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
	var TheText="";
	
	if ((this.GetVisible())&&(this.Attributes!=null))
	{
		var NumRows=this.GetNumAttributeRows();
		var NumColumns=this.GetNumAttributeColumns();
		
		// draw each feature
		for (var ColumnIndex=0;ColumnIndex < NumColumns; ColumnIndex++) 
		{
			var TheColumn=this.Attributes.Values[ColumnIndex];
			
			for (var RowIndex=0;RowIndex < NumRows; RowIndex++) 
			{
				var TheValue=TheColumn[RowIndex];
				
				TheValue=TheValue.toLowerCase();
				
				if (TheValue.indexOf(SearchPhrase)!=-1)
				{
					var ThisResult=document.createElement("DIV");
					ThisResult.innerHTML=TheColumn[RowIndex];
					
					ThisResult.TheLayer=this;
					ThisResult.FeatureIndex=RowIndex;
					
					ThisResult.onclick=function()
					{
						this.TheLayer.TheScene.UnselectAll();
						this.TheLayer.SetSelectedFeature(this.FeatureIndex);
						
						var TheBounds=this.TheLayer.GetFeatureBounds(this.FeatureIndex);
						var TheView=this.TheLayer.TheScene.GetView(0);
						
						this.className="CM_SearchResultSelected";
						
						TheView.ZoomToBounds(TheBounds);
					}
					ResultsPanel.appendChild(ThisResult);
				}
				
			}
		}
	}
	return(TheText);
}
