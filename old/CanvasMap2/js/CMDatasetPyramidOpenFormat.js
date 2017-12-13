//******************************************************************
// CMLayerPyramid Class
//******************************************************************
//******************************************************************
// Global Variables
//******************************************************************

// object reference for the balloon if it is displayed
//var Layer_Vector_Pyramid_Balloon=null;

//******************************************************************
// CMDatasetPyramidOpenFormat Constructor
//******************************************************************
function CMDatasetPyramidOpenFormat() 
{
	CMDataset.call(this);

	this.TileWidthInPixels=256;
	
	this.PaintDebugTile=false;
	this.DebugZoomLevel=-1;
	this.DebugGlobalColumn=0;
	this.DebugGlobalRow=0;
	
	this.FileExtension=null;
}
CMDatasetPyramidOpenFormat.prototype=Object.create(CMDataset.prototype); // inherit prototype functions from PanelBase()

CMDatasetPyramidOpenFormat.prototype.contructor=CMDatasetPyramidOpenFormat; // override the constructor to go to ours

//******************************************************************
// Private functions
//******************************************************************
/**
* Find the row and column of the tile in the upper left corner of the canvas
* and save it as a member variable
*/
CMDatasetPyramidOpenFormat.prototype.GetUpperLeftColumnRow=function(TheView) 
{
	var RefLeft=TheView.GetRefXFromPixelX(0); // get the reference location of the upper left pixel in the canvas
	var RefTop=TheView.GetRefYFromPixelY(0);
	
//	var RefWidth=TheView.GetRefWidthFromPixelWidth(this.TileWidthInPixels); // find the width of a tile in ref units
	var ZoomLevel=Math.floor(TheView.ZoomLevel);
	var Factor=Math.pow(2,ZoomLevel); 
	var TileRefWidth=256/Factor;  
	
	var LeftColumnIndex=Math.floor(RefLeft/TileRefWidth);
	var TopRowIndex=Math.floor(-RefTop/TileRefWidth);

	// move the 0,0 tile to the upper left of the map
	
	var ZoomLevel=18+Math.floor(TheView.ZoomLevel);//+this.ZoomLevelOffset;
	var NumTiles=Math.pow(2,ZoomLevel);
	
//	if (NumTiles>1)
	{
//		LeftColumnIndex+=NumTiles;
//		TopRowIndex+=NumTiles;
	}
	if (LeftColumnIndex==-0) LeftColumnIndex=0;
	if (TopRowIndex==-0) TopRowIndex=0;
	
	var Result={
		LeftColumnIndex:LeftColumnIndex,
		TopRowIndex:TopRowIndex
	}
	return(Result);
}
/**
* Create a single image tile and attempt to load it
*/
CMDatasetPyramidOpenFormat.prototype.CreateImageTile=function(Column,Row,TheView) 
{
	var ZoomLevel=Math.floor(TheView.ZoomLevel);
	
	if (this.ImageTiles[ZoomLevel][Row][Column]==null)
	{
		this.ImageTiles[ZoomLevel][Row][Column]= new Image(); 
		
		var TheImageTile=this.ImageTiles[ZoomLevel][Row][Column];
		
		TheImageTile.Loaded=false;
		TheImageTile.TheDataset=this;
		
		TheImageTile.onload=function() 
		{ 
			this.Loaded=true;
			this.TheDataset.GetParent(CMScene).Repaint(); 

//			this.TheLayer.Repaint(); 
		};
	
		var ZoomLevel=18+ZoomLevel;//+this.ZoomLevelOffset;
		
		var StepColumn=this.LeftColumnIndex+Column;
		var StepRow=this.TopRowIndex+Row;
		
		var StepColumn=Column;
		var StepRow=Row;
		
		if ((StepColumn>=0)&&(StepRow>=0)) // only load valid tiles
		{
			var FileName="";
			
			for (var i=0;i<3;i++)
			{
				if (i!=0) FileName+="/";
				
				if (this.CoordinateValueOrder[i]=="x") { FileName+=StepColumn; }
				if (this.CoordinateValueOrder[i]=="y") { FileName+=StepRow; }
				if (this.CoordinateValueOrder[i]=="z") { FileName+=ZoomLevel; }
			}
		//	var FileName=ZoomLevel+"/"+(Column)+"/"+(Row)+".jpg";
//			var FileName=ZoomLevel+"/"+(StepColumn)+"/"+(StepRow);
			
			if (this.FileExtension!=null) FileName+="."+this.FileExtension;
			
			var TheSource=this.URL+FileName;
			
		//	prompt("hi",TheSource);
			
			TheImageTile.src=TheSource;
		}
	}
}

//******************************************************************
// Functions used by subclasses and not overriden
//*****************************************************************
CMDatasetPyramidOpenFormat.prototype.SetDebugTile=function(ZoomLevel,GlobalColumn,GlobalRow) 
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
CMDatasetPyramidOpenFormat.prototype.SetURL=function(URL,ZoomToBounds) 
{
	// get the file extension, if any
	
	URL=URL.trim();
	
	var LastChar=URL[URL.length-1];
	
	if (LastChar!="}") // have an extension
	{
		var Index=URL.lastIndexOf(".");
	
		this.FileExtension=URL.substr(Index+1);
	}
	
	// strip off the z,x,y 
	
	var XIndex=URL.indexOf("{x}");
	var YIndex=URL.indexOf("{y}");
	var ZIndex=URL.indexOf("{z}");
	
	var StartIndex=ZIndex;
	
	this.CoordinateValueOrder=[];
	
	if (XIndex<YIndex) // is before y (x is first or second)
	{
		if (XIndex<ZIndex) // x is before z (x is first)
		{
			StartIndex=XIndex;
			
			if (YIndex<ZIndex) this.CoordinateValueOrder=["x","y","z"];
			else this.CoordinateValueOrder=["x","z","y"];
		}
		else // (x is before y and after z)
		{
			this.CoordinateValueOrder=["z","x","y"];
		}
	}
	else // x is after y
	{
		if (XIndex<ZIndex) // x is after y and before z
		{
			this.CoordinateValueOrder=["y","x","z"];
		}
		else // x is after z (x is at the end)
		{
			if (YIndex<ZIndex) 
			{
				StartIndex=YIndex;
			
				this.CoordinateValueOrder=["y","z","x"];
			}
			else this.CoordinateValueOrder=["z","y","x"];
		}
	}
	
	// strip off everything after the first brace
	
//	var Index=URL.indexOf("{");
	
	URL=URL.substr(0,StartIndex);

	// save the information
	
	this.URL=URL;

	this.ImageTiles=[];

	this.GetParent(CMScene).Repaint(); 
}


//******************************************************************
// Mouse event handling
//******************************************************************

//******************************************************************
// Painting
//******************************************************************

/*
* Paints a layer into the canvas
*/
CMDatasetPyramidOpenFormat.prototype.Paint=function(TheLayer,TheView,SelectedOnly,MouseOverOnly) 
{
//	if (this.IsVisible())
	{
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		var PaintedAtLeastOneTile=false;
		
		var ZoomLevel=Math.floor(TheView.ZoomLevel);
			
		if ((this.ImageTiles!=null)&&(true))
		{
			if (this.ImageTiles[ZoomLevel]==null) this.ImageTiles[ZoomLevel]=[];
			
			// find the row and column of the upper left tile
			
			var Result=this.GetUpperLeftColumnRow(TheView);
			
			var LeftViewColumnIndex=Result.LeftColumnIndex;
			var TopViewRowIndex=Result.TopRowIndex;
			
			// find the number of rows and columns of tiles for this canvas
			
			var TheCanvasElement=TheView.GetCanvasElement();
		
			var CanvasWidthInPixels=TheCanvasElement.width;
			var CanvasHeightInPixels=TheCanvasElement.height;
			
			var NumViewRows=Math.floor(CanvasHeightInPixels/this.TileWidthInPixels)+2; // we need up to 1 additional tile on each side of the canvas
			var NumViewColumns=Math.floor(CanvasWidthInPixels/this.TileWidthInPixels)+2;
			
			// find the pixel location for the tile in the upper left corner of the canvas
			
			var PixelX=TheView.GetPixelXFromRefX(0);
			var PixelY=TheView.GetPixelYFromRefY(0);
			
//			var SceneTileWidth=Math.pow(2,18-ZoomLevel);
			
			//*********************************************************
			// draw the tiles in the view from the top down and from left to right 
			
			var TheStyle=TheLayer.GetStyle(TheView);
			if (TheStyle!=undefined) TheView.SetStyle(TheStyle);
			
			for (var ViewRow=0;ViewRow<NumViewRows;ViewRow++)
			{
				var TileArrayRow=ViewRow+TopViewRowIndex;
				
				if (this.ImageTiles[ZoomLevel][TileArrayRow]==null) this.ImageTiles[ZoomLevel][TileArrayRow]=[];
				
//				var NumColumns=this.ImageTiles[TheView.ZoomLevel][ViewRow].length;
			
				for (var ViewColumn=0;ViewColumn<NumViewColumns;ViewColumn++)
				{
					var TileArrayColumn=ViewColumn+LeftViewColumnIndex;
					
					var TheTile=this.ImageTiles[ZoomLevel][TileArrayRow][TileArrayColumn];
					
					if (TheTile==null) 
					{
						this.CreateImageTile(TileArrayColumn,TileArrayRow,TheView);
					}
					else if (TheTile.Loaded)
					{
						// this has to be based on the tile's actuall reference with which is based on whole zoom levels
						// because the tile's RefWidth at 256 pixels is a whole zoom level number (not fractional).
						var Factor=Math.pow(2,ZoomLevel); 
						var TileRefWidth=256/Factor;  
						
//						var TileRefWidth=TheView.GetRefWidthFromPixelWidth(256);
						
//						var RefX=(TileArrayColumn*TileRefWidth);
//						var RefY=-(TileArrayRow*TileRefWidth)-TileRefWidth;
						
						var ImageRefX=TileArrayColumn*TileRefWidth;
						var ImageRefY=-(TileArrayRow*TileRefWidth);
						
						var ImageRefWidth=TileRefWidth;
						var ImageRefHeight=-TileRefWidth;
						
						TheView.PaintRefImageScaled(TheTile,
							ImageRefX,ImageRefY,TileRefWidth,-TileRefWidth);
						
						PaintedAtLeastOneTile=true;
						
/*						if (TheStyle!=null) // triggers drawing the boundary and row,column
						{
							TheView.PaintRefRect(ImageRefX,ImageRefX+ImageRefWidth,ImageRefY,ImageRefY+ImageRefHeight);
							
//							TheContext.strokeRect(X,Y,this.TileWidthInPixels,this.TileWidthInPixels);
						}
*/					}
				} // for column
			} // for row
			if (TheStyle!=undefined) TheView.RestoreStyle();
			
			//*****************************************************
			// draw the text in the tiles if desired (debugging)
			
			var TheLabelStyle=TheLayer.GetStyle(TheView,0,"Text") ;
			
			if (TheLabelStyle!=null)
			{
				if (TheLabelStyle!=undefined) TheView.SetStyle(TheLabelStyle);
			
				TheLayer.SetupLabelFont(TheView,-1);
			
				for (var ViewRow=0;ViewRow<NumViewRows;ViewRow++)
				{
					var TileArrayRow=ViewRow+TopViewRowIndex;
				
					try
					{
//						var NumColumns=this.ImageTiles[ZoomLevel][ViewRow].length;
						
						for (var ViewColumn=0;ViewColumn<NumViewColumns;ViewColumn++)
						{
							var TileArrayColumn=ViewColumn+LeftViewColumnIndex;
					
							var TheTile=this.ImageTiles[ZoomLevel][TileArrayRow][TileArrayColumn];
							
							if ((TheTile!=null)&&(TheTile.Loaded))
							{
								var Text=TileArrayColumn+","+TileArrayRow;
								
								var ImageRefX=TileArrayColumn*TileRefWidth+(TileRefWidth/2);
								var ImageRefY=-(TileArrayRow*TileRefWidth)-(TileRefWidth/2);
								
								TheView.PaintRefText(Text,ImageRefX,ImageRefY,12,"center");
								
								if (true) // debugging
								{
									var RefX=TheView.GetRefXFromPixelX(X);
									var RefY=TheView.GetRefYFromPixelY(Y);
									var j=12;
								}
							}
						}
					}
					catch(err)
					{
						var Testy=err.message;
					}
				}
				if (TheLabelStyle!=undefined) TheView.RestoreStyle();
			}
			
		}
		if (PaintedAtLeastOneTile==false)
		{
			if ((this.TheBounds!=null)&&(TheLayer.GetStyle(TheView)!=undefined))
			{
				var TheStyle=this.GetStyle(TheView);
				if (TheStyle!=undefined) TheView.SetStyle(TheStyle);
				
				var PixelX=TheView.GetPixelXFromRefX(this.TheBounds.XMin);
				var PixelY=TheView.GetPixelYFromRefY(this.TheBounds.YMax);
				
				var PixelWidth=TheView.GetPixelWidthFromRefWidth(this.TheBounds.XMax-this.TheBounds.XMin);
				var PixelHeight=TheView.GetPixelHeightFromRefHeight(this.TheBounds.YMin-this.TheBounds.YMax);
				
				if (PixelWidth<4) PixelWidth=4;
				if (PixelHeight<4) PixelHeight=4;
				
				if (TheContext.strokeStyle!=null) 
				{
					TheContext.strokeRect(PixelX,PixelY,PixelWidth,PixelHeight);
				}
//				TheView.PaintRect(this.TheBounds);
				if (TheStyle!=undefined) TheView.RestoreStyle();
			}
		}

//		TheView.PaintRefRasterthis.TheImage,this.TheBounds);
	}
}


