//******************************************************************
// CMLayerRaster Class
//******************************************************************

//******************************************************************
// Constructor
//******************************************************************
function CMLayerRaster() 
{
	this.TheImage=null;
	this.TheBounds=null;
}
CMLayerRaster.prototype=new CMLayer(); // inherit prototype functions from PanelBase()

CMLayerRaster.prototype.contructor=CMLayerRaster; // override the constructor to go to ours
//******************************************************************
// CMLayer Class
//******************************************************************
/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
*/
CMLayerRaster.prototype.SetURL=function(URL,NewView,ZoomToBounds) 
{
	this.TheImage=new Image(); 
	this.TheImage.Loaded=false;
	this.TheImage.TheLayer=this;
	this.TheImage.TheView=NewView;
	this.ZoomToBounds=ZoomToBounds;
	
	this.TheImage.onload=function () 
	{ 
		this.Loaded=true;
		this.TheLayer.Repaint(); 
		if (this.TheLayer.ZoomToBounds)
		{
			this.TheView.ZoomToBounds(this.TheLayer.GetBounds());
		}
	};

	this.TheImage.src=URL;
}
//******************************************************************
// CMLayerRaster Functions
//******************************************************************
/**
* SetBounds must be called before SetImage or SetURL are called so the raster can be 
*/

CMLayerRaster.prototype.SetImage=function(TheImage) 
{
	this.TheImage=TheImage;
}

CMLayerRaster.prototype.In=function(TheView,RefX,RefY) 
{
	return(-1);
};

/*
* Paints a layer into the canvas
*/
CMLayerRaster.prototype.Paint=function(TheView) 
{
	if ((this.IsVisible())&&(this.TheImage!=null)&&(this.TheImage.Loaded==true))
	{
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		var TheBounds=this.TheBounds;
		
		var TheStyle=this.GetStyle();
		
		TheView.SetStyle(TheStyle);
		
		if (TheBounds!=null)
		{
			TheView.PaintRefImageScaled(this.TheImage,this.TheBounds);
		}
		else // draw the raster in the upper left corner of the canvas
		{
			TheContext.drawImage(this.TheImage,0,0,this.TheImage.width,this.TheImage.height);
		}
		TheView.RestoreStyle();
	}
}

