# this script was written by @ndcartography, 10/2017
# designed to obtain current labels used for the HSU interactive web map
# produces a master.csv file that contains all labels and descriptions

#for desired use, run:
#
# python ~/HSUWebMap/py/get_labels.py 
#

#!/usr/bin/env python

# -*- coding: utf-8 -*-


## TO DO:
# [x] Figure out where all labels and search names come from
    # - BuildingLabels_Dec_20_2016.js
        # - For labels ON THE MAP
    # - BuildingNames8.js
        # - Points for buildings with coordinates. Has building name and Abbreviations
    # - Buildings_Nov122016_3.js
        # - Polygons for buildings with coordinates. Has building name and html descrip.
    # - BuildingOverlay_Dec11.js
        # - Polygons for building design. Has coordinates and opacity settings. No labels.
    # - BuildingPhraseList.js
        # - js file with lists for each building and search terms. First item is the main building name.
        
# [] Run script to print all names
# [] Run script to print all lat longs
# [] Test write into a .CSV


import time
import sys
import logging
import os.path
import csv
import pprint
import geojson
import json

# set up logging
logging.basicConfig(level=logging.INFO)

logging.info("\t Starting script...")

bldng_label_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingLabels_Dec20_2016.js")
bldng_name_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingNames8.js")
bldng_phrase_list_path = os.path.expanduser("~/HSUWebMap/js/BuildingPhraseList.js")

fdata = open(bldng_name_path, 'r')
data = geojson.load(fdata)

for feature in data['features']:
    #print(feature)
    props = feature['properties']
    #print(props)
    #print("\t\t\t BREAK ****************")
    name = props['Name']
    #label_2 = props['Labels_2']
    print(name)
    #if name == "":
        #print(label_2)
        
    print("\t\t BREAK ****************")
    





##---------
'''
## pseudo-names for master csv
bldng_name = "Something"
abbreviation = "smt"
bldng_phrase_list = "smt, this, that, more of that"
info_description = "Something abouth Something for something and more something"
image = "link to something"

## WRITE TO CSV
csv_name = "master.csv"
file_path = os.path.expanduser("~/HSUWebMap/" + csv_name)
logging.info("\t Starting .csv writing...")

if os.path.exists(file_path) and os.access(file_path, os.R_OK):
    logging.info("\t" + csv_name + " already exists" )
    #csv = open(file_path, "a")
    #csv.write(bldng_name + "," + abbreviation + "," + bldng_phrase_list + "," + info_description + "," + image)
     
else:
    logging.info("\t" + csv_name + " does NOT exist")
    time.sleep(0.05)
    csv = open(file_path, "w")
    logging.info("\t CREATED : " + csv_name)
    csv.write("bldng_name"               + "," + "abbreviation"      + "," + "bldng_phrase_list" + ","   + "info_description"    + "," + "image" + "\n")
    csv.write(bldng_name + "," + abbreviation + "," + "\"" + bldng_phrase_list + "\"" + "," + info_description + "," + image)
'''
