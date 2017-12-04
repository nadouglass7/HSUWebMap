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
        # - Has 100 bldng labels with few missing name for labels_2 
    # - BuildingNames8.js
        # - Points for buildings with coordinates. Has building name and Abbreviations
        # - Has 90 bldng names but many are abbreviated
    # x Buildings_Nov122016_3.js
        # - Polygons for buildings with coordinates. Has building name and html descrip.
        # - Has 93 labels, but all names are complete and readable (should be used for master csv name!
    # x BuildingOverlay_Dec11.js
        # - Polygons for building design. Has coordinates and opacity settings. No labels.
    # - BuildingPhraseList.js
        # - js file with lists for each building and search terms. First item is the main building name.
        
# [x] Run script to print all names
# [-] Run script to print all lat longs
# [] Test write into a master.CSV for each .js


import time
import sys
import logging
import os.path
import csv
import pprint
import geojson
import json

def write_csv(csv_f_class,file_path):
    if os.path.exists(file_path) and os.access(file_path, os.R_OK):
        logging.info("\t" + csv_f_class + " already exists" )
        csv = open(file_path, "a")
        csv.write(ID + "," + str(name) + "," + f_class + "," + label_1 + "," + label_2 + "," + str(abbr) + "," + bldng_phrase_list + "," + info_description + "," + image + "\n")
        master_ID_list.append(ID)
    else:
        logging.info("\t" + "CREATED : " + csv_f_class)
        time.sleep(0.05)
        csv = open(file_path, "w")
        logging.info("\t Appending to : " + csv_f_class)
        csv.write("ID" + "," + "name" + "," + "f_class" + "," + "label_1" + "," + "label_2" + "," + "abbr" + "," + "bldng_phrase_list" + "," + "info_description" + "," + "image" + "\n")
        csv.write(ID + "," + name + "," + f_class + "," + label_1 + "," + label_2 + "," + str(abbr) + "," + bldng_phrase_list + "," + info_description + "," + image + "\n")
        master_ID_list.append(ID)
    return()

# set up logging
logging.basicConfig(level=logging.INFO)

logging.info("\t Starting script...")

# File paths for data
bldng_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/Buildings_Nov_13.js")
bldng_overlay_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingOverlay_Dec11.js")
bldng_label_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingLabels_Dec20_2016.js")
bldng_name_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingNames8.js")
bldng_phrase_list_path = os.path.expanduser("~/HSUWebMap/js/BuildingPhraseList.js")

master_ID_list = []

#--------------------#
#     BUILDINGS
#--------------------#
# Obtain:
#    ID's
#    Names
#    f_class(Building, Point or Line)
#--------------------#
abbr_count = 0

name_ID_list = []

fdata = open(bldng_path, 'r')
data = geojson.load(fdata)

# Filler Variables
name = ""
ID = ""
name = ""
f_class = ""
label_1 = ""
label_2 = ""
abbr = ""
bldng_phrase_list = ""
info_description = "Something abouth Something for something and more something"
image = "link to something"

csv_name = "master.csv"
file_path = os.path.expanduser("~/HSUWebMap/" + csv_name)

for feature in data['features']:
    props = feature['properties']

    ID = props['ID']
    name = props['Name']
    f_class = "Building"
    
    name_ID_list.append(ID)

    #logging.info(ID + "\t" + name + "\t" + f_class)
    
    # Set up data for Building_Names8.js
    fdata = open(bldng_name_path, 'r')
    name_data = geojson.load(fdata)
    
    # Loop through building names to find matching ID's and Abbreviations
    for feature in name_data['features']:
        props = feature['properties']
        
        name_ID = props['ID']
        name_abbr = props['Abbr']
        
        print(ID)
        print(name_ID)

        if str(ID) == str(name_ID):
            print('MATCH')
            abbr = name_abbr
            abbr_count+=1
            #if abbr == None:
                #abrr = ""
        else:
            #print('no match')
            pass     
    if name_ID not in name_ID_list:
        abrr = " "
    ## WRITE TO CSV   
    function = write_csv(csv_name,file_path)


#--------------------#
#     BUILDING Overlay
#--------------------#
# Obtain (Additional Buildings):
#    ID's
#    Names
#    f_class(Building, Point or Line)
#--------------------#
count = 0

fdata = open(bldng_overlay_path, 'r')
data = geojson.load(fdata)

#loop through json
for feature in data['features']:
    props = feature['properties']

    ID = props['ID']
    name = props['Name']
    f_class = "Building"

    #loop through master_ID_list
    for v in master_ID_list:
        if ID == v:
            #print('match')
            count+=1
        else:
            #print('no match')
            pass
    if count == 0:
        print('NEWEST FEATURE: ' + ID + '\t' + name)
        function = write_csv(csv_name,file_path)

#--------------------#
#     BUILDING NAMES
#--------------------#
# Obtain (Additional Buildings):
#    ID's
#    Names
#    f_class(Building, Point or Line)
#--------------------#
'''
# BuildingLabels_Dec20_2016.js
fdata = open(bldng_label_path, 'r')
data = geojson.load(fdata)

# Filler Variables
name = ""
label_1 = ""
label_2 = ""

csv_name = "master_bldng_labels.csv"
file_path = os.path.expanduser("~/HSUWebMap/" + csv_name)

for feature in data['features']:
    props = feature['properties']

    label_1 = props['Name']
    label_2 = props['Labels_2']

    print(label_1 + "\t" + label_2)

    ## WRITE TO CSV   
    function = write_csv(csv_name,file_path)
    
'''    
    
    
    
'''
# BuildingLabels_Dec20_2016.js
fdata = open(bldng_path, 'r')
data = geojson.load(fdata)
print("Hello")
# Filler Variables
name = ""
label_1 = ""
label_2 = ""

csv_name = "master_bldngs.csv"
file_path = os.path.expanduser("~/HSUWebMap/" + csv_name)

for feature in data['features']:
    props = feature['properties']

    name = props['Name']

    print(label_1 + "\t" + label_2)

    ## WRITE TO CSV   
    function = write_csv(csv_name,file_path)
'''

