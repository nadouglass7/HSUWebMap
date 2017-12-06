//******************************************************************
// CMTile Class
//******************************************************************
//******************************************************************
// Constants
//******************************************************************

// Definitions for the corners for polygons drawn in the tile

CMTile.UPPER_RIGHT=-1;
CMTile.LOWER_RIGHT=-2;
CMTile.LOWER_LEFT=-3;
CMTile.UPPER_LEFT=-4;

//******************************************************************
// Global Variables
//******************************************************************

// A count of the total number of tiles that have been loaded for debugging and performance monitoring
CMTile.NumTilesLoaded=0;

//******************************************************************
// Tile Constructor
//******************************************************************
function CMTile(TheDataset,ZoomLevel,GlobalColumn,GlobalRow)
{
	this.GlobalRow=GlobalRow;
	this.GlobalColumn=GlobalColumn;
	this.ZoomLevel=ZoomLevel;

	this.TheData=null; // vector data
	this.TheRaster=null; // raster data
	this.TheRasterRequest=null;
	
	this.ChildTiles=null;
	this.TheDataset=TheDataset;
	
	this.LoadStatus=CMDataset.LOAD_STATUS_NONE;
	this.TheRequest=null;
	
	this.PaintTileInfo=false; // for debugging
}
//******************************************************************
// Public functions
//******************************************************************

/**
* Override the function for obtaining tiles.
* Create a single image tile and attempt to load it
* @public
*/
CMTile.prototype.LoadTile=function(TheView) 
{
	var FileName="Tiles_"+this.ZoomLevel+"/"+(this.GlobalColumn)+"/"+(this.GlobalRow)+".js";
	
	this.TheDataset.GetParent(CMMainContainer).AddToDebugPanel(this.TheDataset.GetName()+" Requesting tile "+FileName+", "+CMUtilities.GetSeconds());
	var URL=this.TheDataset.URL+FileName;

	var TheRequest=new XMLHttpRequest();
	
	this.TheRequest=TheRequest;
	
	TheRequest.open("GET",URL,true);
	TheRequest.TheView=TheView;
	TheRequest.TheURL=URL;
	TheRequest.TheDataset=this.TheDataset;
	TheRequest.TheTile=this;
	TheRequest.FileName=FileName;
	
	this.LoadStatus=CMDataset.LOAD_STATUS_LOADING;
	
	TheRequest.onreadystatechange=function() 
	{
		if( this.readyState == 4)  // done
		{
//			alert("status="+this.status);
			if( this.status == 200) // OK
			{
				// get the response text and parse it (text contains the information for the tile)
				
				var TheText=this.responseText;

				var TheGeoJSONObject=JSON.parse(TheText);
				
/*				var TheProjector=this.TheDataset.GetProjector();
//alert("TheProjector="+TheProjector);
				
				if (TheProjector!=null) 
				{
					TheProjector.ProjectGeoJSONFromGeographic(TheGeoJSONObject);
				}
	*/			
				// setup the tile with the specified data
				
				var TheTile=this.TheTile; // get the tile just to make the code more readable
				
				CMTile.NumTilesLoaded++; // keep track of the total number of tiles loaded
				
				TheTile.TheData=TheGeoJSONObject; // gset the data from the server into the tile
				
				// we are now loaded and ready to be painted
				
				TheTile.LoadStatus=CMDataset.LOAD_STATUS_LOADED;

				if ("HaveRaster" in TheTile.TheData) // raster data
				{
					if (TheTile.TheData.HaveRaster) // has a png image
					{
						TheTile.LoadTileRaster(this.TheView); // try to immeidately load the raster
					}
				}
				// create the children, if any
				
				if (TheTile.TheData.NumChildTiles>0) // tile has children
				{
					for (var RowIndex=0;RowIndex<2;RowIndex++)
					{
						for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
						{
							// negative for one feature ID, >0 for mulitple and must load a child tile
							if (TheTile.TheData.ChildTiles[RowIndex][ColumnIndex]>0)
							{
								if (TheTile.ChildTiles==null) // initialize the array
								{
									TheTile.ChildTiles=[];
									TheTile.ChildTiles[0]=[null,null];
									TheTile.ChildTiles[1]=[null,null];
								}
								
								var ChildZoomLevel=TheTile.ZoomLevel+1;
								var ChildColumn=(TheTile.GlobalColumn*2)+ColumnIndex;
								var ChildRow=(TheTile.GlobalRow*2)+(1-RowIndex);
								
								// create the tile, loads are initiated on paint
								var TheChildTile=new CMTile(this.TheDataset,ChildZoomLevel,ChildColumn,ChildRow);
								
								if (this.PaintTileInfo) TheChildTile.SetPaintTileInfo(this.PaintTileInfo);
								
								TheTile.ChildTiles[RowIndex][ColumnIndex]=TheChildTile;
							}
						}
					}
				}
				// zoom to bounds if desired and repaint
				
				if (this.ZoomToBounds)
				{
					this.TheView.ZoomToBounds(this.TheDataset.GetBounds());
				}
				this.TheDataset.GetParent(CMMainContainer).AddToDebugPanel(this.TheDataset.GetName()+" Received tile "+this.FileName+" repainting:"+CMUtilities.GetSeconds());
				
				this.TheDataset.GetParent(CMScene).Repaint(); 
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
}
/**
* Function to load a single raster tile.  This is called when a tile with an associated raster
* file (PNG) is recieved.
* @private
*/
CMTile.prototype.LoadTileRaster=function(TheView) 
{
	var FileName="Tiles_"+this.ZoomLevel+"/"+(this.GlobalColumn)+"/"+(this.GlobalRow)+".png";

	// setup the new Image object to hold the raster (Image)
	
	this.TheRaster=new Image(); 
	this.TheRaster.TheTile=this;
	
	// set the URL of the image which will trigger the request
	
	var ZoomLevel=TheView.ZoomLevel+this.ZoomLevelOffset;
	
	var FileName="Tiles_"+this.ZoomLevel+"/"+(this.GlobalColumn)+"/"+(this.GlobalRow)+".png";
	
	var ThePath=this.TheDataset.URL+FileName;
	
	//this.TheRaster.src=ThePath;
	
	// build the request object
	this.TheRasterRequest=
	{
		LoadStatus:CMDataset.LOAD_STATUS_NONE,
		Type:CMDataset.REQUEST_TYPE_IMAGE,
		TheImage:this.TheRaster,
		src:ThePath,
		TheFunction:function()
		{ 
			this.TheTile.TheDataset.GetParent(CMScene).Repaint();  // global
		}
	};
	this.TheRasterRequest.TheTile=this;
	
	// make the request
	CMDataset.MakeRequest(this.TheRasterRequest);
	
	// replace the onload function
/*	
	this.TheRaster.onload=function()
	{ 
		this.TheTile.LoadRasterStatus=CMDataset.LOAD_STATUS_LOADED;
		this.TheTile.TheDataset.GetParent(CMScene).Repaint();  // global
	}
*/
}
//******************************************************************
// Mouse Functions
//******************************************************************
/**
* Adds this tile to the specific boundary
* @public
*/
CMTile.prototype.AddToFeatureBounds=function(FeatureIndex,Bounds) 
{
	if ("Features" in this.TheData) // vector data
	{
		var TheFeatures=this.TheData.Features;
		
		var Found=false;
		for (var i=0;(i < TheFeatures.length)&&(Found==false); i++) 
		{
			var TheFeature=TheFeatures[i];
			
			if (TheFeature.LayerFeatureIndex==FeatureIndex)
			{
				Found=true;
				
				var TheAreas=TheFeature.Areas;
				
				for (var AreaIndex=0;(AreaIndex<TheAreas.length);AreaIndex++)
				{
					var TheArea=TheAreas[AreaIndex];
					
					var ThePolys=TheArea.Polys;
					
					for (var PolyIndex=0;(PolyIndex<ThePolys.length);PolyIndex++)
					{
						var PolygonCoordinates=this.GetPolygonCoordinates(TheArea,PolyIndex,null);
					
						var PolygonBounds=CMUtilities.GetPolygonBounds(PolygonCoordinates.Xs,
							PolygonCoordinates.Ys,PolygonCoordinates.Xs.length);
						
						Bounds=CMUtilities.AddToBounds(Bounds,PolygonBounds);
					}
				}
			}
		}
	}
 	return(Bounds);
};

//******************************************************************
// Mouse Functions
//******************************************************************
CMTile.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
	if ((this.TheData!=null)&&("Features" in this.TheData)) // have vector data
	{
		var TheFeatures=this.TheData.Features;
		for (var i=0;(i < TheFeatures.length)&&(FeatureIndex==-1); i++) 
		{
			var ViewBounds=TheView.GetExtent();
			
//			if (CMUtilities.BoundsOverlap(ViewBounds,this.FeatureBounds[i]))
			{
				var TheFeature=TheFeatures[i];
				
				var TheAreas=TheFeature.Areas;
				
				for (var AreaIndex=0;(AreaIndex<TheAreas.length)&&(FeatureIndex==-1);AreaIndex++)
				{
					var TheArea=TheAreas[AreaIndex];
					
					var ThePolys=TheArea.Polys;
					
					for (var PolyIndex=0;(PolyIndex<ThePolys.length)&&(FeatureIndex==-1);PolyIndex++)
					{
						var PolygonCoordinates=this.GetPolygonCoordinates(TheArea,PolyIndex,null);
					
						if (PolygonCoordinates.Xs.length>10)
						{
							var j=12;
						}
						var Inside=CMUtilities.InsideAPolygon(RefX,RefY,PolygonCoordinates.Xs,PolygonCoordinates.Ys,PolygonCoordinates.Xs.length);
						
						if (Inside) 
						{
							FeatureIndex=i;
						}
					}
				}
			}
		}
	}
 	return(FeatureIndex);
};
CMTile.prototype.MouseDown=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	if ((this.TheData!=null)&&
		 ((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT)))
	{
		if ("Features" in this.TheData) // vector data
		{
			var FeatureIndex=this.In(TheView,RefX,RefY);
			
			if (FeatureIndex!=-1)
			{
				this.TheDataset.ShowInfoWindow(FeatureIndex,TheView,RefX,RefY);
		
				Used=true;
			}
			else // call children?
			{
			}
		}
		else if ("TheColor" in this.TheData) // raster data
		{
			if (this.TheRaster!=null)
			{
				var Factor=Math.pow(2,this.ZoomLevel);
				var TileRefWidth=this.TheDataset.TileRefWidth/Factor;
				
				var TileRefX=(this.GlobalColumn*TileRefWidth);
				var TileRefY=(this.GlobalRow*TileRefWidth);
				
				var PixelX=parseInt((RefX-TileRefX)/TileRefWidth*256);
				var PixelY=parseInt((TileRefY-RefY)/TileRefWidth*256);
				
				if ((PixelX>=0)&&(PixelX<256)&&(PixelY>=0)&&(PixelY<256)) // in tile
				{
					var TheHTML="Pixel X:"+PixelX+" Y: "+PixelY;
				
					var Index=PixelY*(256*3)+(PixelX*3);
					
					// 
					
					 var canvas = document.createElement("canvas");
					canvas.width = this.TheRaster.width;
					canvas.height =  this.TheRaster.height;
					
					// Copy the image contents to the canvas
					var ctx = canvas.getContext("2d");
					ctx.drawImage( this.TheRaster, 0, 0);
					
					var ImageData=ctx.getImageData(PixelX,PixelY,1,1);
					
					TheHTML+=" Value:"+ImageData.data[0]+","+ImageData.data[1]+","+ImageData.data[2];
					
					var InfoWindow=TheView.CreateInfoWindow("CMTile.InfoWindow",RefX,RefY,200,30,TheHTML);
				
					CMMainContainer.SetPopupWindow(InfoWindow);
					
					Used=true;
				}
			}
			if (Used==false)
			{
				if (this.TheData.NumChildTiles>0)
				{
					for (var RowIndex=0;RowIndex<2;RowIndex++)
					{
						for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
						{
							if (this.TheData.ChildTiles[RowIndex][ColumnIndex]>0)
							{
								Used=this.ChildTiles[RowIndex][ColumnIndex].MouseDown(TheView,RefX,RefY);
							}
						}
					}
				}
			}
		}
	}
	return(Used);
};

//******************************************************************
// Painting Functions
//******************************************************************
/*
* Check if we should paint this tile or it's four child tiles.
* 
* This is a little complicated because we have to
* decide if we are going to paint this tile or paint it's children.
* If we are painting this tile, then we either need to paint the vectors
* fill the tile with a single color (uniform raster pixel or tile in the
* middle of a filled polygon
*
* Algorithm to decide if painting this tile:
*
* 	if PaintDebugTile) paint this tile
* 	else
* 		if this tile's pixel width is less than or equal to 256 paint this tile
* 		else 
* 			if any of the children have not been loaded paint this tile (and load the children)
*			if any of the children are still loading, paint this tile
*			count the number of child tiles that are
*				loaded and
*				vector data or raster data with a color or a loaded raster tile
*				or empty tiles
*			if the number is less than 4, paint this tile
*
* @private
*/
CMTile.prototype.CheckPaintTile=function(TheView,ThisStepTileRefWidth) 
{
	var ThisStepsTilePixelWidth=TheView.GetPixelWidthFromRefWidth(ThisStepTileRefWidth);
	
	var PaintTile=false; 

	// see if we should paint because we are debugging a tile
	if (this.TheDataset.PaintDebugTile)
	{
		if ((this.TheDataset.DebugZoomLevel==this.ZoomLevel)&&
			(this.TheDataset.DebugGlobalColumn==this.GlobalColumn)&&
			(this.TheDataset.DebugGlobalRow==this.GlobalRow))
		{
			PaintTile=true; // paint the tile being debugged
		}
	}
	else // otherwise, check if this tile needs to be painted
	{
		if (PaintTile==false) // see if we should 
		{
			if ((ThisStepsTilePixelWidth<=256)) PaintTile=true; // resolution is low, paint this tile
			if (this.ChildTiles==null) 
			{
				PaintTile=true; // tile has no children, paint this tile
			}
			else // see if we have 4 child tiles ready to be painted (or are empty)
			{
				if (this.TheData.NumChildTiles>0)
				{
					NumLoadedChildTiles=0;
								
					for (var RowIndex=0;RowIndex<2;RowIndex++)
					{
						for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
						{
							if (this.TheData.ChildTiles[RowIndex][ColumnIndex]>0)
							{
								var TheChildTile=this.ChildTiles[RowIndex][ColumnIndex];

								if (TheChildTile.LoadStatus==CMDataset.LOAD_STATUS_NONE)
								{
									TheChildTile.LoadTile(TheView);
									PaintTile=true;
								}
								else if (TheChildTile.LoadStatus==CMDataset.LOAD_STATUS_LOADING)
								{
									PaintTile=true;
								}
								else 
								{
									if ("Features" in this.TheData) // vector data
									{
										NumLoadedChildTiles++;
									}
									else if ("TheColor" in this.TheData) // raster data
									{
										if (this.TheData.TheColor!=null) 
										{
											NumLoadedChildTiles++; // just a color
										}
										else // have a raster tile file with data
										{
											if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_LOADED)
											{
												NumLoadedChildTiles++;
											}
											else if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_CANCELED)
											{
												this.LoadTileRaster(TheView);
											}
										}
									}
								}
//										NumChildrenPainted+=TheChildTile.PaintTile(TheView,NextStepTileRefWidth);
							}
							else if (this.TheData.ChildTiles[RowIndex][ColumnIndex]==0) // empty tile
							{
								NumLoadedChildTiles++;
							}
						}
					}
					// unless this tile is completely covered by child tiles, paint it	
					if (NumLoadedChildTiles<4) PaintTile=true;
				}
			}
		}
	}
	return(PaintTile);
}
/**
* Return the coordinates for a single polygon.  This involves converting the
* edges and sides of tiles into polygons and returning their coordinates.
* @private
*/
CMTile.prototype.GetPolygonCoordinates=function(TheArea,PolyIndex,PaintedEdges) 
{
	Result=null;
	
	var Factor=Math.pow(2,this.ZoomLevel);
	var TileRefWidth=this.TheDataset.TileRefWidth/Factor;
	
	var RefX=(this.GlobalColumn*TileRefWidth);
	var RefY=(this.GlobalRow*TileRefWidth);
	
	var TileRefLeft=RefX
	var TileRefRight=RefX+TileRefWidth;
	var TileRefTop=RefY+TileRefWidth;
	var TileRefBottom=RefY;
	
	//
	
	var TheEdges=TheArea.Edges;
	var ThePolys=TheArea.Polys;
	
		var ThePoly=ThePolys[PolyIndex];
			
		if (ThePoly.Closed) // paint closed polys (both edges and fills)
		{
			var EdgeIndex=ThePoly.EdgeIndexes[0];
			
			var TheEdge=TheEdges[EdgeIndex];
			
			if (PaintedEdges!=null) PaintedEdges[EdgeIndex]=true;
			
			Result={ Xs:TheEdge.Xs,Ys:TheEdge.Ys };
		}
		else // fill unclosed polys
		{
			var Xs=[];
			var Ys=[];
			var NumCoordinates=0;
			
			for (var PolyEdgeIndex=0;PolyEdgeIndex<ThePoly.EdgeIndexes.length;PolyEdgeIndex++)
			{
				var EdgeIndex=ThePoly.EdgeIndexes[PolyEdgeIndex];
				
				if (EdgeIndex>=0) // real edge
				{
					var EdgeXs=TheEdges[EdgeIndex].Xs;
					var EdgeYs=TheEdges[EdgeIndex].Ys;
					
					for (var k=0;k<EdgeXs.length;k++)
					{
						Xs[NumCoordinates]=EdgeXs[k];
						Ys[NumCoordinates]=EdgeYs[k];
						NumCoordinates++;
					}
					if (PaintedEdges!=null) PaintedEdges[EdgeIndex]=true;
				}
				else // add a corner
				{
					switch (EdgeIndex)
					{
					case CMTile.UPPER_RIGHT:
						Xs[NumCoordinates]=TileRefRight
						Ys[NumCoordinates]=TileRefTop
						NumCoordinates++;
						break;
					case CMTile.LOWER_RIGHT:
						Xs[NumCoordinates]=TileRefRight
						Ys[NumCoordinates]=TileRefBottom
						NumCoordinates++;
						break;
					case CMTile.LOWER_LEFT:
						Xs[NumCoordinates]=TileRefLeft
						Ys[NumCoordinates]=TileRefBottom
						NumCoordinates++;
						break;
					case CMTile.UPPER_LEFT:
						Xs[NumCoordinates]=TileRefLeft
						Ys[NumCoordinates]=TileRefTop
						NumCoordinates++;
						break;
					}
				}
			}
			Result={ Xs:Xs,Ys:Ys };
//											TheView.PaintRefPoly2(Xs,Ys,true);
//		}
	}
	return(Result);
}

/**
* Paint a single tile.  
* @public
*/
CMTile.prototype.PaintTile=function(TheLayer,TheView,SelectedOnly,ThisStepTileRefWidth) 
{
	var NumPainted=0; // 1 if this tile painted it's contents, 0 otherwise
		
	var Factor=1/Math.pow(2,this.ZoomLevel); // width of one pixel
	var TileRefWidth=256*Factor;
	
	var RefX=(this.GlobalColumn*TileRefWidth);
	var RefY=(this.GlobalRow*TileRefWidth);
	
	var Extent={
		"XMin":RefX,
		"XMax":RefX+TileRefWidth,
		"YMax":RefY+TileRefWidth,
		"YMin":RefY
	}
	
	if (CMUtilities.BoundsOverlap(Extent,TheView.GetExtent()))
	{
		if (this.TheData!=null) // data will be null until recieved
		{
			var TileRefLeft=RefX
			var TileRefRight=RefX+TileRefWidth;
			var TileRefTop=RefY+TileRefWidth;
			var TileRefBottom=RefY;
			
			// the tiles in the next step are 1/2 the reference width of the tiles in this step
			
			var NextStepTileRefWidth=ThisStepTileRefWidth/2;
			
			// paint the child
			
			var PaintTile=this.CheckPaintTile(TheView,ThisStepTileRefWidth);
			
			var NumChildrenPainted=0;
			if (PaintTile) // try to paint the children
			{
				if ("Features" in this.TheData) // vector data
				{
					if ((this.ZoomLevel==5)&&(this.GlobalColumn==-36)&&(this.GlobalRow==15))
					{
						var j=12;
					}
					// Get the features from the data
					var TheFeatures=this.TheData.Features;
				
					// draw each feature in this tile
					for (var i=0; i < TheFeatures.length; i++) 
					{
						var ViewBounds=TheView.GetExtent();
						
			//			if (CMUtilities.BoundsOverlap(ViewBounds,this.FeatureBounds[i]))
						{
							var TheFeature=TheFeatures[i];
							
							var TheAreas=TheFeature.Areas;
							
							for (var AreaIndex=0;AreaIndex<TheAreas.length;AreaIndex++)
							{
								var TheArea=TheAreas[AreaIndex];
								
								var TheEdges=TheArea.Edges;
								var ThePolys=TheArea.Polys;
								
								var PaintedEdges=[];
								for (var j=0;j<TheEdges.length;j++) PaintedEdges[j]=false;
								
								for (var PolyIndex=0;PolyIndex<ThePolys.length;PolyIndex++)
								{
									var PolygonCoordinates=this.GetPolygonCoordinates(TheArea,PolyIndex,PaintedEdges);
								
									TheView.PaintRefPoly2(PolygonCoordinates.Xs,PolygonCoordinates.Ys,true,false);
								}
								// paint the edges that were not painted above
								
								for (var EdgeIndex=0;EdgeIndex<TheEdges.length;EdgeIndex++)
								{
//									if (PaintedEdges[EdgeIndex]==false)
									{
										var Xs=TheEdges[EdgeIndex].Xs;
										var Ys=TheEdges[EdgeIndex].Ys;
										
										for (var CoordinateIndex=1;CoordinateIndex<Xs.length;CoordinateIndex++)
										{
											TheView.PaintRefLine(Xs[CoordinateIndex-1],Ys[CoordinateIndex-1],Xs[CoordinateIndex],Ys[CoordinateIndex]);
										}
									}
								}
							}
						}
					}
				}
				if ("TheColor" in this.TheData) // raster info
				{
					if (this.TheData.TheColor==null) // paint the raster tile
					{
						if (this.TheRasterRequest!=null)
						{
							if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_LOADED)
							{
								var ImageRefWidth=TileRefWidth;
								var ImageRefHeight=-TileRefWidth;
								
								var ImageRefX=RefX;
								var ImageRefY=RefY+TileRefWidth;
								
								TheView.PaintRefImageScaled(this.TheRaster,ImageRefX,ImageRefY,ImageRefWidth,ImageRefHeight);
							}
							else if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_CANCELED)
							{
								this.LoadTileRaster(TheView);
							}
						}
					}
					else // just paint the color
					{
						var TheColor=this.TheData.TheColor;
					
						if (TheColor!==null)
						{
							var Test="rgb("+TheColor[0]+","+TheColor[1]+","+TheColor[2]+")";
							
							var TheStyle2={
								"fillStyle":""+Test+"",
								"lineWidth":0
							};
							if (TheStyle2!=null) TheView.SetStyle(TheStyle2);
							
							TheView.PaintRefBounds(Extent);
							
							if (TheStyle2!=null) TheView.RestoreStyle();
						}
					}
				}
				// paint the debugging information
				
				if ((this.PaintTileInfo))
				{
					var TheStyle2={
						"font":"20px Arial",
						"fillStyle":"red",
						"lineWidth":1,
						"strokeColor": "red",
						"strokeStyle":"#000",
					};
					if (TheStyle2!=null) TheView.SetStyle(TheStyle2);
						
					var CenterX=RefX+TileRefWidth/2;
					var CenterY=RefY+TileRefWidth/2;
					
					var TheText=this.ZoomLevel+"_"+this.GlobalColumn+"_"+this.GlobalRow;
					
					TheView.PaintRefText(TheText,CenterX,CenterY,20);
					
					TheView.PaintRefLine(RefX,RefY,RefX,RefY+TileRefWidth); // left
					TheView.PaintRefLine(RefX+TileRefWidth,RefY,RefX+TileRefWidth,RefY+TileRefWidth); // right
					
					TheView.PaintRefLine(RefX,RefY,RefX+TileRefWidth,RefY); // top 
					TheView.PaintRefLine(RefX,RefY+TileRefWidth,RefX+TileRefWidth,RefY+TileRefWidth); // bottom
					
					if (TheStyle2!=null) TheView.RestoreStyle();
				}
						
			}
			else // paint the child tiles in this tile
			{
				if (this.TheData.NumChildTiles>0)
				{
					for (var RowIndex=0;RowIndex<2;RowIndex++)
					{
						for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
						{
							// negative for one feature ID, >0 for mulitple and must load a child tile
							
							if (this.TheData.ChildTiles[RowIndex][ColumnIndex]>0)
							{
								var TheChildTile=this.ChildTiles[RowIndex][ColumnIndex];
								
								NumChildrenPainted+=TheChildTile.PaintTile(TheLayer,TheView,SelectedOnly,NextStepTileRefWidth);
							}
						}
					}
				}
			}
			NumPainted++;
			
			// if the children of this tile painted, we do not need to paint
			
			if (NumChildrenPainted<4)
			{
				var Test=12;
			}
			
		}
	}
	
	return(NumPainted);
}
/**
* Sets whether the tile will paint it's debugging information.
* The parent dataset has a setting for this.
* @public
*/
CMTile.prototype.SetPaintTileInfo=function(NewPaintTileInfo) 
{
	this.PaintTileInfo=NewPaintTileInfo;
}
