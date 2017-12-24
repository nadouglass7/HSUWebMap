//******************************************************************
// SetupSettingsPanel Class
//******************************************************************
/*-- Changes check box size and margin --*/
CMPanelBackgrounds.LAYER_LIST_ITEM_HEIGHT=24;
CMPanelBackgrounds.LAYER_POPUP_MENU_ITEM_HEIGHT=24;

//******************************************************************
// Constructor
//******************************************************************

function CMPanelBackgrounds(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelBackgrounds requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	var TheScene=TheCanvasMap.GetScene();
	TheScene.AddListener(CMScene.MESSAGE_BACKGROUNDS_CHANGED,this,function(TheScene,TheListener,AdditionalInfo)
	{
		TheListener.Setup(TheScene);
	});
	
	this.TheElement=null;
	
	this.LayerListItemHeight=CMPanelBackgrounds.LAYER_LIST_ITEM_HEIGHT;
	this.LayerPopupMenuItemHeight=CMPanelBackgrounds.LAYER_POPUP_MENU_ITEM_HEIGHT;
}

CMPanelBackgrounds.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelBackgrounds.prototype.contructor=CMPanelBackgrounds; // override the constructor to go to ours
//******************************************************************
// Private Functions
//******************************************************************

//******************************************************************
// Functions
//******************************************************************

CMPanelBackgrounds.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;
}
/**
* Setup the properties panel for a selected object
*/
CMPanelBackgrounds.prototype.Setup=function(TheScene)
{
	var TheElement=this.TheElement;
	
	var Left=TheElement.style.left;
	var Top=TheElement.style.top;
	
	// TheElement.style.borderColor="#cccccc"; // border color for the layers list. style moved to CanvasMap.css.
	Left=0;
	Top=6;
	for (var i=0;(i<TheScene.Backgrounds.length);i++)
	{
		var TheBackground=TheScene.Backgrounds[i];
		
		if (i!=TheScene.SelectedBackgroundIndex) TheBackground.SetVisible(false);
		
		//
		
		var LayerInListTop=Top+(i*this.LayerListItemHeight);
		
		// create the overall div tag for the layer in the list
		
		var LayerInList=document.createElement('div');
		LayerInList.className="CM_BackgroundListItemClass";
	
		var LayerListWidth=jQuery(TheElement).outerWidth(false);
	
		CMUtilities.AbsolutePosition(LayerInList,Left+2,LayerInListTop,LayerListWidth,this.LayerListItemHeight);
		
		TheElement.appendChild(LayerInList);
	
		// add the check box
		
		var TheCheckBox=document.createElement('input');
		TheCheckBox.className="CM_BackgroundListRadioButtonClass";
		TheCheckBox.name="Background";
		TheCheckBox.value=TheScene.Backgrounds[i].Name;
		TheCheckBox.type="radio";
//		TheCheckBox.style.width="20%";
		
		TheCheckBox.TheScene=TheScene;
		TheCheckBox.TheBackground=TheScene.Backgrounds[i];
		TheCheckBox.ThisIndex=i;
		
		TheCheckBox.addEventListener('click', function()
		{
			if (this.checked)
			{
				this.TheScene.SetSelectedBackgroundIndex(this.ThisIndex);
			}
		});
		TheCheckBox.checked=false;
		
		if (TheScene.SelectedBackgroundIndex==i) TheCheckBox.checked=true;
		
		// debugging
	
		CMUtilities.AbsolutePosition(TheCheckBox,Left+2,-6,14,this.LayerListItemHeight);
		
		// Sets the position of the check boxes
		
		LayerInList.appendChild(TheCheckBox);

		//****************************************************************
		// add the name
		
		var TheLayerName=document.createElement('div');
		TheLayerName.className="CM_BackgroundListNameClass";
		
		
		TheLayerName.innerHTML=TheScene.Backgrounds[i].Name;
	
		CMUtilities.AbsolutePosition(TheLayerName,Left+30,0,150,this.LayerListItemHeight);
	
		// 
	
		LayerInList.appendChild(TheLayerName);
	}
};