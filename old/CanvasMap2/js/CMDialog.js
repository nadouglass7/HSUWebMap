/**
* Classes for creating dialog boxes in the web site
* Depricated in favor of useing Bootstrap dialogs.
*/
/**
* Default dialog dimensions.  These are private
*/
CMDialog.DIALOG_WIDTH=400;
CMDialog.DIALOG_HEIGHT=400;
//******************************************************************
// Private Static Functions
//******************************************************************
/**
* Add a close box to the dialog box
*/
CMDialog.CreateCloseBox=function(TheDialog,X,Y,CloseBoxWidth,CloseBoxHeight,TheColor)
{
	var CloseBox = document.createElement("canvas"); // create the DIV element
	CMUtilities.AbsolutePosition(CloseBox,X,Y,CloseBoxWidth,CloseBoxHeight);
	CloseBox.style.border="1px solid "+TheColor;
	CloseBox.width=CloseBoxWidth;
	CloseBox.height=CloseBoxHeight;
	
	if (TheDialog instanceof CMDialog) TheDialog.TheElement.appendChild(CloseBox); // add the DisablePage element to the document
	else TheDialog.appendChild(CloseBox);
	
	CloseBox.TheDialog=TheDialog;
	CloseBox.onmousedown=function(TheEvent)
	{
		if (this.TheDialog instanceof CMDialog) this.TheDialog.SetVisible(false);
		else this.TheDialog.style.visibility="hidden";
	};
	// paint the contents of the dialog
	
	CMDialog.PaintCloseBox(CloseBox,CloseBoxWidth,CloseBoxHeight,TheColor);

	return(CloseBox);
}
/**
* Private function to paint the close box
*/
CMDialog.PaintCloseBox=function(CloseBox,CloseBoxWidth,CloseBoxHeight,TheColor)
{
	var TheContext=CloseBox.getContext("2d");
	TheContext.strokeStyle=TheColor;
	TheContext.lineWidth=2;
	
	TheContext.beginPath();
	TheContext.moveTo(0,0);
	TheContext.lineTo(CloseBoxWidth,CloseBoxHeight);
	TheContext.stroke();
	
	TheContext.beginPath();
	TheContext.moveTo(CloseBoxWidth,0);
	TheContext.lineTo(0,CloseBoxHeight);
	TheContext.stroke();
	
	TheContext.strokeRect(1,1,CloseBoxWidth-2,CloseBoxHeight-2);
}
//******************************************************************
// Constructors
//******************************************************************
/*
* Constructor for the dialog
* @public
* @param ID - element ID for the dialog
* @param Width - width of the dialog in pixels (-1 for default)
* @param Height - Height of the dialog in pixels (-1 for default)
* @param PageDisabled - true to have mouse clicks in the rest of the browser disabled until the dialog is closed.
*/
function CMDialog(ID,Width,Height,PageDisabled) 
{
	if (Width==-1) Width=CMDialog.DIALOG_WIDTH;
	if (Height==-1) Height=CMDialog.DIALOG_HEIGHT;
	
	// Create the DIV element for the dialog if not already created
	
	this.TheElement=document.getElementById(ID);
	if (this.TheElement==null)
	{
		this.TheElement=document.createElement("DIV"); // create the DIV element
	
		this.TheElement.id=ID; // set the ID so we can get it back
	
		document.body.appendChild(this.TheElement); // add the dialog element to the document
	}
	else // remove the current contents of the DIV
	{
		while (this.TheElement.firstChild) // while there is a first element in the dialog
		{
			// removing the first element moves the next element to the first position
			// so this little loop will remove all the elements from another element
			this.TheElement.removeChild(this.TheElement.firstChild);
		}
	}
	// setup the position of the dialog
	
	this.TheElement.className="CM_SettingsDialog";
	this.TheElement.style.visibility="visible";
	
	var DocumentHeight=$(window).height(); 
	var DocumentWidth=$(window).width();
	
	var X=(DocumentWidth-Width)/2;
	var Y=(DocumentHeight-Height)/2;
	
	CMUtilities.AbsolutePosition(this.TheElement,X,Y,Width,Height);
	
	// add the close box
	
	var CloseBox=CMDialog.CreateCloseBox(this,Width-26,10,16,16,"#ffffff");
/*	
	var CloseBox = document.createElement("canvas"); // create the DIV element
	CMUtilities.AbsolutePosition(CloseBox,Width-26,10,CloseBoxWidth,CloseBoxHeight);
	CloseBox.style.border="2px solid #ffffff;";
	CloseBox.width=CloseBoxWidth;
	CloseBox.height=CloseBoxHeight;
	this.TheElement.appendChild(CloseBox); // add the DisablePage element to the document
	
	CloseBox.TheDialog=this;
	CloseBox.onmousedown=function(TheEvent)
	{
		this.TheDialog.SetVisible(false);
	};
	PaintCloseBox(CloseBox,CloseBoxWidth,CloseBoxHeight);
	var TheContext=CloseBox.getContext("2d");
	TheContext.strokeStyle="#FFFFFF";
	TheContext.lineWidth=2;
	
	TheContext.beginPath();
	TheContext.moveTo(0,0);
	TheContext.lineTo(CloseBoxWidth,CloseBoxHeight);
	TheContext.stroke();
	
	TheContext.beginPath();
	TheContext.moveTo(CloseBoxWidth,0);
	TheContext.lineTo(0,CloseBoxHeight);
	TheContext.stroke();
	
	TheContext.strokeRect(1,1,CloseBoxWidth-2,CloseBoxHeight-2);
	*/
	//****************************************************
	// setup the DisablePage for the dialog
	// This has some issues but covers the entire page with a div to keep the user from cliccking on things
	// i.e. makes the dialog modal
	
	var DisablePageID = "DialogDisablePage"
	this.DisablePage=document.getElementById(DisablePageID);
	if(this.DisablePage==null)
	{
		this.DisablePage=document.createElement("DIV"); // create the DIV element
		this.DisablePage.id=DisablePageID; // set the ID so we can get it back
		document.body.appendChild(this.DisablePage); // add the DisablePage element to the document
	}
	this.DisablePage.style.visibility="hidden";

	if (PageDisabled)
	{
		this.DisablePage.style.backgroundColor="white"; // set the background color of the div element
		this.DisablePage.style.visibility="visible"
		this.DisablePage.style.opacity="0.5"; // set the opacity to 50%
		this.DisablePage.style.zIndex="99999999"; // set the zIndex to be 1 lower than the dialog, placing it directly behind it
												// but above all over elements in the DOM. 
		var DocumentHeight=$(window).height(); 
		var DocumentWidth=$(window).width();

		X=0;
		Y=0;

		CMUtilities.AbsolutePosition(this.DisablePage,X,Y,DocumentWidth,DocumentHeight);
	}
}
//******************************************************************
// Functions to get and set settings
//******************************************************************
/*
* Makes the dialog visible or invisible
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
*/
CMDialog.prototype.SetVisible=function(New)
{
	if (New)  
	{
		this.TheElement.style.visibility="visible";
		this.DisablePage.style.visibility="visible";
	}
	else 
	{
		this.TheElement.style.visibility="hidden";
		this.DisablePage.style.visibility="hidden";
	}
}
//******************************************************************
// Functions to add widjets
//******************************************************************
/*
* Adds a text label to the dialog
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
*/
CMDialog.AddLabelToPanel=function(TheElement,Text,XOffset,YPosition)
{
	var Label=document.createElement("div");
	Label.innerHTML=Text;
	TheElement.appendChild(Label); // add the dialog element to the document
	CMUtilities.AbsolutePosition(Label,XOffset+10,YPosition,300,30);
	
	return(Label);
}
/*
* Adds a paragraph of text to the dialog.
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Width - width of the paragraph
* @param Height - height of the paragraph
* buttons.
*/
CMDialog.AddParagraphToPanel=function(TheElement,Text,XOffset,YPosition,Width,Height)
{	
	// add the paragraph
	
	var TheControl=document.createElement("p");
	TheControl.innerHTML=Text;
	TheElement.appendChild(TheControl); // add the dialog element to the document

	CMUtilities.AbsolutePosition(TheControl,XOffset+10,YPosition,Width,Height);
	
	return(TheControl);
}
/*
* Creates a color control that displays a color picker
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - Initial value
* buttons.
*/
CMDialog.AddColorControlToPanel=function(TheElement,Label,XOffset,YPosition,Value)
{
	var PenColorLabel=document.createElement("div");
	PenColorLabel.innerHTML=Label;
	TheElement.appendChild(PenColorLabel); // add the dialog element to the document
	CMUtilities.AbsolutePosition(PenColorLabel,XOffset+10,YPosition,100,30);
	
	var PenColorControl=document.createElement("input");
	
	// using a container and lettnig the browser decide the type of control allows
	// us to be compatible with IE (text field) and the other browsers (color pickters)
	
	var ColorControlContainer=document.createElement("div");
	ColorControlContainer.innerHTML="<input id='ColorControl' type='color'>";
	var PenColorControl=ColorControlContainer.childNodes[0];
	
	// must convert the value to #ffffff format
	
	Value=CMUtilities.GetHexColorFromColor(Value);

	PenColorControl.value=Value;
	TheElement.appendChild(PenColorControl); // add the dialog element to the document
	CMUtilities.AbsolutePosition(PenColorControl,XOffset+110,YPosition,100,20);
	
	return(PenColorControl);
}
/*
* Creates a button with text in it.
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* buttons.
*/
CMDialog.AddButtonControlToPanel=function(TheElement,Text,XOffset,YPosition)
{
	var OKButton=document.createElement("button");
//	OKButton.setAttribute("type", "button"); 
	var ButtonText = document.createTextNode(Text);
    OKButton.appendChild(ButtonText);
	TheElement.appendChild(OKButton); // add the dialog element to the document
	CMUtilities.AbsolutePosition(OKButton,XOffset+10,YPosition,80,30);
	
	return(OKButton);
}
/*
* Function to create a slider control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Min - minimum value for the contorl (i.e. left side)
* @param Max - maximum value for the control (i.e. right side)
* @param Value - initial value for the control
* buttons.
*/
CMDialog.AddSliderControlToPanel=function(TheElement,Text,XOffset,YPosition,Min,Max,Value)
{
	var PenColorLabel=CMUtilities.CreateLabelControl(Text);
	CMUtilities.AbsolutePosition(PenColorLabel,XOffset+10,YPosition,80,30);
	TheElement.appendChild(PenColorLabel); // add the dialog element to the document
	
	var SliderControl=CMUtilities.CreateSliderControl(Min,Max,Value);
	CMUtilities.AbsolutePosition(SliderControl,XOffset+110,YPosition,100,30);
	TheElement.appendChild(SliderControl); // add the dialog element to the document

	return(SliderControl);
}
/*
* Function to create a check box control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - true or false initial state of the checkbox
* buttons.
*/
CMDialog.AddCheckBoxControlToPanel=function(TheElement,Text,XOffset,YPosition,Value)
{
	// add the checkbox
	
	var TheControl=document.createElement("input");
	TheControl.type="checkbox";
	TheControl.name=Text;
	TheControl.text=Text;
	
	if (Value) TheControl.checked=true;
	else TheControl.checked=false;
	
	TheElement.appendChild(TheControl); // add the dialog element to the document

	CMUtilities.AbsolutePosition(TheControl,XOffset,YPosition,40,30);
	
	// add a label after the checkbox
	
	var TheLabel=document.createElement("div");
	TheLabel.innerHTML=Text;
	TheElement.appendChild(TheLabel); // add the dialog element to the document
	CMUtilities.AbsolutePosition(TheLabel,XOffset+60,YPosition+8,80,30);
	
	return(TheControl);
}
/*
* Function to create a text edit control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - initial contents of the control
* buttons.
*/
CMDialog.AddTextControlToPanel=function(TheElement,Text,XOffset,YPosition,Value)
{
	// add a label after the checkbox
	
	var TheLabel=document.createElement("div");
	TheLabel.innerHTML=Text;
	TheElement.appendChild(TheLabel); // add the dialog element to the document
	CMUtilities.AbsolutePosition(TheLabel,XOffset+10,YPosition+8,100,30);
	
	// add the checkbox
	
	var TheControl=document.createElement("input");
	TheControl.type="text";
	TheControl.name=Text;
	if (Value!=undefined) TheControl.value=Value;
	TheElement.appendChild(TheControl); // add the dialog element to the document

	CMUtilities.AbsolutePosition(TheControl,XOffset+110,YPosition,80,24);
	
	return(TheControl);
}
/*
* Function to create a group of radio buttons.
*
* To determine which buttons is pressed, you will need to go through the returned array
* and see which value is "checked" (i.e. Result[i].checked=true).
*
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Values - array of values for the radio buttons.  These will be the names of the
* buttons.
* @param Selected - the selected value from values or "null" for none
*/
CMDialog.AddRadioControlToPanel=function(TheElement,Name,XOffset,YPosition,Values,Selected)
{
	var Result=[];
	
	for (var i=0;i<Values.length;i++)
	{
		// add the radiobuttons
		
		var TheControl=document.createElement("input");
		TheControl.type="radio";
		TheControl.name=Name;
		TheControl.value=Values[i];
		
		if (Selected==Values[i]) 
		{
			TheControl.checked=true;
		}
		TheElement.appendChild(TheControl); // add the dialog element to the document
	
		CMUtilities.AbsolutePosition(TheControl,XOffset+10,YPosition,24,24);
		
		// add a label after the checkbox
		
		var TheLabel=document.createElement("div");
		TheLabel.innerHTML=Values[i];
		TheElement.appendChild(TheLabel); // add the dialog element to the document
		CMUtilities.AbsolutePosition(TheLabel,XOffset+50,YPosition+8,100,30);
		
		YPosition+=30;
		
		Result.push(TheControl);
	}
	return(Result);
}
/*
* Function to create a select (popup menu) control
*
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Values - array of values for the radio buttons.  These will be the names of the
* buttons.
* @param Selected - the selected value from values or "null" for none
*/
CMDialog.AddSelectControlToPanel=function(TheElement,Name,XOffset,YPosition,Values,Selected)
{
	var Result=[];
	var SelectedIndex=-1;
	
	// add a label after the checkbox
	
	var TheLabel=document.createElement("div");
	TheLabel.innerHTML=Name;
	TheElement.appendChild(TheLabel); // add the dialog element to the document
	CMUtilities.AbsolutePosition(TheLabel,XOffset+10,YPosition+8,100,30);
	
	// add the control
	
	var TheControl=CMUtilities.CreateSelectControl(Values,Selected);
	
//	var TheControl=document.createElement("SELECT");
	TheControl.name=Name;
	TheElement.appendChild(TheControl); // add the dialog element to the document
	
	CMUtilities.AbsolutePosition(TheControl,XOffset+110,YPosition,150,24);
	
/*	for (var i=0;i<Values.length;i++)
	{
		if (Selected==Values[i]) SelectedIndex=i;
	
		var option = document.createElement("option");
		option.text =Values[i];
		TheControl.add(option);
	}
	if (SelectedIndex!=-1) TheControl.selectedIndex=SelectedIndex;
*/	
	return(TheControl);
}
//******************************************************************
// Functions to add widjets
//******************************************************************
/*
* Adds a text label to the dialog
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
*/
CMDialog.prototype.AddLabel=function(Text,XOffset,YPosition)
{
	var Label=CMDialog.AddLabelToPanel(this.TheElement,Text,XOffset,YPosition);
	
	return(Label);
}
/*
* Adds a paragraph of text to the dialog.
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Width - width of the paragraph
* @param Height - height of the paragraph
* buttons.
*/
CMDialog.prototype.AddParagraph=function(Text,XOffset,YPosition,Width,Height)
{	
	var TheControl=CMDialog.AddParagraphToPanel(this.TheElement,Text,XOffset,YPosition,Width,Height);
	
	return(TheControl);
}
/*
* Creates a color control that displays a color picker
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - Initial value
* buttons.
*/
CMDialog.prototype.AddColorControl=function(Label,XOffset,YPosition,Value)
{
	var PenColorControl=CMDialog.AddColorControlToPanel(this.TheElement,Label,XOffset,YPosition,Value);
	
	return(PenColorControl);
}
/*
* Creates a button with text in it.
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* buttons.
*/
CMDialog.prototype.AddButtonControl=function(Text,XOffset,YPosition)
{
	var OKButton=CMDialog.AddButtonControlToPanel(this.TheElement,Text,XOffset,YPosition);
	
	return(OKButton);
}
/*
* Function to create a slider control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Min - minimum value for the contorl (i.e. left side)
* @param Max - maximum value for the control (i.e. right side)
* @param Value - initial value for the control
* buttons.
*/
CMDialog.prototype.AddSliderControl=function(Text,XOffset,YPosition,Min,Max,Value)
{
	var SliderControl=CMDialog.AddSliderControlToPanel(this.TheElement,Text,XOffset,YPosition,Min,Max,Value);

	return(SliderControl);
}
/*
* Function to create a check box control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - true or false initial state of the checkbox
* buttons.
*/
CMDialog.prototype.AddCheckBoxControl=function(Text,XOffset,YPosition,Value)
{
	// add the checkbox
	
	var TheControl=CMDialog.AddCheckBoxControlToPanel(this.TheElement,XOffset,YPosition,Value);
	
	return(TheControl);
}
/*
* Function to create a text edit control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - initial contents of the control
* buttons.
*/
CMDialog.prototype.AddTextControl=function(Text,XOffset,YPosition,Value)
{
	var TheControl=CMDialog.AddTextControlToPanel(this.TheElement,Text,XOffset,YPosition,Value)
	
	return(TheControl);
}
/*
* Function to create a group of radio buttons.
*
* To determine which buttons is pressed, you will need to go through the returned array
* and see which value is "checked" (i.e. Result[i].checked=true).
*
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Values - array of values for the radio buttons.  These will be the names of the
* buttons.
* @param Selected - the selected value from values or "null" for none
*/
CMDialog.prototype.AddRadioControl=function(Name,XOffset,YPosition,Values,Selected)
{
	var Result=CMDialog.AddRadioControlToPanel(this.TheElement,Name,XOffset,YPosition,Values,Selected)

	return(Result);
}
/*
* Function to create a select (popup menu) control
*
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Values - array of values for the radio buttons.  These will be the names of the
* buttons.
* @param Selected - the selected value from values or "null" for none
*/
CMDialog.prototype.AddSelectControl=function(Name,XOffset,YPosition,Values,Selected)
{
	var TheControl=CMDialog.AddSelectControlToPanel(this.TheElement,Name,XOffset,YPosition,Values,Selected);
	
	return(TheControl);
}
//******************************************************************
// Public Static functions
//******************************************************************
/**
* Returns the value from a color control and a transparency control as an RGBA HTML color
* @public
* @param FillColorControl - the color control
* @param FillTransparencyControl - the slider control for transparency
*/
CMDialog.GetRGBAFromControls=function(FillColorControl,FillTransparencyControl)
{
	var Transparency=FillTransparencyControl.value;
	var Color=FillColorControl.value;
	
	var Colors=CMUtilities.GetRGBFromHex(Color);
	
	var RGBA=Colors.Red+","+Colors.Green+","+Colors.Blue;
	
	if (Transparency!=100)
	{
		Transparency=Transparency/100;
		RGBA="rgba("+RGBA+","+Transparency+")";;
	}
	else
	{
		RGBA="rgb("+RGBA+")";;
	}
	
	return(RGBA);
}
