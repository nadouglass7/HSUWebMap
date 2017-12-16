# py folder

CONTENTS:
- `js_to_csv.py` (Pull)
- `csv_to_js.py` (Update)
    
What these scripts do:
1. 

2. 
    - Input: 
        - 
        - 
        
    - Output:
        - 
        - 
     
## How to use the name-stats.py script:

_NOTE: the script currently runs most effectively off of the `whosonfirst-data/meta/` files for .csv stats production._

### 

1. In the Terminal, navigate to the directory with your cloned `mapzen-toolbox/name-localization-work/name-stats-final/` repository.

    `cd /usr/local/mapzen/whosonfirst-toolbox/scripts/name-localazation-work/name-stats-final`

2. Run this command (example using marine-area meta file)

    `python /usr/local/mapzen/whosonfirst-toolbox/scripts/name-localization-work/final-stats-script/final-stats-script.py -p /usr/local/mapzen/whosonfirst-data/data -c /usr/local/mapzen/whosonfirst-data/meta/wof-marinearea-latest.csv --aliases /usr/local/mapzen/whosonfirst-properties/aliases/property_aliases.json -g --slim --slim-template localization -v -d`
    
    - c: referes to the .csv with the desired `wof` id's
    - g: only uses non depricated records
    - d: converts feature to point instead of polygon (only used to speed up the process)

3. A folder named "complete\_stats" should appear on your desktop, containing:
    - .csv files holding the stats for each language.
        - refere to the ISO-639 language codes to find the desired language
    - .csv file for the total\_stats file which will have the statistics for the sum of all languages
    - directory with .csv files for records with missing translations categorized for each language
    - directory with .csv files for records with missing translations categorized for each placetype

### For zoom-specific stats

1. In the Terminal, navigate to the directory with your cloned `mapzen-toolbox/name-localazation-work/name-stats-final/` repository.

    `cd /usr/local/mapzen/whosonfirst-toolbox/scripts/name-localazation-work/name-stats-final`

2. Run this command (example using marine-area meta file for records at zoom 2)

    `python /usr/local/mapzen/whosonfirst-toolbox/scripts/name-localazation-work/final-stats-script/final-stats-script.py   -p /usr/local/mapzen/whosonfirst-data/data -c /usr/local/mapzen/whosonfirst-data/meta/wof-marinearea-latest.csv --aliases /usr/local/mapzen/whosonfirst-properties/aliases/property_aliases.json -g  --zoom 2   --slim --slim-template localization -v -d`
    
    - c: referes to the .csv with the desired `wof` id's
    - g: only uses non depricated records
    - d: converts feature to point instead of polygon (only used to speed up the process)
    - z: filters records by input zoom level

3. A folder named "zoom\_stats" should appear on your desktop, containing:
    - directory(s) for the desired zoom statistics
    -.csv files holding the stats for each language.
        - refere to the ISO-639 language codes to find the desired language
    -.csv file for the total\_stats file which will have the statistics for the sum of all languages
    - directory with .csv files for records with missing translations categorized for each language at that zoom level
    - directory with .csv files for records with missing translations categorized for each placetype at that zoom level

## How to use the name-stats.py script (ADVANCED): 

### For complete stats

1. In the Terminal, navigate to the directory with the prewriten shell scripts for either complete stats or zoom stats.

    `cd /usr/local/mapzen/whosonfirst-toolbox/scripts/name-localazation-work/name-stats-final/shell-scripts`

2. Open the `complete-stats.shell` and make sure each directory is pointing to the correct files (the `name-stats-final.py` and the appropriate meta files)

3. Run this command (example using complete\_stats.shell)
    `sh complete\_stats.shell`
    or
    `sh /usr/local/mapzen/whosonfirst-toolbox/scripts/name-localazation-work/name-stats-final/shell_scripts/complete/complete_stats.shell `
    
4. A folder named "complete_stats" should appear on your desktop

### For zoom stats

1. Follow the above steps and make sure each `zoom_#.shell` file is pointing to the correct directories.

2. Run this in the command:
    
    `sh all_zoom.shell`
    
    or
    
    `sh zoom_0.shell & sh zoom_1.shell & sh zoom_2.shell & sh zoom_3.shell & sh zoom_4.shell & sh zoom_5.shell & sh zoom_6.shell & sh zoom_7.shell & sh zoom_8.shell` etc.

3 .A folder named "complete_stats" should appear on your desktop

### How to add/remove languages from the statistics:

- Additional languages may be added or removed within the script in the dictionary named `lang_code_list` using ISO 639-2 language codes.
    
    `lang_code_list = [ 'ara', 'rus', 'zho', 'fra', 'eng', 'spa', 'hin', 'ell', 'ind', 'deu', 'ben', 'ita', 'kor', 'jpn', 'por', 'tur', 'vie', 'nld', 'pol', 'swe']`
                   
## Making Charts

- Excel files with chart templates for statistics calculated using the `complete` shell scripts

- Excel files with chart templates for statistics calculated using the `zoom` shell scripts

- .crtx files used to replicate chart style (in case the excel files don't have anything, or if styles were accidentally changed)

### How to use the excel files:

#### For Complete Stats
   `by_placetype.xlsx` : used to show complete stats by placetype category for all 20 languages
   - Sheet 1: Main chart

   `by_lang_placetype` : used to show stats by placetype categories. Individual charting for the 6 major UN languages
   - Sheet 1 : Arabic
   - Sheet 2 : Russian
   - Sheet 3 : Chinese
   - Sheet 4 : French
   - Sheet 5 : English
   - Sheet 6 : Spanish

   `by_lang_complete.xlsx`: used to show total percentages for each individual languages. Is to include total numbers from placetype categories
   - Sheet 1: Charting for 6 major UN languages
   - Sheet 2: For all 20 world languages used

#### For Zoom Stats

   `by_zoom_placetype.xlsx` : used to show stats by placetype categories. Individual charting for the each zoom level (0-8)
   - Sheet 1 : Zoom 0
   - Sheet 2 : Zoom 1
   - Sheet 3 : Zoom 2
   - Sheet 4 : Zoom 3
   - Sheet 5 : Zoom 4
   - Sheet 6 : Zoom 5
   - Sheet 7 : Zoom 6
   - Sheet 8 : Zoom 7
   - Sheet 9 : Zoom 8
   
   
   
1. Open the desired chart template in excel
2. Open the desired stats folder/ .csv file
3. The charts have been last used for comparative charting, so you will notice three sections:
    - OLD : stats pasted in this section should be from older data
    - NEW : stats pasted in this section should be from the most up to date data
    - RESULT : this is what is calculated, then placed in the chart. Data labels that appear on the bars come from this section (numbers represent the average across all 20 languages)
    
4. Copy the numbers from the stats folder on your desktop, and paste (VALUES only) them into the appropriate cells in the chart template
5. Numbers should automatically update from formulas
6. Continue to copy/paste values for desired fields

    

### How to use the .crtx files:

### Best practices and notes: