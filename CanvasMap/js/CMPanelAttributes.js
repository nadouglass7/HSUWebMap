//******************************************************************
// CMTileEditor Class
//******************************************************************

//******************************************************************
// Constructor
//******************************************************************
function CMPanelAttributes(TheCanvasMap) 
{
	CMBase.call(this);

	this.SetParent(TheCanvasMap);
	
	var AttributeTableElement=null;
	
	var TheScene=TheCanvasMap.GetScene();
	
	TheScene.AddListener(CMScene.MESSAGE_LAYER_LIST_CHANGED,this,function(TheScene,TheListener,AdditionalInfo)
	{
		TheListener.UpdateAttributeTable();
	});

}
CMPanelAttributes.prototype=Object.create(CMBase.prototype); // inherit prototype functions from PanelBase()

CMPanelAttributes.prototype.contructor=CMPanelAttributes; // override the constructor to go to ours


//******************************************************************
// Private static  functions
//******************************************************************

//******************************************************************
// Public functions
//******************************************************************
/**
* 
* @public
*/
CMPanelAttributes.prototype.SetElement=function(NewAttributeTableElement) 
{
	this.AttributeTableElement=NewAttributeTableElement;
}
/**
* 
* @public
*/
CMPanelAttributes.prototype.UpdateAttributeTable=function() 
{
	var TheCanvasMap=this.GetParent(CMMainContainer);
	
	var TheScene=TheCanvasMap.GetScene();
	
	var TheLayer=null;
	for (var i=0;i<TheScene.GetNumLayers(); i++)
	{
		if (TheScene.GetLayer(i).GetSelected())
		{
			TheLayer=TheScene.GetLayer(i);
		}
	}
	if (TheLayer!=null)
	{
		try
		{
			var TheDataset=TheLayer.GetDataset();
			
			var NumRows=TheDataset.GetNumAttributeRows();
			var NumColumns=TheDataset.GetNumAttributeColumns();
			
			var TheHTML="<table border='1px' cellpadding='1' cellspacing='0'>";
			TheHTML+="<tr>";
			for (var i=0;i<NumColumns;i++) 
			{
				TheHTML+="<th>";
				TheHTML+=TheDataset.GetAttributeHeading(i);
				TheHTML+="</th>";
			}
			TheHTML+="</tr>";
			
			for (var Row=0;Row<NumRows;Row++)
			{
				TheHTML+="<tr>";
				for (var i=0;i<NumColumns;i++) 
				{
					TheHTML+="<td>";
					TheHTML+=TheDataset.GetAttributeCell(i,Row);
					TheHTML+="</td>";
				}
				TheHTML+="</tr>";
			}
			TheHTML+="</table>";
			AttributeTableElement.innerHTML=TheHTML;
		}
		catch(err) // if the layer does not have attributes, set the panel to blank
		{
			AttributeTableElement.innerHTML="";
		}
	}
}
