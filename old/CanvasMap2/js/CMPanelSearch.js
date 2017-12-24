//******************************************************************
// SetupSettingsPanel Class
//******************************************************************

//******************************************************************
// Constructor
//******************************************************************

function CMPanelSearch(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelSearch requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	this.TheElement=null;
}

CMPanelSearch.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelSearch.prototype.contructor=CMPanelSearch; // override the constructor to go to ours
//******************************************************************
// Private Functions
//******************************************************************

//******************************************************************
// Functions
//******************************************************************

CMPanelSearch.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;

//	var SearchPanel=this.TabPanel.AddTab("Search","Search");
	
	TheElement.innerHTML="Search:";
	
	// create the div for the search rseults but don't add it yet
	
	var SearchResults = document.createElement("DIV");
	SearchResults.id="CM_SearchResults";
	
	// add the text field
	
	var TextField = document.createElement("INPUT");
	TextField.setAttribute("type", "text"); 
	TheElement.appendChild(TextField);
	
	// add the search button
	
	var SearchButton = document.createElement("INPUT");
	SearchButton.setAttribute("type", "button"); 
	SearchButton.value="Submit";
	SearchButton.className="CM_SearchButton";
	
	SearchButton.TextField=TextField;
	SearchButton.CanvasMap=this.GetParent();
	SearchButton.SearchResults=SearchResults;
	
	SearchButton.onclick=function()
	{
		var Text=this.TextField.value;
		
		Text=Text.toLowerCase();
		
		SearchResults.innerHTML="";
		this.CanvasMap.TheScene.GetSearchResults(Text,SearchResults);	
	}
	TheElement.appendChild(SearchButton);
	
	// add the results after the button
	
	TheElement.appendChild(SearchResults);
}
