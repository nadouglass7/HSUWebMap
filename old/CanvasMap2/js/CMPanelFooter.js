//******************************************************************
// CMPanelFooter Class
//******************************************************************

//******************************************************************
// Constructor
//******************************************************************
function CMPanelFooter(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelFooter requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	this.CoordinateUnits=CMUtilities.COORDINATE_UNITS_DD;
	
	var TheScene=TheCanvasMap.GetScene();
	
	this.TheCanvasMap=TheCanvasMap;
	
	for (var i=0;i<TheScene.GetNumViews();i++)
	{
		var TheView=TheScene.GetView(i);
	
		TheView.AddListener(CMView.MESSAGE_MOUSE_MOVED,this,function(TheView,ThePanelFooter,TheEvent)
		{
			if (ThePanelFooter.TheCoordinates!=undefined)
			{
				var Text=TheView.GetCoordinateStringFromEvent(TheEvent,ThePanelFooter.CoordinateUnits);
				
/*				var Text=TheView.GetCoordinateString(RefX,RefY,ThePanelFooter.CoordinateUnits);
				
				var TheCanvasElement=TheView.GetCanvasElement();
				
				var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,TheCanvasElement);
				var PixelX=Coordinate.x;
				var PixelY=Coordinate.y;
		
				var RefX=TheView.GetRefXFromPixelX(PixelX);
				var RefY=TheView.GetRefYFromPixelY(PixelY);
			
				var TheProjector=ThePanelFooter.TheCanvasMap.GetProjector();
				
				var Text=CMUtilities.GetCoordinateString(RefX,RefY,ThePanelFooter.CoordinateUnits,TheProjector,TheView);
*/				
				if (Text=="") Text=" ";
				ThePanelFooter.TheCoordinates.innerHTML=Text;
			}
		});
	}
}

CMPanelFooter.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelFooter.prototype.contructor=CMPanelFooter; // override the constructor to go to ours

//******************************************************************
// private Functions
//******************************************************************
/**
* @private
*//*
CMPanelFooter.prototype.GetCoordinateString=function(RefX,RefY,TheCanvasMap)
{
	var TheView=TheCanvasMap.GetView();
	var TheProjector=TheCanvasMap.GetProjector();
	
	var Result=CMUtilities.GetCoordinateString(RefX,RefY,this.CoordinateUnits,TheProjector,TheView);
	return(Result);
}*/

//******************************************************************
// Functions
//******************************************************************
CMPanelFooter.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;
	
	var TheTable= document.createElement("TABLE"); 
	TheTable.width="100%";
	
	// Create an empty <tr> element and add it to the 1st position of the table:
	var TheRow=TheTable.insertRow(0);
	
	// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
	var LeftCell=TheRow.insertCell(0);
	var RightCell=TheRow.insertCell(1);
	
	// Add some text to the new cells:
	
	this.TheCredits= document.createElement("DIV"); 
	this.TheCredits.className="CM_Credits";
	
	RightCell.appendChild(this.TheCredits);
	RightCell.style.align="right";
	
	//******************************************************
	
	var TheTable2=document.createElement("TABLE"); 
	
	// Create an empty <tr> element and add it to the 1st position of the table:
	var TheRow1=TheTable2.insertRow(0);
	
	// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
	var TopLeftCell=TheRow1.insertCell(0);
	
	this.TheCoordinates= document.createElement("DIV"); 
	this.TheCoordinates.className="CM_MapCoordinates";
	
	TopLeftCell.appendChild(this.TheCoordinates);
	
//	if (CMUtilities.IsDefined(this.Elements[CMMainContainer.MAP_COORDINATES]))
	{
		var TheRow2=TheTable2.insertRow(1);
		
		var BottomLeftCell=TheRow2.insertCell(0);
		
		this.TheSRS= document.createElement("DIV"); 
		this.TheSRS.className="CM_SRS";
		
		BottomLeftCell.appendChild(this.TheSRS);
	}
	
	LeftCell.appendChild(TheTable2);
	
	TheElement.appendChild(TheTable);
}

CMPanelFooter.prototype.SetCredits=function(TheText)
{
	this.TheCredits.innerHTML=TheText;
}

