//******************************************************************
// CMLayerPyramid Class
//******************************************************************
//******************************************************************
// Global Variables
//******************************************************************

// object reference for the balloon if it is displayed
var Layer_Vector_Pyramid_Balloon=null;

//******************************************************************
// CMLayerGeoJSON Constructor
//******************************************************************
function CMLayerPyramidOpenFormat() 
{
	this.TileWidthInPixels=256;
	
	this.PaintDebugTile=false;
	this.DebugZoomLevel=-1;
	this.DebugGlobalColumn=0;
	this.DebugGlobalRow=0;
	
	this.FileExtension=null;
}
CMLayerPyramidOpenFormat.prototype=new CMLayer(); // inherit prototype functions from PanelBase()

CMLayerPyramidOpenFormat.prototype.contructor=CMLayerPyramidOpenFormat; // override the constructor to go to ours

//******************************************************************
// Private functions
//******************************************************************
/**
* Find the row and column of the tile in the upper left corner of the canvas
* and save it as a member variable
*/
CMLayerPyramidOpenFormat.prototype.GetUpperLeftColumnRow=function(TheView) 
{
	var RefLeft=TheView.GetRefXFromPixelX(0); // get the reference location of the upper left pixel in the canvas
	var RefTop=TheView.GetRefYFromPixelY(0);
	
	var RefWidth=TheView.GetRefWidthFromPixelWidth(this.TileWidthInPixels); // find the width of a tile in ref units
	
	var LeftColumnIndex=Math.floor(RefLeft/RefWidth);
	var TopRowIndex=Math.floor(-RefTop/RefWidth);

	// move the 0,0 tile to the upper left of the map
	
	var ZoomLevel=18+TheView.ZoomLevel;//+this.ZoomLevelOffset;
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
CMLayerPyramidOpenFormat.prototype.CreateImageTile=function(Column,Row,TheView) 
{
	if (this.ImageTiles[TheView.ZoomLevel][Row][Column]==null)
	{
		this.ImageTiles[TheView.ZoomLevel][Row][Column]= new Image(); 
		
		var TheImageTile=this.ImageTiles[TheView.ZoomLevel][Row][Column];
		
		TheImageTile.Loaded=false;
		TheImageTile.TheLayer=this;
		
		TheImageTile.onload=function() 
		{ 
			this.Loaded=true;
			this.TheLayer.Repaint(); 
		};
	
		var ZoomLevel=18+TheView.ZoomLevel;//+this.ZoomLevelOffset;
		
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
CMLayerPyramidOpenFormat.prototype.SetDebugTile=function(ZoomLevel,GlobalColumn,GlobalRow) 
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
CMLayerPyramidOpenFormat.prototype.SetURL=function(URL,NewView) 
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
	this.TheView=NewView;

	this.ImageTiles=[];

	this.Repaint(); 
}

//******************************************************************
// Messages
//******************************************************************
CMLayerPyramidOpenFormat.prototype.ZoomLevelChanged=function(TheView) 
{
}
//******************************************************************
// Mouse event handling
//******************************************************************


CMLayerPyramidOpenFormat.prototype.Resize=function(TheView) 
{
}
//******************************************************************
// Painting
//******************************************************************

/*
* Paints a layer into the canvas
*/
CMLayerPyramidOpenFormat.prototype.Paint=function(TheView) 
{
	if (this.IsVisible())
	{
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		var PaintedAtLeastOneTile=false;
		
		if (this.ImageTiles!=null)
		{
			var ZoomLevel=TheView.ZoomLevel;
			
			if (this.ImageTiles[ZoomLevel]==null) this.ImageTiles[ZoomLevel]=[];
			
			// find the row and column of the upper left tile
			
			var Result=this.GetUpperLeftColumnRow(TheView);
			
			var LeftColumnIndex=Result.LeftColumnIndex;
			var TopRowIndex=Result.TopRowIndex;
			
			// find the number of rows and columns of tiles for this canvas
			
			var CanvasWidthInPixels=TheView.TheCanvas.width;
			var CanvasHeightInPixels=TheView.TheCanvas.height;
			
			var NumRows=Math.floor(CanvasHeightInPixels/this.TileWidthInPixels)+2; // we need up to 1 additional tile on each side of the canvas
			var NumColumns=Math.floor(CanvasWidthInPixels/this.TileWidthInPixels)+2;
			
			// find the pixel location for the tile in the upper left corner of the canvas
			
			var PixelX=TheView.GetPixelXFromRefX(0);
			var PixelY=TheView.GetPixelYFromRefY(0);
			
			var TileRefWidth=TheView.GetRefWidthFromPixelWidth(256);
			
			var SceneTileWidth=Math.pow(2,18-ZoomLevel);
			
			// draw the tiles from the top down and from left to right 
			
			var TheStyle=this.GetStyle();
			if (TheStyle!=null) TheView.SetStyle(TheStyle);
			
			for (var Row=0;Row<NumRows;Row++)
			{
				var GlobalRow=Row+TopRowIndex;
				
				if (this.ImageTiles[ZoomLevel][GlobalRow]==null) this.ImageTiles[ZoomLevel][GlobalRow]=[];
				
//				var NumColumns=this.ImageTiles[TheView.ZoomLevel][Row].length;
			
				for (var Column=0;Column<NumColumns;Column++)
				{
					var GlobalColumn=Column+LeftColumnIndex;
					
					var TheTile=this.ImageTiles[ZoomLevel][GlobalRow][GlobalColumn];
					
					if (TheTile==null) 
					{
						this.CreateImageTile(GlobalColumn,GlobalRow,TheView);
					}
					else if (TheTile.Loaded)
					{
//						var X=PixelX+(GlobalColumn*this.TileWidthInPixels);
//						var Y=PixelY+(GlobalRow*this.TileWidthInPixels);
						
//						TheContext.drawImage(TheTile,X,Y);
	
						var Factor=Math.pow(2,ZoomLevel);
						var TileRefWidth=256/Factor;
						
						var RefX=(GlobalColumn*TileRefWidth);
						var RefY=-(GlobalRow*TileRefWidth);
						var ImageRefWidth=TileRefWidth;
						var ImageRefHeight=-TileRefWidth;
						
						var ImageRefX=RefX;
						var ImageRefY=RefY;
						TheView.PaintRefImageScaled(TheTile,
							ImageRefX,ImageRefY,ImageRefWidth,ImageRefHeight);
						
						PaintedAtLeastOneTile=true;
						
						if (TheStyle!=null) // triggers drawing the boundary and row,column
						{
							TheContext.strokeRect(X,Y,this.TileWidthInPixels,this.TileWidthInPixels);
						}
					}
				} // for column
			} // for row
			if (TheStyle!=null) TheView.RestoreStyle();
			
			// draw the text in the tiles if desired (debugging)
			
			var TheLabelStyle=this.GetProperty(CMLayer.LABEL_STYLE,null);
			
			if (TheLabelStyle!=null)
			{
				if (TheLabelStyle!=null) TheView.SetStyle(TheLabelStyle);
			
				for (var Row=0;Row<NumRows;Row++)
				{
					var NumColumns=this.ImageTiles[TheView.ZoomLevel][Row].length;
				
					for (var Column=0;Column<NumColumns;Column++)
					{
						if ((this.ImageTiles[TheView.ZoomLevel][Row][Column]!=null)&&(this.ImageTiles[TheView.ZoomLevel][Row][Column].Loaded))
						{
							var X=PixelX+(Column*this.TileWidthInPixels);
							var Y=PixelY+(Row*this.TileWidthInPixels);
							
							var Text=this.LeftColumnIndex+Column+","+this.TopRowIndex+Row;
							
							var Offset=this.TileWidthInPixels/2;
							
//							TheContext.strokeText(Text,X+Offset,Y+Offset);
							TheContext.fillText(Text,X+Offset,Y+Offset);
							
							if (true) // debugging
							{
								var RefX=TheView.GetRefXFromPixelX(X);
								var RefY=TheView.GetRefYFromPixelY(Y);
								var j=12;
							}
						}
					}
				}
				if (TheLabelStyle!=null) TheView.RestoreStyle();
			}
			
		}
		if (PaintedAtLeastOneTile==false)
		{
			if ((this.TheBounds!=null)&&(this.GetStyle()!=null))
			{
				var TheStyle=this.GetStyle();
				if (TheStyle!=null) TheView.SetStyle(TheStyle);
				
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
				if (TheStyle!=null) TheView.RestoreStyle();
			}
		}

//		TheView.PaintRefRasterthis.TheImage,this.TheBounds);
	}
}


