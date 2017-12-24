/******************************************************************************************************************
* CMBase
* This class provides basic support for objects that appear in the table of contents (TOC).
*
* - Selecting and unselecting
* - Settings
* - COntaining children and being contained by a parent object
* - Listeners
*
* @module CMBase
******************************************************************************************************************/

//*****************************************************************************************************************
// Global Definitions
//*****************************************************************************************************************

/**
* Types of objects that are used through out CanvasMap.
*
* @public, @enum
*/
CMBase.DATA_TYPE_COORDINATES=1; // coordinates as lat/lon or easting/northing
CMBase.DATA_TYPE_COLOR=2; // 
CMBase.DATA_TYPE_INTEGER=3;
CMBase.DATA_TYPE_BOOLEAN=4;
CMBase.DATA_TYPE_FLOAT=5;
CMBase.DATA_TYPE_CSS_STYLE=6; // 
CMBase.DATA_TYPE_ENUMERATED=7; // 
CMBase.DATA_TYPE_URL=8; // 
CMBase.DATA_TYPE_STRING=9; // 
CMBase.DATA_TYPE_IMAGE=10; // 
CMBase.DATA_TYPE_FONT=11; // 

/** This is the unique number that is used to create message values
* @private
*/
CMBase.UniqueNumber=1;

//*****************************************************************************************************************
// Constructors
//*****************************************************************************************************************
/**
* Constructor for a base object.   The base object is inherited by most objects and provides function definitions
* for:
* - Child (contained) objects
* - Parent (container) objects
* - Messaging to listeners
* - Basic settings 
*
* CMBase also contains static functions to generate unique numbers for definitions that are shared between classes
*
* @public, @constructs
*/
function CMBase() 
{
}

//******************************************************************
// Functions overriden by subclasses
//******************************************************************
/*
* Gets the current name of the object
* @public
* @returns Name - the name of this object
*/
CMBase.prototype.GetName=function()  { return("Untitled"); }

/*
* Gets the number of children the object contains.
* @public
* @returns NumChildren - the number of children contained in this object.
*/
CMBase.prototype.GetNumChildren=function()  { return(0); }

/*
* Gets a child from the object
* @public
* @returns TheChild - the child object contained within this object.
*/
CMBase.prototype.GetChild=function(Index)  { return(null); }

/*
* Sets the parent that this object is contained in.
* @public
* @param NewParent - the new parent that this object is contained within
*/
CMBase.prototype.SetParent=function(NewParent)  
{ 
	this.TheParent=NewParent;
}
/*
* Gets the parent that this object is contained in.
* @public
* @returns TheParent - the parent this object is within
*/
CMBase.prototype.GetParent=function(Class)  
{ 
	var Result=null;
	
	if (this.TheParent!=undefined) 
	{
		if (Class!=undefined)
		{
			if (this.TheParent instanceof Class) Result=this.TheParent;
			else Result=this.TheParent.GetParent(Class);
		}
		else
		{
			if (this.TheParent!=undefined) Result=this.TheParent;
		}
	}
	return(Result); 
}

//******************************************************************
// Listener functions
//******************************************************************
/**
* Add a listener to listen for messages from this object.  Messages are
* delivered with the function call:
*
* TheFunction(TheMessage,TheSender,TheListener,AdditionalInfo)
*
* TheFunction will receive the messages when sent by TheSender.  TheListener
* is the object that added itself as the listener so the function can access
* its properties.  AdditionaInfo is provided by the sender based on the type of message.
*
* @public
* @param TheFunction - The function that will listen to messages
* @param TheMessage - The message number the object wants to listen to
* @param TheListener - The object that will receive messages from this object.
* @returns UniqueNumber - returns a unique number for the function that has been added so it can be removed easily.
* 	This avoids the problem with addEventListener() that you have to have a uniquely named function outside the class.
*/
CMBase.prototype.AddListener=function(TheMessage,TheListener,TheFunction)
{
	if (this.Listeners==undefined) this.Listeners=[];
	
	if (this.Listeners[TheMessage]==undefined) this.Listeners[TheMessage]=[];
	
	var UniqueNumber=CMBase.GetUniqueNumber();
	
	this.Listeners[TheMessage].push(
	{
		TheFunction:TheFunction,
		TheListener:TheListener,
		UniqueNumber:UniqueNumber
	});
	
	return(UniqueNumber);
}
/**
* Removes a listener from the list of listeners
* @public
* @param TheMessage - The message that the listener was listening for
* @param UniqueNumber - the unique number that was generated when the listener was added.
*/
CMBase.prototype.RemoveListener=function(TheMessage,UniqueNumber)
{
	if (this.Listeners!=undefined)
	{		
		var TheListeners=this.Listeners[TheMessage];
		
		for (var i=0;i<TheListeners.length;i++)
		{
			if (TheListeners[i].UniqueNumber==UniqueNumber)
			{
				TheListeners.splice(i,1);
			}
		}
	}
}
/**
* Removes a listener from the list of listeners
* @public
* @param TheMessage - The message to send
* @param AdditionalInfo - additional information based on the message type
*/
CMBase.prototype.SendMessageToListeners=function(TheMessage,AdditionalInfo)
{
	// make sure we have listeners and we are not sending to ourselves (stops infiinite message loops)
	
	if ((this.Listeners!=undefined)) 
	{	
		var TheListeners=this.Listeners[TheMessage];
		
		if (TheListeners!=undefined)
		{
			for (var i=0;i<TheListeners.length;i++)
			{
				var TheListener=TheListeners[i].TheListener;
				
				TheListeners[i].TheFunction(this,TheListener,AdditionalInfo);
			}
		}
	}
}

//******************************************************************
// Functions for managing settings and timeslices
//******************************************************************
/**
* Override the GetSettingsDefinition() function to add our settings definitions
* Combined with our superclass's settings definitions.  Each sub class
* should add their settings definitions to the JSON object with the class's
* name as the key.
* @protected
*/
CMBase.prototype.GetSettingsDefinitions=function() 
{
	var Result={ }; 
	
	return(Result); // eventually, this will return a JSON object with objects for each superclass's settings definitions
}
/**
* Get a set of settings.  The TimeSlice must already exist within the object.
* @public
* @param TimeSlice - optional value to set a property to transition at a specific time.
* @returns Settings - current settings object
*/
CMBase.prototype.GetSettings=function()
{
	var Result={};
	
	return(Result);
}

/**
* Sets a set of settings for this object.  The TimeSlice must already exist within the object.
* @public
* @param NewSettings - The settings to replace the existing settings.
*/
CMBase.prototype.SetSettings=function(TheSettings)
{
}

//******************************************************************
// static functions
//******************************************************************
/**
* Gets an integer that is unique for this instance of CanvasMap.  This is
* used to ensure that all messages have a unique value.
* @public
* @returns UniqueNumber unique integer
*/
CMBase.GetUniqueNumber=function() 
{
	CMBase.UniqueNumber++;
	return(CMBase.UniqueNumber-1);
}
