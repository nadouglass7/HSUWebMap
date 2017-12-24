//*****************************************************************
// CMItem Class
// An item is something that is displayed and typically can be edited
// by a user.  Items includeobjects such as arrows, boxes, labels, and ovals.
// A geospatial layer is a subclass of this class.
//
// Adds:
// - Tweening
// - Styles, Painting
// - Visilbity
//******************************************************************
//******************************************************************
// Definitions
//******************************************************************
/**
* Below are the settings definitions.
* @public, @settings
*/
CMItem.SettingDefintions=
{
	Style:
	{
		// standard HTML 5 settings except the defaults may change and sometimes the available settings will change between each settings group
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		lineWidth: { Name:"Line Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' },
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }
	},
	Text:
	{
		Text: { Name:"Text",Type:CMBase.DATA_TYPE_STRING, Default:null },
		font: { Name:"Font",Type:CMBase.DATA_TYPE_FONT, Default:"12px Arial" },
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' }
	},
};
CMItem.UniqueNumber=0;

//******************************************************************
// Constructor
//******************************************************************
/**
* Creates a new CMItem object.  This is an abstract class.
* @protected, @constructs
*/
function CMItem() 
{
	CMBase.call(this);
	
	// Settings
	this.UniqueNumber=CMItem.UniqueNumber;
	
	// CMBase does not have settings so this is the main property for settings
	this.TimeSlices=[
	{
	 	UniqueNumber:CMItem.UniqueNumber,
		Time:0,
		Settings:
		{
			Style:
			{
				strokeStyle:"rgb(0,0,0)",
				lineWidth:1,
				fillStyle:"rgb(255,255,255)"
			},
			Text:
			{
			},
		}
	}];
	
	CMItem.UniqueNumber++;
	 
	this.LastStyle=null;
	this.LastTimeSlice=0;
}
CMItem.prototype=Object.create(CMBase.prototype); // inherit prototype functions from PanelBase()

CMItem.prototype.contructor=CMItem; // override the constructor to go to ours

//******************************************************************
// CMBase Settings Functions
//******************************************************************

CMItem.prototype.GetSettingsDefinitions=function() 
{
	var Result={};
	
	for (Key in CMItem.SettingDefintions)
	{
		Result[Key]=CMItem.SettingDefintions[Key];
	}

	return(Result); 
}

/**
* Get a set of settings.  The TimeSlice must already exist within the object.
* This adds the TimeSlice parameter to the overriden CMBase.SetSettings() function.
* @public
* @param TimeSlice - optional value to set a property to transition at a specific time.
* @returns Settings - current settings object
*/
CMItem.prototype.GetSettings=function(TimeSlice) 
{
	var Result=null;
	
	var TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		Result=this.TimeSlices[TimeSliceIndex].Settings;
	}
	return(Result);
}
/**
* Sets a set of settings for this object.  The TimeSlice must already exist within the object.
* This adds the TimeSlice parameter to the overriden CMBase.SetSettings() function.
* @public
* @param NewSettings - The settings to replace the existing settings.
* @param TimeSlice - Which time slice to set
*/

CMItem.prototype.SetSettings=function(NewSettings,TimeSlice) 
{
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		this.TimeSlices[TimeSliceIndex].Settings=NewSettings; // save them into the object
	}
	this.LastStyle=null; // force style to be recomputed
	
	this.Repaint();
}
CMItem.prototype.SetSettingGroup=function(Group,Values,TimeSlice)
{
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		this.TimeSlices[TimeSliceIndex].Settings[Group]=Values; // save them into the object
	}
	this.LastStyle=null; // force style to be recomputed
	
	this.Repaint();
}
/**
* Get an individual value from the settings
* @public
* @param Group - Group for the setting
* @param Key - on of the CMLayer.INFO enumerated types
* @param Default - default value to use in none has been specified as of yet (optional)
* @returns Value - curnet property value.
*/
CMItem.prototype.GetSettingGroup=function(Group,Default,TimeSlice)
{
	var Result=null;
	if (Default!=undefined) Result=Default;
	
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		Result=this.TimeSlices[TimeSliceIndex].Settings[Group];
	}
	return(Result);
}

/**
* Sets an individual setting value into the settings
* @public
* @param Group - Group for the setting
* @param Key - on of the CMLayer.INFO enumerated types
* @param Value - value for the type (see the documentation for types for each of the properties)
*/
CMItem.prototype.SetSetting=function(Group,Key,Value,TimeSlice)
{
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		var TheSettings=this.TimeSlices[TimeSliceIndex].Settings;
		
		TheSettings[Group][Key]=Value; // save them into the object
	}
	this.LastStyle=null; // force style to be recomputed
	
	this.Repaint();
}
/**
* Get an individual value from the settings
* @public
* @param Group - Group for the setting
* @param Key - on of the CMLayer.INFO enumerated types
* @param Default - default value to use in none has been specified as of yet (optional)
* @returns Value - curnet property value.
*/
CMItem.prototype.GetSetting=function(Group,Key,Default,TimeSlice)
{
	var Result=null;
	if (Default!=undefined) Result=Default;
	
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		var TheGroup=this.TimeSlices[TimeSliceIndex].Settings[Group];
		
		if (TheGroup!=undefined)
		{
			if (Key in TheGroup) Result=TheGroup[Key];
		}
	}
	return(Result);
}
//******************************************************************
// Functions to select and unselect content
//******************************************************************
/**
* Subclasses should override this function to unselect any selected content
* @protected - only used within CanvasMap 
*/
CMItem.prototype.UnselectAll=function(SendMessageFlag) 
{
	if (this.Selected) // unselect this item
	{
		this.Selected=false;
		
		if (SendMessageFlag) // call the scene to let everyone know the selection changed
		{
			var TheScene=this.GetParent(CMScene);
			TheScene.SelectionChanged(this);
		}
	}
}
/**
* Gets the value of the selected flag for this object.
* @public
* @returns Selected flag
*//*
CMItem.prototype.SelectionChanged=function(New) 
{
}*/
/**
* Gets the value of the selected flag for this object.
* @public
* @returns Selected flag
*/
CMItem.prototype.GetSelected=function() 
{
	return(this.Selected);
}
/**
* Sets this object to be the one the user has selected
* @public
* @returns Selected flag
*/
CMItem.prototype.SetSelected=function(New) 
{
	if (this.Selected!=New)
	{
		// get the scene which may be this object
		
		var TheScene;
		
		if (this instanceof CMScene)
		{
			TheScene=this;
		}
		else
		{
			TheScene=this.GetParent(CMScene);
		}
		
		if (New)  // selecting this object,  unselect previous content 
		{
			TheScene.UnselectAll(false); // unselect but do not send messages because we are about to select (keeps repaints down)
			this.Selected=true; // set the new selection
			TheScene.SelectionChanged(this); // notify everyone that the selectoin changed
		}
		else // unselecting, just notify everyone
		{
			this.Selected=false; // unselect
			TheScene.SelectionChanged(this); // notify everyone that the selectoin chagned
		}
	}
}
//***********************************************************************************************
// Static Functions for managing time slices
//***********************************************************************************************
/**
* Finds an index to a specific time slice value
*/
CMItem.FindTimeSliceIndex=function(TimeSliceSettings,TimeSlice)
{
	var Result=-1;
	
	if (TimeSlice==undefined) // return the first entry
	{
		if (TimeSliceSettings.length>0) Result=0; // have at least one entry
	}
	else
	{
		for (var i=0;(i<TimeSliceSettings.length)&&(Result==-1);i++)
		{
			var TimeSliceSetting=TimeSliceSettings[i];
			
			if (TimeSliceSetting.Time==TimeSlice) Result=i;
		}
	}
	return(Result);
}

/**
* Returns the time slices
* @public
* @TheTimeSlices - array to add this objects time slices to
* @returns the same array but with the time slices added.
*/
CMItem.prototype.GetTimes=function(TheTimeSlices)  
{ 
	TheTimeSlices=[];

	for (var i=0;i<this.TimeSlices.length;i++)
	{	
		var Time=this.TimeSlices[i].Time;
		
		CMUtilities.InsertIntoSortedArray(TheTimeSlices,parseFloat(Time));
	}
	return(TheTimeSlices); 
}

CMItem.prototype.InsertTime=function(Time)
{
	var TimeSlices=this.TimeSlices;
	
	var Index=-1;
	for (var i=0;i<TimeSlices.length;i++)
	{
		if (TimeSlices[i].Time==Time) // TimeSlice is already in the settings
		{
			Index=i; // return the index to the existing slice
		}
		else if (TimeSlices[i].Time>Time) // we are past the desired TimeSlice, insert the new one
		{
			Index=i;
			TimeSlices.splice(Index,0,Time);
		}
	}
	if (Index==-1) // missed the TimeSlice, add it at the end
	{
		Index=TimeSlices.length;
		TimeSlices.push({Settings:{},Time:Time});
	}
	if (Index!=-1) // inserted a TimeSlice at Index
	{
		var OldTimeSliceSettings=TimeSlices[Index-1].Settings;
		var NewTimeSliceSettings=TimeSlices[Index].Settings;
		
		for (ClassKey in OldTimeSliceSettings)
		{
			var TheSetting=OldTimeSliceSettings[ClassKey];
			
			TheSetting=CMUtilities.Clone(TheSetting);
			
			NewTimeSliceSettings[ClassKey]=TheSetting;
		}
	}
	this.Repaint();
	
	return(Index);
}
CMItem.prototype.DeleteTime=function(Time)
{
	var TimeSlices=this.TimeSlices;
	
	var Index=-1;
	for (var i=0;i<TimeSlices.length;i++)
	{
		if (TimeSlices[i].Time==Time) 
		{
			Index=i;
			TimeSlices.splice(Index,1); // remove the time slice
		}
	}
	this.Repaint();
	return(Index);
}
//******************************************************************
// Protected Utility functions to aid with managing time slices
//******************************************************************
CMItem.GetTimeFactor=function(TimeSliceArray)
{
	var TimeSlice1=TimeSliceArray[0].Time;
	var TimeSlice2=TimeSliceArray[1].Time;
	
	var Range=TimeSlice2-TimeSlice1;
	var Factor=(Range-TimeSlice)/Range; // 0 at end, 1 at start
	
	return(Factor);
}


/**
* Get a tweened value between two values
* @private
* @param Value 1 - minimum value
* @param Value2 - maxumum value
* @param Default - default to use if neither Value1 or Value2 are defnied
* @param Factor - interpolation factor (1 for Value1, 0 for Value2, 0 to 1 is an interpolated value between the two
*/
CMItem.GetTweenFloatValue=function(Value1,Value2,Default,Factor) 
{
	var Result=Default;
	
	if (Value1!=undefined) // have value 1
	{
		if (Value2!=undefined) // also have value 2, do tweening
		{
			Result=(Value1*Factor)+(Value2*(1-Factor));
		}
		else // just have value1, use it
		{
			Result=Value1;
		}
	}
	else if (Value2!=undefined) // just have value 2, use it
	{
		Result=Value2;
	}
	return(Result);
}
/**
* Get a tweened value between two color values
* @private
* @param Value 1 - minimum value
* @param Value2 - maxumum value
* @param Default - default to use if neither Value1 or Value2 are defnied
* @param Factor - interpolation factor (1 for Value1, 0 for Value2, 0 to 1 is an interpolated value between the two
*/
CMItem.GetTweenColorValue=function(Value1,Value2,Default,Factor) 
{
	var Result=Default;
	
	var Colors=null;
	
	if (Value1!=undefined) // have value 1
	{
		var Colors1=CMUtilities.GetColorsFromAnyColor(Value1);
		
		if (Value2!=undefined) // also have value 2, do tweening
		{
			var Colors2=CMUtilities.GetColorsFromAnyColor(Value2);
			
			Colors={
				Red:Math.round((Colors1.Red*Factor)+(Colors2.Red*(1-Factor))),
				Green:Math.round((Colors1.Green*Factor)+(Colors2.Green*(1-Factor))),
				Blue:Math.round((Colors1.Blue*Factor)+(Colors2.Blue*(1-Factor)))
			}
		}
		else // just have value1, use it
		{
			Colors=Value1;
		}
	}
	else if (Value2!=undefined) // just have value 2, use it
	{
		Colors=Value2;
	}
	if (Colors!=null) Result="rgb("+Colors.Red+","+Colors.Green+","+Colors.Blue+")";
	
	return(Result);
}
/**
* Get a tweened value between two color values
*
* jjg - does not currently support gradients or patterns
*
* @private
* @param Value 1 - minimum value
* @param Value2 - maxumum value
* @param Default - default to use if neither Value1 or Value2 are defnied
* @param Factor - interpolation factor (1 for Value1, 0 for Value2, 0 to 1 is an interpolated value between the two
*/
CMItem.GetTweenStyleValue=function(Value1,Value2,Default,Factor) 
{
	var Result=CMItem.GetTweenColorValue(Value1,Value2,Default,Factor) ;

	return(Result);
}
//******************************************************************
// Functions
//******************************************************************
/**
* Find the appropriate time slices for the specified TimeSlice
* @protected - used by subclasses to find the time slice settings to use
*/
CMItem.prototype.GetBoundingTimeSlices=function(TimeSlice)
{
	if (TimeSlice==undefined)
	{
		var TheScene=this.GetParent(CMScene);
	
		TimeSlice=TheScene.GetTimeRange();
	}
	// find the settings to use for the style, either Settings1 or both Settings1 and Settings2 for tweening
	
	var TheTimeSliceSetting1=null;
	var TheTimeSliceSetting2=null;
//	var TheKeys=Object.keys(this.TimeSlices);
	
	for (var i=0;(i<this.TimeSlices.length)&&(TheTimeSliceSetting1==null);i++)
	{
		// get the key and make sure it is a number
		var ThisSlicesTime=parseFloat(this.TimeSlices[i].Time);
		
		if (ThisSlicesTime==TimeSlice) // current key exactly matches the desired time slice
		{
			TheTimeSliceSetting1=this.TimeSlices[i];
		}
		else if (ThisSlicesTime>TimeSlice) // current key is after desired time slice
		{
			if (i==0) // first key is after the desired time slice, use just the first key
			{
				TheTimeSliceSetting1=this.TimeSlices[0];
			}
			else // time slice is between two keys
			{
				TheTimeSliceSetting1=this.TimeSlices[i-1];
				TheTimeSliceSetting2=this.TimeSlices[i];
			}
		}
	}
	
	// if we did not find a match and there are timeslices, the desired time slice must be after the last key
	if ((TheTimeSliceSetting1==null)&&(this.TimeSlices.length>0))
	{
		TheTimeSliceSetting1=this.TimeSlices[this.TimeSlices.length-1];
	}
	
	// return the result as an array for fast access
	var Result=[TheTimeSliceSetting1,TheTimeSliceSetting2];
	
	return(Result);
}
/**
* Returns a tweened style based on the specified TimeSlice
* @protected
*/
CMItem.prototype.GetStyle=function(TheView,TimeSlice,Group) 
{
	if (TimeSlice==undefined) TimeSlice=0;

	if (Group==undefined) Group="Style";
	
//	if ((this.LastStyle==null)||(this.LastTimeSlice!=TimeSlice))
	{
		this.LastStyle=null;
		this.LastTimeSlice=TimeSlice;
		
		var Result=this.GetBoundingTimeSlices(TimeSlice);
		var TheTimeSlice1=Result[0];
		var TheTimeSliceSetting1=TheTimeSlice1.Settings;
		var TheTimeSlice2=Result[1];

		//*********************************************************************************************************
		// create the style to return
		
		if (TheTimeSlice1!=null) // have something
		{
			var TheStyle;
			
			if (TheTimeSlice2==null) // no tweening
			{
	//			for (TheGroupKey1 in TheTimeSliceSetting1)
				{
					var TheGroup1=TheTimeSliceSetting1[Group];
					
//					var TheGroup={};
					for (TheSettingKey1 in TheGroup1)
					{
						if (TheStyle===undefined) TheStyle={};
						
						var TheSetting1=TheGroup1[TheSettingKey1];
						
						TheStyle[TheSettingKey1]=TheSetting1;
					}
				}
			}
			else // have tweening
			{
				var TheTimeSliceSetting2=TheTimeSlice2.Settings;
				
				var Factor=CMItem.GetTimeFactor(Result);
				
	//			for (TheGroupKey1 in TheTimeSliceSetting1)
				{
					var TheGroup1=TheTimeSliceSetting1[Group];
					var TheGroup2=TheTimeSliceSetting2[Group];
					
					for (TheSettingKey1 in TheGroup1)
					{
						if (TheStyle===undefined) TheStyle={};
						
						var TheSetting1=TheGroup1[TheSettingKey1];
						var TheSetting2=TheGroup2[TheSettingKey1];
						
						if ((TheSettingKey1=="strokeStyle")||(TheSettingKey1=="fillStyle")) // styles are treated specially
						{
							TheStyle[TheSettingKey1]=CMItem.GetTweenStyleValue(TheSetting1,TheSetting2,"rgb(0,0,0)",Factor);
						}
						else if (TheSettingKey1=="shadowColor") // colors have to have each element tweened
						{
							TheStyle[TheSettingKey1]=CMItem.GetTweenColorValue(TheSetting1,TheSetting2,"rgb(0,0,0)",Factor);
						}
						else // must be a number
						{
							TheStyle[TheSettingKey1]=CMItem.GetTweenFloatValue(TheSetting1,TheSetting2,0,Factor) ;
						}
					}
				}
			}
			// convert ref dimensions to pixel dimensions (jjg - add tweening)
	
			for (key in TheStyle)
			{
				// have to adjust for reference unit dimensions
				if ((key=="lineWidth")||(key=="shadowOffsetX")||(key=="shadowOffsetY")||(key=="shadowBlur"))
				{
					var Test=12;
	//				TheStyle[key]=TheView.GetPixelWidthFromRefWidth(TheStyle[key]); // jjg - need to make this an option
				}
			}
			this.LastStyle=TheStyle;
		}
	}

	return(this.LastStyle);
}
//*******************************************************************************
// CMItem functions to be overriden by children
//*******************************************************************************

/**
* 
* @protected, @override
*/

CMItem.prototype.ResetStyle=function() 
{
}
/**
* 
* @protected, @override
*/
CMItem.prototype.Repaint=function() 
{
	var Result=this.GetParent(CMScene);
	if (Result!=null) Result.Repaint();
}
/**
* 
* @protected, @override
*/
CMItem.prototype.Paint=function(TheView) 
{
}
/**
* 
* @protected, @override
*/
CMItem.prototype.PaintSelected=function(TheView) 
{
}
//*******************************************************************************
// CMItem public functions
//*******************************************************************************

/**
* Makes this item visible or invisible
* @public
* @param Flag - true to make the item visible, false for invisible
*/
CMItem.prototype.SetVisible=function(Flag) 
{
	if (this.Visible!=Flag) // works for true, false, and undefined
	{
		this.Visible=Flag;
		this.Repaint();
	}
}
/**
* Returns the visible state of this item
* @public
* @returns true if the item is visible, false otherwise
*/
CMItem.prototype.GetVisible=function()
{
	if (this.Visible==undefined) this.Visible=true;
	return(this.Visible);
}

