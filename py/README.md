# py folder

### CONTENTS:
- `feature_id.py` (check and assign id)
- `create_csv.py` (pull)
- `Update_js.py`  (push)
    
	
	
Building labels, infobox descriptions and search terms come from these datasets:

BuildingOverlay.js, 
BuildingLabels.js, 
BuildingPhraseList.js 

Rather than editing these individually, a better method would be to edit a single .csv file (master.csv) which would have columns for all the necessary components, then a script that would take those values and write them to the appropriate dataset. Sounds great, right?! Unfortunately, there were a few hitches and wasn’t able to be released in time. So here’s what was started.

### Requirement

The scripts found in the HSUMap/py folder contain a series of scripts that were developed on a MAC OS and tested in Bash(Unix Shell), therefore they won’t work immediately on a PC or in Command Line (Windows) 

### Written using:
     - Python 2.7

### Uses these python libraries:
     - time
     - sys
     - logging
     - os.path
     - csv
     - pprint
     - geojson
     - Json
	 
## Scripts:
feature_id.py 	- checks spatial data to see if each feature has a unique ID
create_csv.py 	- creates an up to date Master.csv list with current info from data
update_js.py	- updates the appropriate spatial data according to the master.csv

Files:
Id_sheet.csv	- houses the unique ID’s that are currently used and still available
Master.csv		- change feature names and infobox descriptions for update_js.py
README.md		- info about the scripts

## How to run


With WingIDE

Open WingIDE
File > Open > .../HSUMap/py/feature_id.py (or any other script)
Click Run!



With Terminal or Command line

Open Terminal or Command Line
Type ‘python’
Add a space ‘ ’
Drag the desired script into the window
Click ‘Enter’!


## Properly utilizing an ID system

Since building names and features might change over time, it’s important to use an ID system to tag each feature. Rather than trying to join data from multiple files, based on their name, (which might be misspelled from one file to the next) giving each feature a unique ID number that is consistent across all datasets will eliminate many issues. 

Id_sheet.csv:                 
This file has a total of 1,482 (484 currently in use) unique feature ID’s that were generated from Random.org
We doubt that HSU will grow expenotially and aquire 998 more buildings/features, but you never know! If that does happen and you run out of ID’s, you can always generate more in Excell
The ID’s have no rhythm or rythm, they are completely random and are simply used to identify each feature uniquely
If you notice that a feature doesn’t have an ID, add the next available one and update this sheet!
OR use the feature_id.py  script to update it automatically

## How the scripts work


### Feature_id.py:

Step 1.
checks id_sheet.csv for free or 'available' ID's
Step 2.
loads selected .js file
checks for ID property
If there is no ID property, or the ID property is null, then it assigns it the next available ID
Step 3.
Update id_sheet.csv to reflect id usage


### create_csv.py 

Since the two most important datasets, in terms of labeling data, are BuildingOverlay.js and BuildingLabels.js, the script runs through each data set and collects information from these properties:



The script then creates a .csv file that houses this data, all organized by the feature ID

### Update_js.py (UNFINISHED):

Takes the information from master.csv script and re-maps it back to the appropriate geojson files. The script is not fully working, and needs extra attention. Going through by each ID should yield the correct information, but re-writing a new .js file is the key.










