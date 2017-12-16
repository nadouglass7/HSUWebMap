'''
1. Read the csv
each row match the id and values
find id value
name
label 1
label 2 
abbr
    open the 1st json
    if id matches
        map values to that json
    if not 
        do nothing
    dump

    Open the next json
    if id matches
        map values to json
    if not
        do nothing
        
    dump
    
end
'''
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

# set up logging
logging.basicConfig(level=logging.INFO)

logging.info("\t Starting script...")

# File path for master.tsv
master_file_path = os.path.expanduser("~/HSUWebMap/master.csv")

# File paths for data
bldng_overlay_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingOverlay_Dec_12.js")
bldng_label_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingLabels_Dec20_2016.js")
temp = os.path.expanduser("~/HSUWebMap/Spatial_Data/temp.js")
temp2 = os.path.expanduser("~/HSUWebMap/Spatial_Data/temp2.js")

#----------------------------------------------------#
#  Step: 1
#
#  Read the master.csv(tsv) 
#  Gather data from each row (ID,name,label_1, label_2, abbr, info_descriptions, image)
#----------------------------------------------------#

with open(master_file_path, 'r') as inf:
    reader = csv.DictReader(inf, delimiter=',')

    for row in reader:

        master_ID = row.get('id')
        master_name = row.get('name', None)
        master_label_1 = row.get('label_1', None)
        master_label_2 = row.get('label_2', None)
        master_abbr = row.get('bldng_phrase_list', None)
        master_info_description = row.get('info_description', None)
        master_image = row.get('image', None)

        logging.info("\rStarting mapping process for : " + str(master_ID) + "\t" + str(master_name) + "\r")

        #---------------------------------------------#
        #  Step: 2
        #
        #  Read json files and map/update data from master
        #     - BuildingOveray.js
        #     - BuildingLabels.js 
        #---------------------------------------------#

        #--------------------#
        #     BUILDING Overlay
        #--------------------#
        # Check for matching id's and map:
        #    Name
        #    info_description (HTML)
        #    image
        #--------------------#

        in_path = bldng_overlay_path
        out_path = temp

        fdata = open(in_path, 'r+')
        data = json.load(fdata)
        
        out = open(out_path, 'w+')
        #feeds = json.load(out)
        
        #with open(out_path, mode='w') as f:
            #json.dump([],f)
        
        for feature in data['features']:
            props = feature['properties']
            
            json_ID = props['ID'].encode("utf-8")
            json_Name = props['Name'].encode("utf-8")
            json_info_description = props['HTML'].encode("utf-8")
            json_image = props['image'].encode("utf-8")
            
            logging.info("\t\t .........      " + str(json_ID) + "\t" + str(json_Name))
            if json_ID == master_ID:
                print ("Matched ID!")
                
                logging.info("\t\t\t\t json file was: " + str(props))
                
                json_ID = master_ID 
                json_Name = master_name
                json_info_description = master_info_description
                json_image = master_image                
                
                logging.info("\t\t\t\t json file is now: " + str([json_ID, json_Name, json_info_description, json_image]))
                
                geojson.dump(data,out)
                feature_changed = True
                break
            else:
                pass
            #print(feature)
            ##if not props.has_key("ID"):
            ##    logging.info("\t\tDoes NOT have id property \t") 
            ##    fresh_id = fresh_id_list[count]
            ##    props['id'] = fresh_id
            ##    used_id_list.append(fresh_id)
            ##    name_list.append(name)
            ##    logging.info("\tname: " + str(name) + "\tid: " + str(props['id']))
            ##    count+=1
        ##
            ##else:
            ##    null = None
            ##    if props['ID'] == null:
            ##        fresh_id = fresh_id_list[count]
            ##        props['ID'] = str(fresh_id)
            ##        used_id_list.append(fresh_id)
            ##        name_list.append(name)
            ##        logging.info("\tname: " + str(name) + "\tID: " + str(props['ID']))
            ##        count+=1
            ##    else:
            ##        #logging.info("\tHas id property already: \t" + props['ID'])  
            ##        pass
        ##
        # writes results to existing .js file (comment this out during first run of this script)
        #if feature_changed:
            #geojson.dump(data,out)
        #else:
            #pass
        #os.remove(inpath)
        #os.rename(outpath, inpath)

