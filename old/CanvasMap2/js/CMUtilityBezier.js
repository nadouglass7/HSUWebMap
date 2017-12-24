//****************************************************************************************************
// Utilities for creating Bezier curves.
//****************************************************************************************************
//****************************************************************************************************
// Constructor 
//****************************************************************************************************
function CMUtilityBezier() 
{
	
}

//****************************************************************************************************
// Definitions
//****************************************************************************************************
/**
 * Renders a Bezier curve from P0 that does not have a specified slope
 * to P1 that has a slope specified by P0 and P2.  P2 is not part of this
 * curve but is the next curve.
 * 
 * Not currently used.
 * 
 * @param NumSteps
 * @param X0 Starting point (on the curve and used to determine the slope at the next point)
 * @param Y0
 * @param Z0
 * @param X1 Ending point (slope is calculated for this point)
 * @param Y1
 * @param Z1
 * @param X2 Additional point to compute the slope at the second point 
 * @param Y2 (this point is on the next segment of the curve, not part of the current curve).
 * @param Z2
 * @return 
 */
CMUtilityBezier.GetSecondOrderEndPoints3D=function(NumSteps,
	X0,Y0,Z0,X1,Y1,Z1,X2,Y2,Z2)
{
	var DX1,DY1,DZ1;

	// Find the slope at X1,Y1

	DX1=(X2-X0)/2;
	DY1=(Y2-Y0)/2;
	DZ1=(Z2-Z0)/2;
	
	var Result=CMUtilityBezier.GetSecondOrderEndPointsFromSlopes3D(NumSteps,X0,Y0,Z0,X1,Y1,Z1,DX1,DY1,DZ1);
	
	return(Result);
}

/**
 * Computes a Bezier curuve using 2 points (in 3D) amd a slope at the second point.
 * 
 * Used by STBOS (Bezier surface)
 * 
 * @param NumSteps
 * @param X0 Starting point (on the curve and used to determine the slope at the next point)
 * @param Y0
 * @param Z0
 * @param X1 Ending point (slope is calculated for this point)
 * @param Y1
 * @param Z1
 * @param DX1 Slope at second point
 * @param DZ1
 * @return 
 */
CMUtilityBezier.GetSecondOrderEndPointsFromSlopes3D=function(NumSteps,
								X0,Y0,Z0,X1,Y1,Z1,DX1,DY1,DZ1)
{
	var AX,BX,CX;
	var AY,BY,CY;
	var AZ,BZ,CZ;
	//

	var NumPoints=NumSteps-1;

	var  Result=[];

	Result[0]=[NumPoints];
	Result[1]=[NumPoints];
	Result[2]=[NumPoints];

	// find the factors

	DX1=-DX1;
	DY1=-DY1;
	DZ1=-DZ1;

	AX=X0-DX1-X1;
	BX=DX1;
	CX=X1;

	AY=Y0-DY1-Y1;
	BY=DY1;
	CY=Y1;

	AZ=Z0-DZ1-Z1;
	BZ=DZ1;
	CZ=Z1;

	// draw the curve

	var x2,y2,z2;
	var t;
	var t2;

	var Index=0;
	for (var i=1;i<NumSteps;i++) // 1 to NumSteps-1 (one less point than there are steps (i.e. 9 points for 10 steps)
	{
		t=1.0-i/NumSteps;

		t2=t*t;

		x2=(AX*t2)+(BX*t)+CX;
		y2=(AY*t2)+(BY*t)+CY;
		z2=(AZ*t2)+(BZ*t)+CZ;

		Result[0][Index]=x2;
		Result[1][Index]=y2;
		Result[2][Index]=z2;
		Index++;
	}

	return(Result);
}
/**
 * Creates a standard Bezier curve from 4 points in 2 space (x,y).
 * 
 * Used by STBezierUtil.GetBezier() and STLayerGraticules
 * 
 * @param NumSteps
 * @param X0 - Point before the curve to compute the slope at the first point (not on the curve)
 * @param Y0
 * @param X1 - Starting point (on the curve and used to determine the slope at the next point)
 * @param Y1
 * @param X2 - Ending point (slope is calculated for this point)
 * @param Y2
 * @param X3 - Additional point to compute the slope at the second point (not on the curve)
 * @param Y3
 * @return 
 */
CMUtilityBezier.GetSecondOrderPoints2D=function(NumSteps,
								X0,Y0,X1,Y1,X2,Y2,X3,Y3)
{
	var DX1,DY1;
	var DX2,DY2;

	// Find the slope at X1,Y1

	DX1=(X2-X0)/2;
	DY1=(Y2-Y0)/2;

	// Find the slope at X2,Y2

	DX2=(X3-X1)/2;
	DY2=(Y3-Y1)/2;

	var  Result=CMUtilityBezier.GetSecondOrderPointsFromSlopes2D(NumSteps,X1,Y1, X2,Y2,DX1,DY1,DX2,DY2);
	
	return(Result);
}
	
/**
 * Computes a Bezier curuve using 2 points (in 3D) amd slopes at each point.
 * 
 * Used by SBezierUtil.GetSecondOrderPoints() above.
 * 
 * @param NumSteps
 * @param X0 Starting point (on the curve and used to determine the slope at the next point)
 * @param Y0
 * @param Z0
 * @param X1 Ending point (slope is calculated for this point)
 * @param Y1
 * @param Z1
 * @param DX1 Slope at first point
 * @param DZ1
 * @param DX2 Slope at second point
 * @param DZ2
 * @return 
 */
CMUtilityBezier.GetSecondOrderPointsFromSlopes2D=function(NumSteps,
								X1,Y1,X2,Y2,DX1,DY1,DX2,DY2)
{
	//

	var NumPoints=NumSteps-1;

	var Result=[];

	Result[0]=[NumPoints];
	Result[1]=[NumPoints];

	// find the factors

	var AX,BX,CX,DX;
	var AY,BY,CY,DY;

	AX=2*(X1-X2)+DX1+DX2;
	BX=3*(X2-X1)-2*DX1-DX2;
	CX=DX1;
	DX=X1;

	AY=2*(Y1-Y2)+DY1+DY2;
	BY=3*(Y2-Y1)-2*DY1-DY2;
	CY=DY1;
	DY=Y1;

	// draw the first curve

	var x1,y1;
	var x2,y2;
	var t;
	var t2;
	var t3;

	var Index=0;
	for (var i=1;i<NumSteps;i++)
	{
		t=i/NumSteps;

		t2=t*t;
		t3=t2*t;

		x2=(AX*t3)+(BX*t2)+CX*t+DX;
		y2=(AY*t3)+(BY*t2)+CY*t+DY;

		Result[0][Index]=x2;
		Result[1][Index]=y2;
		Index++;
	}

	return(Result);
}
