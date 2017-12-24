//******************************************************************
// SetupSettingsPanel Class
//******************************************************************

//******************************************************************
// Constructor
//******************************************************************

function CMPanelSettings(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelSettings requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	this.TheElement=null;
	
	var TheScene=TheCanvasMap.GetScene();
	
	TheScene.AddListener(CMScene.MESSAGE_SELECTION_CHANGED,this,function(TheScene,TheListener,ItemThatChanged)
	{
		if (ItemThatChanged.GetSelected())
		{
			TheListener.Setup(ItemThatChanged);
		}
		else
		{
			TheListener.TheElement.innerHTML="";
		}
	});
}

CMPanelSettings.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelSettings.prototype.contructor=CMPanelSettings; // override the constructor to go to ours
//******************************************************************
// Private Functions
//******************************************************************

/**
* Private function to add a setting to the settings panel.  Used to 
* initialize a setting and to add one when the setting popup is selected.
* @private
*/
CMPanelSettings.AddSetting=function(TheTable,TheGroupRow,PropertyKey,SettingsDefinitions,TheProperty,TheControl)
{
	// find the row after the last entry for this group

	var TableRows=TheTable.childNodes;
	
	var OurTableRowIndex=null;
	for (var i=0;(i<TableRows.length)&&(OurTableRowIndex==null);i++)
	{
		if (TableRows[i]==TheGroupRow) OurTableRowIndex=i;
	}
	// find the row just after this group
	var RowAfterOurGroup=null;
	for (var i=OurTableRowIndex+1;(i<TableRows.length)&&(RowAfterOurGroup==null);i++)
	{
		var RowNode=TableRows[i];
			
		if (RowNode.nodeName=="TR") // found a row
		{
			if (RowNode.Type!="SETTING") 
			{
				RowAfterOurGroup=RowNode;
			}
		}
	}
	// add the new row at the proper location
	
	var TheSettingRow = document.createElement("TR");
	
	if (RowAfterOurGroup==null)
	{
		TheTable.appendChild(TheSettingRow);	
	}
	else
	{
		TheTable.insertBefore(TheSettingRow,RowAfterOurGroup);	
	}
	
	// add the cell for the name
	
	var TheData=AppendElement("TD",TheSettingRow);
	
	TheSettingRow.Type="SETTING";
	TheSettingRow.Key=PropertyKey;
	TheSettingRow.PropertyType=SettingsDefinitions.Type;
	
	var TheCell = document.createTextNode(SettingsDefinitions.Name+":");
	TheData.appendChild(TheCell);
	
	// add the cell with the control
	
	var TheData=AppendElement("TD",TheSettingRow);
	
	if (TheProperty==undefined) TheProperty=SettingsDefinitions.Default;
	
	var Transparency=null;
	
	switch (SettingsDefinitions.Type)
	{
	case CMBase.DATA_TYPE_CSS_STYLE:
		{
			// setup the color control
			
			var TheColorInput = document.createElement("INPUT");
			TheData.appendChild(TheColorInput);
			
			TheColorInput.setAttribute("type", "color");
			
			TheColorInput.value=CMUtilities.GetHexColorFromColor(TheProperty);
			
			// add the transparency slider
			
			var TheIntegerInput = document.createElement("INPUT");
			TheIntegerInput.className="CM_SettingsInput";
			TheData.appendChild(TheIntegerInput);
			
			TheIntegerInput.setAttribute("type", "number");
			
			var Colors=CMUtilities.GetColorsFromAnyColor(TheProperty);
			
			if (Colors.Transparency!=undefined)
			{
				TheIntegerInput.value=Colors.Transparency;
			}
			TheIntegerInput.style.width="60px";

		}
		break;
	case CMBase.DATA_TYPE_COLOR:
		{
			var TheColorInput = document.createElement("INPUT");
			TheData.appendChild(TheColorInput);
			
			TheColorInput.setAttribute("type", "color");
			
			var Colors=CMUtilities.GetColorsFromAnyColor(TheProperty);
			
			TheColorInput.value=CMUtilities.GetHexColorFromColor(TheProperty);
		}
		break;
	case CMBase.DATA_TYPE_INTEGER:
	case CMBase.DATA_TYPE_FLOAT:
		{
			var TheIntegerInput = document.createElement("INPUT");
			TheIntegerInput.className="CM_SettingsInput";
			TheData.appendChild(TheIntegerInput);
			
			TheIntegerInput.setAttribute("type", "number");
			
			TheIntegerInput.value=TheProperty;
			
			TheIntegerInput.style.width="60px";
		}
		break;

	case CMBase.DATA_TYPE_BOOLEAN:
		{
			var TheIntegerInput = document.createElement("INPUT");
			TheData.appendChild(TheIntegerInput);
			
			TheIntegerInput.setAttribute("type", "checkbox");
			
			TheIntegerInput.checked=TheProperty;
		}
		break;
	case CMBase.DATA_TYPE_COORDINATES:
		{
			var TheIntegerInput = document.createElement("DIV");
			TheData.appendChild(TheIntegerInput);
			
			TheIntegerInput.Coordinates=TheProperty;
		}
		break;
	case CMBase.DATA_TYPE_ENUMERATED:
		{
			var TheControl = document.createElement("SELECT");
			TheData.appendChild(TheControl);
			
			for (var j=0;j<SettingsDefinitions.Options.length;j++)
			{
				var TheText=SettingsDefinitions.Options[j];
				
				var TheOption = document.createElement("option");
				TheOption.setAttribute("value", TheText);
				
				var TheTextNode = document.createTextNode(TheText);
				TheOption.appendChild(TheTextNode);
				
				TheControl.appendChild(TheOption);
			}
			TheControl.value=TheProperty;
		}
		break;
	}
	// add the cell with the tweening setting
	
/*	var TheData=AppendElement("TD",TheSettingRow);

	var TheIntegerInput = document.createElement("INPUT");
	TheData.appendChild(TheIntegerInput);
	
	TheIntegerInput.setAttribute("type", "checkbox");
*/	
	// add the cell with the "x" to delete the setting
	
	var TheData=AppendElement("DIV",TheSettingRow);

	TheData.innerHTML="X";
	TheData.TheSettingRow=TheSettingRow;
	TheData.TheGroupRow=TheGroupRow;
	TheData.TheTable=TheTable;
	TheData.TheControl=TheControl;
	TheData.PropertyKey=PropertyKey;
	TheData.SettingsDefinitions=SettingsDefinitions;
	
	TheData.onclick=function() // when the user removes a setting, we have to add it back into the select popup
	{
		// need to add the control back into the select popup
		CMPanelSettings.AddOptionToSelect(this.TheTable,this.TheGroupRow,this.PropertyKey,this.SettingsDefinitions,this.TheControl);
		
		this.TheTable.removeChild(this.TheSettingRow);
	};
	
	// need to add a transprency control if transparency was specified in the color
	
	if (Transparency!=null)
	{
		CMPanelSettings.AddSetting(TheTable,TheGroupRow,"Transparency",CMPanelSettings.TransparencyDefinition,undefined,TheControl);
	}
}
/**
* Add an option to the select popup so the user can select a setting that has
* not yet been added to the settings
* @private
*/
CMPanelSettings.AddOptionToSelect=function(TheTable,TheGroupRow,PropertyKey,SettingsDefinitions,TheControl)
{
	var TheOption = document.createElement("option");
	TheOption.text = SettingsDefinitions.Name;
	TheOption.PropertyKey=PropertyKey;
	TheOption.SettingsDefinitions=SettingsDefinitions;
	TheControl.add(TheOption);
	
/*	TheControl.TheTable=TheTable;
	TheControl.TheGroupRow=TheGroupRow;
//	TheControl.TheOption=TheOption;
	TheControl.SettingsDefinitions=SettingsDefinitions;
	
	
	TheControl.onchange=function()
	{
		var Index = this.selectedIndex;
		var SelectedOption=TheControl.options[Index];

		this.remove(Index);
		
		// add the control for the property to the panel
		CMPanelSettings.AddSetting(this.TheTable,this.TheGroupRow,SelectedOption.PropertyKey,this.SettingsDefinitions,this.PropertyDefinitions.Default,TheControl);
	};
*/}

//******************************************************************
// Functions
//******************************************************************
CMPanelSettings.GetSettings=function(TheTable)
{
	
	// get settings and apply to this.TheObject
	var TableRows=TheTable.childNodes;
	
	var TheSettings={};
	
	var TheGroup=null;
	for (RowNodeKey in TableRows)
	{
		var RowNode=TableRows[RowNodeKey];
			
		if (RowNode.nodeName=="TR") // found a row
		{
			var CellNodes=RowNode.childNodes;
			
			var CellNode=CellNodes[0];
			
			if (RowNode.Type=="GROUP")
			{
				var TheGroupName=RowNode.Key;
					
				TheGroup={};
				TheSettings[TheGroupName]=TheGroup;
			}
			else if (RowNode.Type=="SETTING") // must be a setting value
			{
				var TheSettingKey=RowNode.Key;
				
				var CellNode2=CellNodes[1];
				try
				{
					var TheSettingValue=CellNode2.childNodes[0].value;
							
					if (RowNode.PropertyType==CMBase.DATA_TYPE_CSS_STYLE) 
					{
						TheColor=TheSettingValue;
						TheTransparency=CellNode2.childNodes[1].value;
						
						if (TheTransparency=="") TheTransparency=undefined;
						
						TheGroup[TheSettingKey]=CMUtilities.GetRGBAFromAnyColor(TheColor,TheTransparency);
					}
					else if (RowNode.PropertyType==CMBase.DATA_TYPE_COORDINATES) 
					{
						TheGroup[TheSettingKey]=CellNode2.childNodes[0].Coordinates;
					}
					else if (RowNode.PropertyType==CMBase.DATA_TYPE_INTEGER)
					{
						TheGroup[TheSettingKey]=parseInt(TheSettingValue);
					}
					else if (RowNode.PropertyType==CMBase.DATA_TYPE_FLOAT) 
					{
						TheGroup[TheSettingKey]=parseFloat(TheSettingValue);
					}
					else if (RowNode.PropertyType==CMBase.DATA_TYPE_BOOLEAN)
					{
						if (parseInt(TheSettingValue)==0) TheGroup[TheSettingKey]=false;
						else TheGroup[TheSettingKey]=true;
					}
					else
					{
						TheGroup[TheSettingKey]=TheSettingValue;
					}
				}
				catch  (err)
				{
					var test=12;
				}
			}
		}
	}
	return(TheSettings);
}
			
CMPanelSettings.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;
}
/**
* Setup the properties panel for a selected object
*/
CMPanelSettings.prototype.Setup=function(TheObject)
{
	var SettingsPopup=this.TheElement;
	
	while (SettingsPopup.hasChildNodes()) {
		SettingsPopup.removeChild(SettingsPopup.lastChild);
	}
	
	var TheCanvasMap=this.GetParent(CMMainContainer);
	
	var TimeSlice=TheCanvasMap.GetScene().GetTimeRange();
		
	var TheSettings=TheObject.GetSettings(TimeSlice); 
	var SettingsDefinitions=TheObject.GetSettingsDefinitions();
	
	if (TheSettings!=null)
	{
		var TheTable=document.createElement("TABLE");
		SettingsPopup.appendChild(TheTable);
		
		for (GroupKey in SettingsDefinitions)
		{
			var GroupDefinitions=SettingsDefinitions[GroupKey];
			var TheGroup=TheSettings[GroupKey];
			
			if (TheGroup==undefined)
			{
				var hi="hi";
			}
			// add the select for settings that are not yet set
			
			var TheGroupRow=AppendElement("TR",TheTable);
			var TheCell=AppendElement("TD",TheGroupRow);
			
			var TheText=AppendElement("DIV",TheCell);
			TheText.innerHTML="<b>"+GroupKey+":</b>";
			
			TheGroupRow.Type="GROUP";
			TheGroupRow.Key=GroupKey;
			
			// add the select to add new settings
			var TheControl = document.createElement("SELECT");
			
			var TheOption = document.createElement("option");
			TheOption.text = "Select to add";
			TheControl.add(TheOption);
			
			// add the onchange event handler
			
			TheControl.TheTable=TheTable;
			TheControl.TheGroupRow=TheGroupRow;
			
			TheControl.onchange=function() // add the selected setting to the panel and remove it from the popup
			{
				var Index = this.selectedIndex;
				var SelectedOption=this.options[Index];
		
				this.remove(Index);
				
				// add the control for the property to the panel
				// the SettingsKey, Definition, and default come from the selected option
				CMPanelSettings.AddSetting(this.TheTable,this.TheGroupRow,SelectedOption.PropertyKey,
					SelectedOption.SettingsDefinitions,SelectedOption.SettingsDefinitions.Default,TheControl);
			};
			// add the options for the select
			for (PropertyKey in GroupDefinitions)
			{
				if (PropertyKey in TheGroup) {} // don't add if already in the group
				else
				{
					var OneSettingsDefinitions=GroupDefinitions[PropertyKey];
				
					CMPanelSettings.AddOptionToSelect(TheTable,TheGroupRow,PropertyKey,OneSettingsDefinitions,TheControl);
				}
			}
			var TheData=AppendElement("TD",TheGroupRow);
			TheData.appendChild(TheControl);
			
			// display the settings that have been added
			
			for (PropertyKey in TheGroup)
			{
				var TheProperty=TheGroup[PropertyKey];
				try
				{
					var OneSettingsDefinitions=GroupDefinitions[PropertyKey];
				}
				catch(err)
				{
					document.getElementById("demo").innerHTML = err.message;
				}
				CMPanelSettings.AddSetting(TheTable,TheGroupRow,PropertyKey,OneSettingsDefinitions,TheProperty,TheControl);
			}
		}
		
		//****************************************************************************
		// add the "Apply" button
		
		// create the row and cell and add the button to the cell
		var TheApplyRow=AppendElement("TR",TheTable);
		var TheApplyCell=AppendElement("TD",TheApplyRow);
		
		TheApplyRow.Type="APPLY";
		
		var TheApplyButton = document.createElement("INPUT");
		TheApplyCell.appendChild(TheApplyButton);
		
		// setup the object variables
		TheApplyButton.TheObject=TheObject;
		TheApplyButton.TheTable=TheTable;
		TheApplyButton.TimeSlice=TimeSlice;
		
		TheApplyButton.setAttribute("type", "button");
		TheApplyButton.setAttribute("value", "Apply");
		
		// add the event listener that will apply the settings to the object
		TheApplyButton.addEventListener("click",function()
		{
			var TheSettings=CMPanelSettings.GetSettings(this.TheTable);
			
			this.TheObject.SetSettings(TheSettings,this.TimeSlice);
		});
		//****************************************************************************
		// add the "Get" button
		
		// create the row and cell and add the button to the cell
		var TheGetRow=AppendElement("TR",TheTable);
		var TheGetCell=AppendElement("TD",TheGetRow);
		
		TheGetRow.Type="GET";
		
		var TheGetButton = document.createElement("INPUT");
		TheGetCell.appendChild(TheGetButton);
		
		// setup the object variables
		TheGetButton.TheObject=TheObject;
		TheGetButton.TheTable=TheTable;
		
		TheGetButton.setAttribute("type", "button");
		TheGetButton.setAttribute("value", "Get");
		
		// add the event listener that will Get the settings to the object
		TheGetButton.addEventListener("click",function()
		{
			var TheSettings=CMPanelSettings.GetSettings(this.TheTable);
			
			var TheDialog=new CMDialog("LayerVector_Settings_Dialog",600,400); // dialog width and height
			
			var TheString=JSON.stringify(TheSettings,null,'\t');
			TheString=TheString.replace('\n',"\n");
			
			var TheParagraph = document.createElement("PRE");
			var TheTextNode = document.createTextNode(TheString);
			TheParagraph.appendChild(TheTextNode);
			
			TheDialog.TheElement.appendChild(TheParagraph);

		});
	}
}