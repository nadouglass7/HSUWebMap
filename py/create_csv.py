#!/usr/bin/python -tt
# -*- coding: utf-8 -*-
# encoding=utf8 

# this script was written by @nadouglass, 10/2017
# designed to obtain current labels used for the HSU interactive web map
# produces a master.csv file that contains all labels and descriptions

#for desired use, run:
#
# python ~/HSUWebMap/py/
#

import time
import sys
import logging
import os.path
import csv
import pprint
import geojson
import json

'''

'''
def write_csv(csv_f_class,file_path):
    if os.path.exists(file_path) and os.access(file_path, os.R_OK):
        logging.info("\t" + csv_f_class + " already exists" )
        csv = open(file_path, "a")
        csv.write(str(ID) + "	" + name + "	"  + label_1 + "	" + label_2 + "	" + abbr + "	" + bldng_phrase_list + "	" + info_description + "	" + image + "\n")
        overlay_ID_list.append(ID)
    else:
        logging.info("\t" + "CREATED : " + csv_f_class)
        time.sleep(0.05)
        csv = open(file_path, "w")
        logging.info("\t Appending to : " + csv_f_class)
        csv.write("id" + "	" + "name" +  "	" + "label_1" + "	" + "label_2" + "	" + "abbr" + "	" + "bldng_phrase_list" + "	" + "info_description" + "	" + "image" + "\n")
        csv.write(str(ID) + "	" + name + "	"  + label_1 + "	" + label_2 + "	" + abbr + "	" + bldng_phrase_list + "	" + info_description + "	" + image + "\n")
        overlay_ID_list.append(ID)
    return()

# set up logging
logging.basicConfig(level=logging.INFO)

logging.info("\t Starting script...")

# File paths for data
#bldng_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/Buildings_Nov_13.js")
bldng_overlay_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingOverlay_Dec_12.js")
bldng_label_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingLabels_Dec20_2016.js")
#bldng_name_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingNames8.js")
#bldng_phrase_list_path = os.path.expanduser("~/HSUWebMap/js/BuildingPhraseList.js")



#--------------------#
#     BUILDING Overlay
#--------------------#
# Obtain (Additional Buildings):
#    ID's
#    Names
#--------------------#
overlay_ID_list = []
name_ID_list = []
badfeeling_ID_list = []

append_count = 0

fdata = open(bldng_overlay_path, 'r')
data = geojson.load(fdata)

# Filler Variables
ID = ""
name = ""
label_1 = ""
label_2 = ""
abbr = ""
bldng_phrase_list = ""
info_description = ""
image = ""

# Dir for where to write csv
csv_name = "master.tsv"
file_path = os.path.expanduser("~/HSUWebMap/" + csv_name)

# Loop through each feature of the Building_Overlay Json
for feature in data['features']:
    props = feature['properties']
    
    # Gather properties for feature (.encode used for any ascii character)
    ID = props['ID'].encode("utf-8")
    name = props['Name'].encode("utf-8")
    info_description = props['HTML'].encode("utf-8")
    image = props['image'].encode("utf-8")
    
    info_description = ("\'%s\'" % info_description)
    image = ("\'%s\'" % image)
    
    # append current ID to an external list
    #overlay_ID_list.append(ID)
  
    #--------------------#
    #     BUILDING LABELS
    #--------------------#
    # Obtain :
    #    ID's
    #    Label_1
    #    Label_2
    #--------------------#

    ## OPEN DATA FOR LABELS DATASET
    fdata = open(bldng_label_path, 'r')
    data = geojson.load(fdata)
    count = 0
    # Loop trough other Json to find matching ID
    for feature in data['features']:
        props = feature['properties']

        name_ID = props['ID']
        if append_count == 0:
            name_ID_list.append(name_ID)
        else:
            pass
        if name_ID == ID:
            print("MATCHING ID!!!!" + "\t" + name_ID)
            label_1 = props['Name']
            label_2 = props['Labels_2']

            if label_1 == None:
                label_1 = ""
            if label_2 == None:
                label_2 = ""

            label_1 = label_1.encode("utf-8")
            label_2 = label_2.encode("utf-8")
            count+=1
            break
        else:
            #print("no match, append to external list...")
            pass
    
    append_count+=1
    
    
    if count == 0:
        print("I've got a bad feeling about this...")
        label_1 = ""
        label_2 = ""
        badfeeling_ID_list.append(name_ID)
    
    #print(ID + "\t" + name)

    ## Send results to 
    function = write_csv(csv_name,file_path)

missing_ID_list = []
print("name_ID_list: \t" + str(name_ID_list))
print("badfeeling_ID_list: \t " + str(badfeeling_ID_list))
#missing_ID_Count = 0

# loops through buildingLabels_ids
for name_ID in name_ID_list:
    print ("Checking ID: \t" + name_ID)
    # matches name_ID with loop through list of overlay_IDs

    missing_ID_Count = 0
    for overlay_ID in overlay_ID_list:

        # if that one matches, add a count
        print ("matching ID: \t" + name_ID + " & " + overlay_ID)
        if name_ID == overlay_ID:
            print("ID match, cool, do nothing")
            missing_ID_Count+=1
            break
        else:
            print("ID didnt match, check others")
    #if their was a match, do nothing
    if missing_ID_Count > 0:
        print("was a match at name_ID for buildingLabels at : " + "\t" + name_ID)

    elif missing_ID_Count == 0:
        print("NO MATCH FOUND ")
        print("missing_ID_Count : " + str(missing_ID_Count) + "\t" + "appending to added list")
        missing_ID_list.append(name_ID)

print("Final list of non matching IDs: \t" + str(missing_ID_list))

fdata = open(bldng_label_path, 'r')
data = geojson.load(fdata)
count = 0
# Loop trough other Json to find matching ID
for feature in data['features']:
    props = feature['properties']

    ID = props['ID']
    label_1 = props['Name']
    label_2 = props['Labels_2']
    
    if label_1 == None:
        label_1 = ""
    if label_2 == None:
        label_2 = ""
    
    label_1 = label_1.encode("utf-8")
    label_2 = label_2.encode("utf-8")
    
    for name_ID in missing_ID_list:
    	if name_ID == ID:
    	    name = ""
    	    abbr = ""
            bldng_phrase_list = ""
            info_description = ""
            image = ""
    	    function = write_csv(csv_name,file_path) 
        else:
            pass


        
