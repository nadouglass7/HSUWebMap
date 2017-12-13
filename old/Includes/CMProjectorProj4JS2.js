//***************************************************************************************
//	CMProjectorProj4JS2
//
// Projection class to use the Proj4 library that I converted from Proj4JS.
//
// This is not completed.
//***************************************************************************************
//***************************************************************************************
//	Defintions
//***************************************************************************************

//***************************************************************************************
// Constructor
//***************************************************************************************
function CMProjectorProj4JS2() 
{
	this.SemiMajor=6371000;
	this.SemiMinor=6371000;
	
	this.LatitudeOfOrigin=0;
	this.LongitudeOfOrigin=0;
	
	this.Latitude1=20;
	this.Latitude2=40;
	
	this.Longitude1=-40;
	this.Longitude2=40;

	this.EccentrictySquared=0.08181881201777498309119942963794; // varies by datum
	this.Eccentricty=0.006694318; // varies by datum
	this.ReciprocalOfEllipsoidFlattening=298;
	
	this.ScalingFactor=1.0;
	
	this.ProjectionName="aea";
	
	this.Projection=null;
}
CMProjectorProj4JS2.prototype=new CMProjector(); // inherit prototype functions from PanelBase()

CMProjectorProj4JS2.prototype.contructor=CMProjectorGoogleMaps; // override the constructor to go to ours
//***************************************************************************************
//	CMProjector functions
//***************************************************************************************
CMProjectorProj4JS2.prototype.Initialize=function()
{
	if (this.Projection==null)
	{
		switch (this.ProjectionName)
		{
		case "aea": // Albers equal area
			this.Projection=aea; // lat1, lat2
			break;
		case "aeqd": // specific to aeqd
			this.Projection=aeqd;
			break;
		case "cass": // specific to cass
			this.Projection=cass;
			break;
		case "cea": // specific to cass
			this.Projection=cea; // k0
			break;
		case "eqc": // 
			this.Projection=eqc; // 
			break;
		case "eqdc": // 
			this.Projection=eqdc; // 
			break;
		case "equi": // 
			this.Projection=equi; // 
			break;
		case "gauss": // 
			this.Projection=gauss; // 
			break;
		case "gnom": // 
			this.Projection=gnom; // 
			break;
		case "gstmerc": // 
			this.Projection=gstmerc; // 
			break;
		case "krovak": // 
			this.Projection=krovak; // 
			break;
		case "laea": // 
			this.Projection=laea; // 
			break;
		case "lcc": // 
			this.Projection=lcc; // 
			break;
		case "longlat": // 
			this.Projection=longlat; // 
			break;
		case "merc": // 
			this.Projection=merc; // 
			break;
		case "mill": // 
			this.Projection=mill; // 
			break;
		case "moll": // 
			this.Projection=moll; // 
			break;
		case "nzmg": // 
			this.Projection=nzmg; // 
			break;
		case "omerc": // 
			this.Projection=omerc; // 
			break;
		case "ortho": // 
			this.Projection=ortho; // 
			break;
		case "poly": // 
			this.Projection=poly; // 
			break;
		case "sinu": // 
			this.Projection=sinu; // 
			break;
		case "somerc": // 
			this.Projection=somerc; // 
			break;
		case "stere": // 
			this.Projection=stere; // 
			break;
		case "sterea": // 
			this.Projection=sterea; // 
			break;
		case "tmerc": // 
			this.Projection=tmerc; // 
			break;
		case "utm": // just runs tmerc
			alert("UTM is only supported through tmerc");
			break;
		case "vandg": // just runs tmerc
			this.Projection=vandg; // 
			break;
		}
		// setup the projection for use, note that parameters vary by projection
		
		this.Projection.a=this.SemiMajor; // semi-major
		this.Projection.b=this.SemiMinor; // semi-minor
	
		this.Projection.ep2=(this.Projection.a-this.Projection.b)/this.Projection.b; // used in geocentric
		
		this.Projection.lat0=CMProjector.DegreesToRadians(this.LatitudeOfOrigin); // latitude of origin
		this.Projection.long0=CMProjector.DegreesToRadians(this.LongitudeOfOrigin); // longitude of origin
		this.Projection.x0=0; // false easting
		this.Projection.y0=0; // false northing
		
		// setup other parameters (specified to projection but I just set them all regardless
		// since they are not well documented)
		
		this.Projection.lat_ts=CMProjector.DegreesToRadians(this.LatitudeOfOrigin); // 
		
		this.Projection.lat1=CMProjector.DegreesToRadians(this.Latitude1);
		this.Projection.lat2=CMProjector.DegreesToRadians(this.Latitude2);
		
		this.Projection.long1=CMProjector.DegreesToRadians(this.Longitude1);
		this.Projection.long2=CMProjector.DegreesToRadians(this.Longitude2);
	
		this.Projection.k0=this.ScalingFactor;
		
		this.Projection.e=this.Eccentricty;
		this.Projection.es=this.EccentrictySquared;
		this.Projection.rf=this.ReciprocalOfEllipsoidFlattening;
		
		this.Projection.init();
	}
}
/*
*
*/
CMProjectorProj4JS2.prototype.ProjectFromGeographic=function(Lon,Lat)
{
	this.Initialize();
	
	//
	 
	var LatRadians=CMProjector.DegreesToRadians(Lat);
	var LonRadians=CMProjector.DegreesToRadians(Lon);
	
	var Coordinate={
		x:LonRadians,
		y:LatRadians
	};
	
	Coordinate=this.Projection.forward(Coordinate);
	
	var Result={
		Easting:Coordinate.x,
		Northing:Coordinate.y
	};
	
	return(Result);
};

CMProjectorProj4JS2.prototype.ProjectToGeographic=function(X,Y)
{
	this.Initialize();
	
	// do the inverse conversion
	 
	var Coordinate={
		x:X,
		y:Y
	};
	
	Coordinate=this.Projection.inverse(Coordinate);
	
	var Lon=CMProjector.RadiansToDegrees(Coordinate.x);
	var Lat=CMProjector.RadiansToDegrees(Coordinate.y);
	
	var Result={
		Longitude:Lon,
		Latitude:Lat
	};
	
	return(Result);
};
//***************************************************************************************
// CMProjectorProj4JS2 Functions
//***************************************************************************************
