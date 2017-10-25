//***********************************************************************
// Search Phrase functions
//***********************************************************************
/*
* This is required as apparently IE does not support "indexOf()" for javascript arrays!
*/

function IndexOf(TheArray,TheValue)
{
	var Match=false;
	for (var i=0;(i<TheArray.length)&&(Match==false);i++)
	{
		if (TheArray[i]==TheValue) Match=true;
	}
	return(Match);
}
function AddToOutput(Text)
{
	var Element=document.getElementById("DebuggingText");
	//Element.innerHTML+=Text+"<br>";
}
	

//var SearchPhrase = "Kate Buchanon Room";                                                 //This is the phrase being entered
//var SearchPhrase = "University Center"; 
//ar SearchPhrase = "Founders Hall"; 

function SearchPhrases(SearchPhrase)



{
	var ExactMatches=[];
	
	for (i=0;i<BuildingPhraseList.length;i++)                                                          //For Loop to go through the variable PhraseList to match phrases with the SearchPhrase variable
	{
		var Phrases=BuildingPhraseList[i];
		
		for (j=0;j<Phrases.length;j++)                                                          //For Loop to go through the variable PhraseList to match phrases with the SearchPhrase variable
		{
			var Phrase=Phrases[j].toLowerCase();
			
			if (Phrase == SearchPhrase)                                                            //If the whole phrase is equal to the SearchPhrase, then provide a +10 score to the PhraseScore array
			{
				ExactMatches.push(i);                          //Alerts user what list is use, what element in the PhraseList is hit, and what the total score of the respective PhraseList element is			
//				AddToOutput(BuildingPhraseList[i][0]);
			} 
		}
	}
	
	// now, find the partial matches
	
	var PartialMatches = [];                                                                      //An empty array for the phrase scores 
	var SearchPhraseTokens=SearchPhrase.split(" ");                                        //Splits the Search Phrase variable into seperate elements
	
	for (i=0;i<BuildingPhraseList.length;i++)                                                    //Goes through the PhraseTokens length
	{	
		var BuildingPhrases=BuildingPhraseList[i];
		
		for (j=0;j<BuildingPhrases.length;j++)                                                          //For Loop to go through the variable PhraseList to match phrases with the SearchPhrase variable
		{
			var BuildingPhrase=BuildingPhrases[j];
			
			var BuildingPhraseTokens=BuildingPhrase.split(" ");                                                    //Splits the elements of the variable 'Phrase'
	
			for (k=0;k<BuildingPhraseTokens.length;k++)                                          //Goes through the SearchPhraseTokens length
			{
				var BuildingPhraseToken=BuildingPhraseTokens[k];
				BuildingPhraseToken=BuildingPhraseToken.toLowerCase()
				
				for (l=0;l<SearchPhraseTokens.length;l++)                                          //Goes through the SearchPhraseTokens length
				{
					var SearchToken=SearchPhraseTokens[l];
					SearchToken=SearchToken.toLowerCase();
					
					if (BuildingPhraseToken ==SearchToken)                                  //If one element of the PhraseTokens equals to one element of the SearchPhraseTokens, then proceed to the next step
					{
						if (PartialMatches[i]==undefined)
						{
							PartialMatches[i]=1;
						}
						else
						{
							PartialMatches[i] += 1;  //Provides a +1 score for each element in the respective new array 
						}
					}
				}
			}
		}
	}
	
	// add partial mateches to exact matches
	
/*	for (var i=0;i<PartialMatches.length;i++)
	{
		AddToOutput(PartialMatches[i]);
	}
*/	// sort partial matches
	
	var SortedList=[];
	var NumSorted=0;
	for (var i=0;i<PartialMatches.length;i++)
	{
		if (PartialMatches[i]!=undefined)
		{
			SortedList[NumSorted]={
				Score:PartialMatches[i],
				Index:i
			}
			NumSorted++;
		}
	}
	// perform the bubble sort
	
	var FoundChange=true;
	while (FoundChange)
	{
		FoundChange=false;
		
		for (var i=0;i<SortedList.length-1;i++)
		{
			if (SortedList[i].Score<SortedList[i+1].Score) // generates an array of matches
			{
				var Temp=SortedList[i];
				SortedList[i]=SortedList[i+1];
				SortedList[i+1]=Temp;
				
				FoundChange=true;
			}
		}
		
	}
	
	// create the final result array
	
	var Result=ExactMatches;
	var NumResults=Result.length;
	
	// add the partial matches that are not in the result array
	
	for (var i=0;i<SortedList.length;i++)
	{
		if (IndexOf(Result,SortedList[i].Index)==false) // index is not in the results
		{
			Result[NumResults]=SortedList[i].Index; // add the index
			NumResults++;
		}
	}
	
	// return result
	
	return(Result);
}
