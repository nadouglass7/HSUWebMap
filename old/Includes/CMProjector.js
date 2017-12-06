//***************************************************************************************
//	CMProjector Base class.
// This class defines the main functions for projectors to convert between projected and
// geographic coordinates.
//
//	By: Jim Graham 
//
// Copyright (c) 2015 
//
//***************************************************************************************

//******************************************************************
// Constructors
//******************************************************************

/*
* Constructor for a projector.  This is a null class that just passes
* the coordinate values back without changing them.  It effectively
* implements a flattened "geographic" projection.
*/
function CMProjector() 
{
	
}
//CMProjector.EPSG_WGS84_GEOGRAPHIC=4326;

CMProjector.EPSG_WGS84_UTM_1_NORTH=32601; // add to get 1 through 60
CMProjector.EPSG_WGS84_UTM_1_SOUTH=32701; // add to get 1 through 60

//var WGS_72=0; // wgs 72 ellipsoid
CMProjector.WGS_84=1; // wgs 84 ellipsoid
CMProjector.NAD_27=2; // clarke 1866 ellipsoid
CMProjector.NAD_83=3; // grs 1980 ellipsoid

//CMProjector.EPSG_GOOGLE_MAPS=-1; // jjg - special

//CMProjector.STPROJECTION_GEOGRAPHIC=1;
//CMProjector.STPROJECTION_UTM=2;

//***************************************************************************************
// Unit conversions
//***************************************************************************************

CMProjector.DegreesToRadians=function(DegreeAngle)
{
	var RadianAngle=DegreeAngle*(Math.PI/180);
	
	return(RadianAngle);
}
CMProjector.RadiansToDegrees=function(RadianAngle) 
{
	DegreeAngle= RadianAngle/(Math.PI/180);
	
	return(DegreeAngle);
}
//******************************************************************
// CMProjector functions for subclasses to override
//******************************************************************

CMProjector.prototype.ProjectToGeographic=function(Easting,Northing)
{
	var Result={
		Longitude:Easting,
		Latitude:Northing
	};
	return(Result);
}

CMProjector.prototype.ProjectFromGeographic=function(Longitude,Latitude)
{
	var Result={
		Easting:Longitude,
		Northing:Latitude
	};
	return(Result);
}
//******************************************************************
// CMProjector functions to use (not override)
//******************************************************************

CMProjector.prototype.ProjectGeoJSONFromGeographic=function(TheData)
{
//	alert("Pr");
	var TheFeatures=TheData.features;

//alert("Numfeatures="+TheFeatures.length);

	// Loop through each “feature”
	for (var i=0; i < TheFeatures.length; i++) 
	{
		var TheGeometry=TheFeatures[i].geometry;
//alert("TheGeometry="+TheGeometry);
		CMUtilities.ApplyToGeometryCoordinates(TheGeometry,Projector_ApplyProjectionToCoordinates,this);
	}
//alert("done projecting");
}

function Projector_ApplyProjectionToCoordinates(TheProjector,TheCoordinates)
{
//	alert("TheCoordinates="+TheCoordinates);
//	alert("TheCoordinates.length="+TheCoordinates.length);
	
//	for (var j=0; j < TheCoordinates.length; j++) 
	{
//	alert("TheCoordinates="+TheCoordinates);
		var X=TheCoordinates[0];
		var Y=TheCoordinates[1];
//	alert("X="+X+", Y="+Y);
	
		var Result=TheProjector.ProjectFromGeographic(X,Y);
		
		TheCoordinates[0]=Result.Easting;
		TheCoordinates[1]=Result.Northing;
//	alert("TheCoordinates="+TheCoordinates);
	}
	return(Result);
}

