/*
* This provides a default settings window with the based vector drawing settings
* @override
* @public
*/
CMDialogSettings=function()
{
}
CMDialogSettings.SetStyle=function(TheLayer,Property,Key,Value)
{
	var TheStyle=TheLayer.GetProperty(Property,null);
	
	if (TheStyle==null) TheStyle={};
	
	TheStyle[Key]=Value;
	
	TheLayer.SetProperty(Property,TheStyle);
	
	TheLayer.GetScene().Repaint();
}
/**
* Pen (stroke) settings
*/
CMDialogSettings.AddPenPanel=function(TheDialog,TheLayer,Property)
{
	var YPosition=10;
	
	// create the panel
	var ThePanel=document.createElement("div");
	
	TheDialog.TheElement.appendChild(ThePanel); // add the dialog element to the document

	//*************************************************************************
	
	var XPosition=0;
	
	var TheStyle=TheLayer.GetProperty(Property,null);
	
	//  add the pen color 
	
	var strokeStyle=null;
	if (TheStyle!=null) strokeStyle=TheStyle.strokeStyle;
	
	var PenColorControl=CMDialog.AddColorControlToPanel(ThePanel,"Pen Color:",XPosition,YPosition,strokeStyle);
	PenColorControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(PenColorControl).change(function() 
	{
		CMDialogSettings.SetStyle(TheLayer,Property,"strokeStyle",this.value);
	});

	YPosition+=40;

	//  add the line cap control
	
	var Values=["None",'butt','round','square'];
	
	var lineCap="None";
	if (TheStyle!=null) lineCap=TheStyle.lineCap;
	
	var LineCapControl=CMDialog.AddSelectControlToPanel(ThePanel,"Cap:",XPosition,YPosition,Values,lineCap);
	LineCapControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LineCapControl).change(function() 
	{
		var lineCap=this.value;
		if (lineCap=="None") lineCap=undefined;
		CMDialogSettings.SetStyle(TheLayer,Property,"lineCap",this.value);
	});

	YPosition+=40;

	//  add the line join control
	
	var Values=["None",'bevel','round','miter'];
	
	var lineJoin="None";
	if (TheStyle!=null) lineJoin=TheStyle.lineJoin;
	
	var LineJoinControl=CMDialog.AddSelectControlToPanel(ThePanel,"Join:",XPosition,YPosition,Values,lineJoin);
	LineJoinControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LineJoinControl).change(function() 
	{
		var lineJoin=this.value;
		if (lineJoin=="None") lineJoin=undefined;
		CMDialogSettings.SetStyle(TheLayer,Property,"lineJoin",lineJoin);
	});

	YPosition+=40;

	//  add the line width control
	
	var miterLimit=null;
	if (TheStyle!=null) miterLimit=TheStyle.miterLimit;
	
	var MiterLimitControl=CMDialog.AddTextControlToPanel(ThePanel,"Miter Limit:",XPosition,YPosition,miterLimit);
	MiterLimitControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(MiterLimitControl).change(function() 
	{
		if (this.value=="") this.value=undefined;
		CMDialogSettings.SetStyle(TheLayer,Property,"miterLimit",this.value);
	});

	YPosition+=40;

	//  add the line width control
	
	var lineWidth=null;
	if (TheStyle!=null) lineWidth=TheStyle.lineWidth;
	
	var LineWidthControl=CMDialog.AddTextControlToPanel(ThePanel,"Width:",XPosition,YPosition,lineWidth);
	LineWidthControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LineWidthControl).change(function() 
	{
		if (this.value=="") this.value=undefined;
		CMDialogSettings.SetStyle(TheLayer,Property,"lineWidth",this.value);
	});

	YPosition+=50;

	// add the fill style
	
	var fillStyle=null;
	if (TheStyle!=null) fillStyle=TheStyle.fillStyle;
	
	var FillColorControl=CMDialog.AddColorControlToPanel(ThePanel,"Fill Color:",XPosition,YPosition,fillStyle);
	FillColorControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FillColorControl).change(function() 
	{
		var RGBAColor=CMDialog.GetRGBAFromControls(this,this.FillTransparencyControl);
		
		CMDialogSettings.SetStyle(this.TheLayer,Property,"fillStyle",RGBAColor);
	});

	YPosition+=40;

	//  add the fill color  transparency control
	
	var Transparency=100;
	if (TheStyle!=null)
	{
		var fillStyle=TheStyle.fillStyle;
		var Result=CMUtilities.GetRGBAValuesFromRGBA(fillStyle);
		Transparency=Result.Transparency*100.0;
	}
	var FillTransparencyControl=CMDialog.AddSliderControlToPanel(ThePanel,"Transparency:",XPosition,YPosition,0,100,Transparency);
	FillTransparencyControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FillTransparencyControl).change(function() 
	{
		var RGBAColor=CMDialog.GetRGBAFromControls(this.FillColorControl,this);
		
		CMDialogSettings.SetStyle(this.TheLayer,Property,"fillStyle",RGBAColor);
	});
	// cross-link the controls so their event handlers can access them
	FillTransparencyControl.FillColorControl=FillColorControl;
	FillColorControl.FillTransparencyControl=FillTransparencyControl;

	YPosition+=40;

	// the two fill controls must be able to see each other
	
	FillColorControl.FillTransparencyControl=FillTransparencyControl;
	FillTransparencyControl.FillColorControl=FillColorControl;
	
	//****************************************************************************************
	// Shadow settings
	// Shadows cause major performance problems so they are off for now
	
	XPosition=270;
	YPosition=10;
	
	var TheLineHeading=CMDialog.AddLabelToPanel(ThePanel,"Shadow Settings:",XPosition,YPosition);
	TheLineHeading.style.fontSize="18px";
	
	YPosition+=40;
	
	// Shadow color
	var shadowColor=null;
	if (TheStyle!=null) shadowColor=TheStyle.shadowColor;
	
	var ShadowColorControl=CMDialog.AddColorControlToPanel(ThePanel,"Color:",XPosition,YPosition,shadowColor);
	ShadowColorControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(ShadowColorControl).change(function() 
	{
		CMDialogSettings.SetStyle(this.TheLayer,Property,"shadowColor",this.value);
	});

	YPosition+=40;

	//  shadow blur
	var shadowBlur=0;
	if (TheStyle!=null) shadowBlur=TheStyle.shadowBlur;
	
	var ShadowBlurControl=CMDialog.AddTextControlToPanel(ThePanel,"Blur:",XPosition,YPosition,shadowBlur);
	ShadowBlurControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(ShadowBlurControl).change(function() 
	{
		CMDialogSettings.SetStyle(this.TheLayer,Property,"shadowBlur",this.value);
	});

	YPosition+=40;

	//  shadow x offset
	
	var shadowOffsetX=0;
	if (TheStyle!=null) shadowOffsetX=TheStyle.shadowOffsetX;
	
	var ShadowOffsetX=CMDialog.AddTextControlToPanel(ThePanel,"X Offset:",XPosition,YPosition,shadowOffsetX);
	ShadowOffsetX.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(ShadowOffsetX).change(function() 
	{
		CMDialogSettings.SetStyle(this.TheLayer,Property,"shadowOffsetX",this.value);
	});

	YPosition+=40;

	// shadow y offset
	
	var shadowOffsetY=0;
	if (TheStyle!=null) shadowOffsetY=TheStyle.shadowOffsetY;
	
	var ShadowOffsetY=CMDialog.AddTextControlToPanel(ThePanel,"Y Offset:",XPosition,YPosition,shadowOffsetY);
	ShadowOffsetY.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(ShadowOffsetY).change(function() 
	{
		CMDialogSettings.SetStyle(this.TheLayer,Property,"shadowOffsetY",this.value);
	});

	return(ThePanel);
};
//********************************************************************************************
/**
* General Settings
*/
CMDialogSettings.AddGeneralPanel=function(TheDialog,TheLayer,Property)
{
	var YPosition=10;
	var XPosition=10;
	
	// create the panel
	var ThePanel=document.createElement("div");
	
	TheDialog.TheElement.appendChild(ThePanel); // add the dialog element to the document
	
	//****************************************************************************************
	//  add the global color  transparency control

	var TheStyle=TheLayer.GetProperty(Property,null);
	
	var Transparency=100;
	if (TheStyle!=null)
	{
		var globalAlpha=TheStyle.globalAlpha;
		Transparency=globalAlpha*100.0;
	}
	var GlobalAlphaControl=CMDialog.AddSliderControlToPanel(ThePanel,"Global Opacity:",XPosition,YPosition,0,100,Transparency);
	GlobalAlphaControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(GlobalAlphaControl).change(function() 
	{
		var Transparency=GlobalAlphaControl.value/100;
		if (Transparency>1) Transparency=1;
		if (Transparency<0) Transparency=0;
		
		CMDialogSettings.SetStyle(TheLayer,Property,"globalAlpha",Transparency);
	});

	// ***********************************************************************
	// add the attribute info
	
	YPosition+=40;
	
	var InfoAttribute=TheLayer.GetPropertyAttribute(CMLayer.INFO);
	
	var Headings=TheLayer.GetDataset().GetAttributeHeadings();
	
	var InfoAttributeControl=CMDialog.AddSelectControlToPanel(ThePanel,"Attribute:",XPosition,YPosition,Headings,InfoAttribute);
	
	InfoAttributeControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(InfoAttributeControl).change(function() 
	{
		var InfoAttribute=InfoAttributeControl.value;
		this.TheLayer.SetPropertyAttribute(CMLayer.INFO,InfoAttribute);
		this.TheLayer.GetScene().Repaint();
	});
	
	return(ThePanel);
};
//********************************************************************************************
/**
* Label Settings
*/
CMDialogSettings.Fonts=["Arial","Verdana","Times New Roman","Courier New","serif","sans-serif"];
CMDialogSettings.FontWeights=["normal","bold","bolder","lighter"];

CMDialogSettings.LabelDirectionStrings=["Top Left","Top","Top Right","Right","Bottom Right","Bottom","Bottom Left","Left"];

CMDialogSettings.AddFontPanel=function(TheDialog,TheLayer)
{
	var XPosition=10;
	var YPosition=10;
	
	// create the panel
	var ThePanel=document.createElement("div");
	
	TheDialog.TheElement.appendChild(ThePanel); // add the dialog element to the document

	var TheFontString=TheLayer.GetProperty(CMLayer.LABEL_FONT,null);
	
	//****************************************************************************************
	//  add the global color  transparency control
	
	var FontSize="40";
	var FontFamily="Arial";
	var FontWeight="normal";
	var FontItalic=false;
	
	// setup the variables
	
	if (TheFontString!=null)
	{
		var Index=TheFontString.indexOf("px");
		if (Index!=-1)
		{
			var Temp=TheFontString.substring(0,Index);
			var Index2=Temp.lastIndexOf(" ");
			if (Index2!=-1) Temp=Temp.substring(Index2+1);
			FontSize=parseInt(Temp);
		}
		for (var i=0;i<CMDialogSettings.Fonts.length;i++)
		{
			if (TheFontString.indexOf(CMDialogSettings.Fonts[i])!=-1) FontFamily=CMDialogSettings.Fonts[i];
		}
		for (var i=0;i<CMDialogSettings.FontWeights.length;i++)
		{
			if (TheFontString.indexOf(CMDialogSettings.FontWeights[i])!=-1) FontWeight=CMDialogSettings.FontWeights[i];
		}
		
		if (TheFontString.indexOf("italic")!=-1) FontItalic=true;
	}
	//*******************************************
	
	var FontControl=CMDialog.AddSelectControlToPanel(ThePanel,"Font Family:",XPosition,YPosition,CMDialogSettings.Fonts,FontFamily);
	FontControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FontControl).change(function() 
	{
		CMDialogSettings.SetFont(this.Controls,this.TheLayer);
	});
	//
	
	YPosition+=40;
	
	var FontWeightControl=CMDialog.AddSelectControlToPanel(ThePanel,"Font Weight:",XPosition,YPosition,CMDialogSettings.FontWeights,FontWeight);
	FontWeightControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FontWeightControl).change(function() 
	{
		CMDialogSettings.SetFont(this.Controls,this.TheLayer);
	});

	//  font size
	
	YPosition+=40;
	
	var FontSizeControl=CMDialog.AddTextControlToPanel(ThePanel,"Font Size:",XPosition,YPosition,FontSize);
	FontSizeControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FontSizeControl).change(function() 
	{
		CMDialogSettings.SetFont(this.Controls,this.TheLayer);
	});

	YPosition+=40;
	
	//*********************************************************************************************
	// cross link the font controls so the event handlers can access all the font values
	
	var Controls={
		FontControl:FontControl,
		FontWeightControl:FontWeightControl,
		FontSizeControl:FontSizeControl
	};
	FontControl.Controls=Controls;
	FontWeightControl.Controls=Controls;
	FontSizeControl.Controls=Controls;
	
	//*********************************************************************************************
	// cross link the controls
	//  font size
	
	LabelDirection="TR";
	
	var LabelPosition=TheLayer.GetProperty(CMLayer.LABEL_POSITION);
	if (LabelPosition!=null)
	{
		LabelDirection=LabelPosition.Direction;
	}
	var Index=CMLayer.LabelDirections.indexOf(LabelDirection);
	LabelDirectionString=CMDialogSettings.LabelDirectionStrings[Index];
	var LabelPositionControl=CMDialog.AddSelectControlToPanel(ThePanel,"Direction:",XPosition,YPosition,
		CMDialogSettings.LabelDirectionStrings,LabelDirectionString);
	LabelPositionControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LabelPositionControl).change(function() 
	{
		var SelectedDirection=LabelPositionControl.selectedIndex;
		var LabelPosition=this.TheLayer.GetProperty(CMLayer.LABEL_POSITION);
		LabelPosition.Direction=CMLayer.LabelDirections[SelectedDirection];
		this.TheLayer.SetProperty(CMLayer.LABEL_POSITION,LabelPosition);
		this.TheLayer.GetScene().Repaint();
	});

	YPosition+=40;
	
	// position x offset
	
	var LabelOffsetX=10;
	if (LabelPosition!=null)
	{
		LabelOffsetX=LabelPosition.OffsetX;
	}
	var OffsetXControl=CMDialog.AddTextControlToPanel(ThePanel,"X Offset:",XPosition,YPosition,LabelOffsetX);
	OffsetXControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(OffsetXControl).change(function() 
	{
		var LabelPosition=this.TheLayer.GetProperty(CMLayer.LABEL_POSITION);
		LabelPosition.OffsetX=parseInt(OffsetXControl.value);
		this.TheLayer.SetProperty(CMLayer.LABEL_POSITION,LabelPosition);
		this.TheLayer.GetScene().Repaint();
	});
	YPosition+=40;
	
	// position y offset
	
	var LabelOffsetY=10;
	if (LabelPosition!=null)
	{
		LabelOffsetY=LabelPosition.OffsetY;
	}
	var OffsetYControl=CMDialog.AddTextControlToPanel(ThePanel,"Y Offset:",XPosition,YPosition,LabelOffsetY);
	OffsetYControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(OffsetYControl).change(function() 
	{
		var LabelPosition=this.TheLayer.GetProperty(CMLayer.LABEL_POSITION);
		LabelPosition.OffsetY=parseInt(OffsetYControl.value);
		this.TheLayer.SetProperty(CMLayer.LABEL_POSITION,LabelPosition);
		this.TheLayer.GetScene().Repaint();
	});

	// ***********************************************************************
	// right side of the panel
	
	var XPosition=300;
	var YPosition=10;
	
	var LabelAttribute=TheLayer.GetPropertyAttribute(CMLayer.LABEL);
	
	var Headings=TheLayer.GetDataset().GetAttributeHeadings();
	
	var LabelPositionControl=CMDialog.AddSelectControlToPanel(ThePanel,"Attribute:",XPosition,YPosition,Headings,LabelAttribute);
	
	LabelPositionControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LabelPositionControl).change(function() 
	{
		var LabelAttribute=LabelPositionControl.value;
		this.TheLayer.SetPropertyAttribute(CMLayer.LABEL,LabelAttribute);
		this.TheLayer.GetScene().Repaint();
	});
	
	return(ThePanel);
};
/**
*
*/
CMDialogSettings.MarkTypes=["Circle","Triangle","Square","Star"];

CMDialogSettings.AddMarkPanel=function(TheDialog,TheLayer)
{
	var XPosition=10;
	var YPosition=10;
	
	// create the panel
	var ThePanel=document.createElement("div");
	
	TheDialog.TheElement.appendChild(ThePanel); // add the dialog element to the document

	//*********************************************************************************************
	// cross link the controls
	//  font size
	
	var MarkType=TheLayer.GetProperty(CMLayer.MARK_TYPE);
	
	var MarkTypeControl=CMDialog.AddSelectControlToPanel(ThePanel,"Mark Type:",XPosition,YPosition,
		CMDialogSettings.MarkTypes,CMDialogSettings.MarkTypes[MarkType]);
	
	MarkTypeControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(MarkTypeControl).change(function() 
	{
		var SelectedIndex=this.selectedIndex;
		
		// the mark types are numbered from 0 so we can juse use the selected index as the mark type
		this.TheLayer.SetProperty(CMLayer.MARK_TYPE,SelectedIndex);
		this.TheLayer.GetScene().Repaint();
	});

	YPosition+=40;
	
	// position x offset
	
	var MarkSize=TheLayer.GetProperty(CMLayer.MARK_SIZE);
	
	var MarkSizeControl=CMDialog.AddTextControlToPanel(ThePanel,"Mark Size:",XPosition,YPosition,MarkSize);
	MarkSizeControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(MarkSizeControl).change(function() 
	{
		var MarkSize=parseInt(this.value);
		this.TheLayer.SetProperty(CMLayer.MARK_SIZE,MarkSize);
		this.TheLayer.GetScene().Repaint();
	});
	
	return(ThePanel);
};

/**
* Sets the font into the layers styles
*/
CMDialogSettings.SetFont=function(TheControls,TheLayer)
{
	var Font=TheControls.FontControl.value;
	var FontSize=TheControls.FontSizeControl.value;
	var FontWeight=TheControls.FontWeightControl.value;
	
	var FontString=FontWeight+" "+FontSize+"px "+Font;
	
	TheLayer.SetProperty(CMLayer.LABEL_FONT,FontString);
	TheLayer.GetScene().Repaint();
}
/**
* Utility function to hide all the panels used to make it easier to make one panel
* visible and to hide all the panels on exit
*/
CMDialogSettings.HidePanels=function(TheDialog) 
{
	for (var i=0;i<TheDialog.Panels.length;i++)
	{
		TheDialog.Panels[i].style.visibility="hidden";
		TheDialog.Tabs[i].className="CM_SettingsDialogTab";
	}
};
/**
* Add a tab to the dialog
*/
CMDialogSettings.AddTab=function(TheOrderedList,TheDialog,Name,XPosition,YPosition,Width,Height,TargetPanel)
{
	var TheListItem=document.createElement("LI");
	TheListItem.className="CM_SettingsDialogTab";
	
	TheOrderedList.appendChild(TheListItem);

	var textnode=document.createTextNode(Name);
	TheListItem.appendChild(textnode);
	
	TheListItem.TargetPanel=TargetPanel;
	TheListItem.TargetTab=TheListItem;
	TheListItem.TheDialog=TheDialog;
	
	TheListItem.addEventListener("click", function()
	{
		CMDialogSettings.HidePanels(this.TheDialog);
		this.TargetTab.className="CM_SettingsDialogTab_Selected";
		this.TargetPanel.style.visibility="visible";
	});
	return(TheListItem);
}
//********************************************************************************************
/**
* Main entry point to display the settings dialog to the user
*/
CMDialogSettings.ShowSettingsDialog=function(TheLayer) 
{
	var YPosition=10;
	var XPosition=10;
	
	// get the dialog, create it if needed
	
	var TheDialog=new CMDialog("LayerVector_Settings_Dialog",600,400); // dialog width and height
	
	TheDialog.SuperClass_SetVisible=TheDialog.SetVisible; // does not call function, just moves a reference to it
	
	TheDialog.SetVisible=function(Flag)
	{
		this.SuperClass_SetVisible(Flag);
		
		if (Flag===false)
		{
			CMDialogSettings.HidePanels(this);
		}
	}
	
	if (TheLayer.TheStyle==null) TheLayer.TheStyle={};
	
	// add the ordered list for the tabs at the top
	var TheOrderedList=document.createElement("UL");
	TheDialog.TheElement.appendChild(TheOrderedList);
	
	// setup the panels
	
	var GeneralPanel=CMDialogSettings.AddGeneralPanel(TheDialog,TheLayer,CMLayer.FEATURE_STYLE);
	GeneralPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(GeneralPanel,10,40,500,500);

	var PenPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.FEATURE_STYLE);
	PenPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(PenPanel,10,40,500,500);
	
	var LabelPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.LABEL_STYLE);
	LabelPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(LabelPanel,10,40,500,500);
	
	var FontPanel=CMDialogSettings.AddFontPanel(TheDialog,TheLayer);
	FontPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(FontPanel,10,40,500,500);
	
	var MarkPanel=CMDialogSettings.AddMarkPanel(TheDialog,TheLayer);
	MarkPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(MarkPanel,10,40,500,500);
	
	var MouseOverPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.MOUSE_OVER_STYLE);
	MouseOverPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(MouseOverPanel,10,40,500,500);
	
	var SelectedPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.SELECTED_STYLE);
	SelectedPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(SelectedPanel,10,40,500,500);
	
	// add the panels to the dialog for access later
	
	TheDialog.Panels=[];
	TheDialog.Tabs=[];
	
	TheDialog.Panels.push(GeneralPanel);
	TheDialog.Panels.push(PenPanel);
	TheDialog.Panels.push(LabelPanel);
	TheDialog.Panels.push(FontPanel);
	TheDialog.Panels.push(MarkPanel);
	TheDialog.Panels.push(MouseOverPanel);
	TheDialog.Panels.push(SelectedPanel);

	// setup the tab buttons
	var TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"General",XPosition,YPosition,100,30,GeneralPanel);
	TheDialog.Tabs.push(TheTab);
	
	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Feature",XPosition,YPosition,100,30,PenPanel);
	TheDialog.Tabs.push(TheTab);
	
	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Labels",XPosition,YPosition,100,30,LabelPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Font",XPosition,YPosition,100,30,FontPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Marks",XPosition,YPosition,100,30,MarkPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Mouse",XPosition,YPosition,100,30,MouseOverPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Selected",XPosition,YPosition,100,30,SelectedPanel);
	TheDialog.Tabs.push(TheTab);

	// make the first panel visible
	CMDialogSettings.HidePanels(TheDialog);
	TheDialog.Panels[0].style.visibility="visible";
	

	return(TheDialog);
};
/**
* Main entry point to display the settings dialog to the user
*/
CMDialogSettings.ShowSettingsDialogForStyle=function(TheStyle) 
{
	var YPosition=10;
	var XPosition=10;
	
	// get the dialog, create it if needed
	
	var TheDialog=new CMDialog("LayerVector_Settings_Dialog",600,400); // dialog width and height
	
	TheDialog.SuperClass_SetVisible=TheDialog.SetVisible; // does not call function, just moves a reference to it
	
	TheDialog.SetVisible=function(Flag)
	{
		this.SuperClass_SetVisible(Flag);
		
		if (Flag===false)
		{
			CMDialogSettings.HidePanels(this);
		}
	}
	
	if (TheStyle==null) TheStyle={};
	
	// add the ordered list for the tabs at the top
	var TheOrderedList=document.createElement("UL");
	TheDialog.TheElement.appendChild(TheOrderedList);
	
	// setup the panels
	
	var LabelPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.LABEL_STYLE);
	LabelPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(LabelPanel,10,40,500,500);
	
	var FontPanel=CMDialogSettings.AddFontPanel(TheDialog,TheLayer);
	FontPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(FontPanel,10,40,500,500);
	
	// add the panels to the dialog for access later
	
	TheDialog.Panels=[];
	TheDialog.Tabs=[];
	
	TheDialog.Panels.push(LabelPanel);
	TheDialog.Panels.push(FontPanel);

	// setup the tab buttons
	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Labels",XPosition,YPosition,100,30,LabelPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Font",XPosition,YPosition,100,30,FontPanel);
	TheDialog.Tabs.push(TheTab);

	// make the first panel visible
	CMDialogSettings.HidePanels(TheDialog);
	TheDialog.Panels[0].style.visibility="visible";

	return(TheDialog);
};