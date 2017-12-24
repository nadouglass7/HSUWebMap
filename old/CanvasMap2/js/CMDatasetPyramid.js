//******************************************************************
// CMDatasetPyramid Class
//******************************************************************
//******************************************************************
// Global Variables
//******************************************************************

//******************************************************************
// CMDatasetPyramid Constructor
//******************************************************************
function CMDatasetPyramid() 
{
	CMDataset.call(this);

	// move to CMDataset
	
	//this.SelectedFeatureIndex=-1;
	
	// these stay
	
	this.Attributes=null; // implemented differently here than in the GeoJSON code
	this.HeadingIndex=-1; // index into the headings array (found from HTMLAttribute in parent);
	
	this.TileWidthInPixels=256;
	
	this.PaintDebugTileInfo=false;
	this.DebugZoomLevel=-1;
	this.DebugGlobalColumn=0;
	this.DebugGlobalRow=0;
	
	this.Bounds=null;
}
CMDatasetPyramid.prototype=Object.create(CMDataset.prototype); // inherit prototype functions from PanelBase()

CMDatasetPyramid.prototype.contructor=CMDatasetPyramid; // override the constructor to go to ours

//******************************************************************
// Functions used by subclasses and not overriden
//*****************************************************************
CMDatasetPyramid.prototype.SetDebugTile=function(ZoomLevel,GlobalColumn,GlobalRow) 
{
	this.PaintDebugTileInfo=true;
	this.DebugZoomLevel=ZoomLevel;
	this.DebugGlobalColumn=GlobalColumn;
	this.DebugGlobalRow=GlobalRow;
}

/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
*/
CMDatasetPyramid.prototype.SetURL=function(URL,ZoomToBounds) 
{
	this.URL=URL;
	this.ZoomToBounds=ZoomToBounds;
	
	var URL=this.URL+"Info.js";

	var TheRequest=new XMLHttpRequest();
	
	TheRequest.open("GET",URL,true);
	TheRequest.TheURL=URL;
	TheRequest.TheDataset=this;
			
	TheRequest.onreadystatechange=function() 
	{
		if( this.readyState == 4)  // done
		{
			if( this.status == 200) // OK
			{
				var TheText=this.responseText;

				var TheInfo=JSON.parse(TheText);
				
				//*******************
				
				if (this.TheDataset.GetName()===null) this.TheDataset.SetName(TheInfo.Title);
				
				var TheBounds = TheInfo.Bounds;
				this.TheDataset.SetBounds(TheBounds);
				
				this.TheDataset.OriginalBounds=TheInfo.OriginalBounds;
				
				this.TheDataset.Attributes=TheInfo.Attributes;
				
				this.TheDataset.TileRefWidth=TheInfo.TileRefWidth;
				this.TheDataset.MinColumn=Math.round(TheInfo.MinColumn) ;
				this.TheDataset.MaxColumn=Math.round(TheInfo.MaxColumn) ;
				this.TheDataset.NumColumns=Math.round(TheInfo.NumColumns) ;
				this.TheDataset.MinRow=Math.round(TheInfo.MinRow) ;
				this.TheDataset.MaxRow=Math.round(TheInfo.MaxRow) ;
				this.TheDataset.NumRows=Math.round(TheInfo.NumRows) ;
			
				this.TheDataset.TopZoomLevel=Math.round(TheInfo.TopZoomLevel) ;
				
				//*******************
				
				this.TheDataset.Tiles=[];
			
				var TheMainContainer=this.TheDataset.GetParent(CMMainContainer);
				
				var TheView=TheMainContainer.GetScene().GetView(0); // jjg= fix later
				
				for (Row=0;Row<this.TheDataset.NumRows;Row++)
				{
					this.TheDataset.Tiles[Row]=[];
						
					for (Column=0;Column<this.TheDataset.NumColumns;Column++)
					{
						var GlobalRow=this.TheDataset.MaxRow-Row;
						var GlobalColumn=Column+this.TheDataset.MinColumn;
						var ZoomLevel=this.TheDataset.TopZoomLevel;
						
						this.TheDataset.Tiles[Row][Column]=new CMTile(this.TheDataset,ZoomLevel,GlobalColumn,GlobalRow);
						
						if (this.PaintDebugTileInfo) TheChildTile.SetPaintTileInfo(this.PaintDebugTile);
						
						this.TheDataset.Tiles[Row][Column].LoadTile(TheView);
					}
				}
				//*******************
				if (this.TheDataset.ZoomToBounds)
				{
					TheView.ZoomToBounds(this.TheDataset.GetBounds());
				}
				this.TheDataset.GetParent(CMScene).Repaint(); 
				
				if (this.TheDataset.OnLoad!=null)  { this.TheDataset.OnLoad(); };
				
//				this.TheDataset.GetParent(CMScene).Repaint(); 
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
CMDatasetPyramid.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
//	if (this.GetVisible())//&&(this.TheData!=null))
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
CMDatasetPyramid.prototype.GetHeadingIndex=function()
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
CMDatasetPyramid.prototype.ShowInfoWindow=function(FeatureIndex,TheView,RefX,RefY) 
{
	if (this.HTMLAttribute!=null)
	{
		this.GetHeadingIndex();
		
		var TheColumn=this.Attributes.Values[this.HeadingIndex]; // jjg - need to reconcild headings with column indexes
		var TheHTML=TheColumn[FeatureIndex];
		
		var InfoWindow=TheView.CreateInfoWindow("CMDatasetPyramid.InfoWindow",RefX,RefY,200,30,TheHTML);
		
		CMMainContainer.SetPopupWindow(InfoWindow);
	}
}

CMDatasetPyramid.prototype.MouseDown=function(TheView,RefX,RefY) 
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
// Private functions
//**************************************************************
CMDatasetPyramid.prototype.SetBounds=function(NewBounds) 
{
	this.TheBounds=NewBounds;
}

//**************************************************************
// CMDataset Attribute functions
//**************************************************************
CMDatasetPyramid.prototype.GetNumAttributeRows=function() 
{ 
	var Result=0;
	if (this.Attributes!=null)
	{
		Result=this.Attributes.Values[0].length;
	}
	return(Result); 
}
CMDatasetPyramid.prototype.GetNumAttributeColumns=function() 
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
CMDatasetPyramid.prototype.GetAttributeHeading=function(ColumnIndex) 
{ 
	var Result="";
	if (this.Attributes!=null)
	{
		Result=this.Attributes.Headings[ColumnIndex];
	}
	return(Result); 
}
CMDatasetPyramid.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) 
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
/*CMDatasetPyramid.prototype.SetSelectedFeature=function(New) 
{
	if (New!=this.SelectedFeatureIndex) 
	{
		this.SelectedFeatureIndex=New;
		this.GetScene().Repaint();
	}
}*/
/*CMDatasetPyramid.prototype.CMDataset_UnselectAll=CMDataset.prototype.UnselectAll;

CMDatasetPyramid.prototype.UnselectAll=function(SendMessageFlag) 
{
	this.CMDataset_UnselectAll(SendMessageFlag);
	
	if (this.SelectedFeatureIndex!=-1) 
	{
		this.SelectedFeatureIndex=-1;
		
		if (SendMessageFlag) // call the scene to let everyone know the selection changed
		{
			// call the scene to let everyone know the selection changed
			var TheScene=this.GetParent(CMScene);
			TheScene.SelectionChanged(this);
		}
	}
}*/
/**
* Gets the bounds for a specific feature, if any
*/
CMDatasetPyramid.prototype.GetFeatureBounds=function(FeatureIndex) 
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
CMDatasetPyramid.prototype.Paint=function(TheLayer,TheView,SelectedOnly,MouseOverOnly) 
{
	if ((this.NumRows!=undefined)&&(SelectedOnly==false)&&((MouseOverOnly==undefined)||(MouseOverOnly==false)))
	{
		this.GetParent(CMMainContainer).AddToDebugPanel(this.GetName()+" Starting Paint:"+CMUtilities.GetSeconds());
		
//		var TheStyle=this.GetStyle(TheView);
		
//		if (TheStyle!=undefined) TheView.SetStyle(TheStyle);
		
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		for (var Row=0;Row<this.NumRows;Row++)
		{
			for (Column=0;Column<this.NumColumns;Column++)
			{
				var TheTile=this.Tiles[Row][Column];
				
				TheTile.PaintTile(TheLayer,TheView,SelectedOnly,this.TileRefWidth);
			}
		}
//		if (TheStyle!=undefined) TheView.RestoreStyle();

		this.GetParent(CMMainContainer).AddToDebugPanel(this.GetName()+" Leaving Paint:"+CMUtilities.GetSeconds());
		
	}
}
//******************************************************************
// Searching
//******************************************************************

/*
* Requests search results from a layer.  The scene calls this function
* @protected
*/
CMDatasetPyramid.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
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
