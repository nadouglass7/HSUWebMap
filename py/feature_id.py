# this script was written by @ndcartography, 10/2017
# designed to assign an id to each feature used in to HSU interactive web map
# adds a new property called `id` to each distinct spatial feature

#for desired use, run:
#
# python ~/HSUWebMap/py/get_labels.py 
#

#!/usr/bin/env python

# -*- coding: utf-8 -*-


import time
import sys
import logging
import os.path
import csv
import pprint
import geojson
import json
import pandas as pd
import numpy as np

# set up logging
logging.basicConfig(level=logging.INFO)

logging.info("\t Starting script...")

# File paths for data
inpath = os.path.expanduser("~/HSUWebMap/Spatial_Data/Buildings_Nov122016_3.js")
#bldng_label_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingLabels_Dec20_2016.js")
#bldng_name_path = os.path.expanduser("~/HSUWebMap/Spatial_Data/BuildingNames8.js")
#bldng_phrase_list_path = os.path.expanduser("~/HSUWebMap/js/BuildingPhraseList.js")

outpath = os.path.expanduser("~/HSUWebMap/Spatial_Data/Tmp_Buildings_Nov122016_3.js")

# File path to id sheet
id_sheet = os.path.expanduser("~/HSUWebMap/id_sheet.csv")
temp = os.path.expanduser("~/HSUWebMap/temp_id_sheet.csv")

#---------------#
#  MAIN SCRIPT
#---------------#

fresh_id_list = []
used_id_list = []
name_list = []

count = 0
id_count = 0


with open(id_sheet, 'r') as inf:
    reader = csv.DictReader(inf, delimiter=',')

    for row in reader:
        id = row.get('id', None)
        in_use = row.get('in_use', None)
        if in_use == 'NULL':
            #props['id'] = id
            fresh_id_list.append(id)
            logging.info(str(row) + "\tFree id")
        else:
            logging.info("\tid taken")
            pass
logging.info("\t--------------------------------------\r")

fdata = open(inpath, 'r+')
data = json.load(fdata)

out = open(outpath, 'a')

for feature in data['features']:
    props = feature['properties']
    name = props['Name']
    print(feature)
    if not props.has_key("id"):
        logging.info("\t\tDoes NOT have id property \t") 
        fresh_id = fresh_id_list[count]
        props['id'] = fresh_id
        used_id_list.append(fresh_id)
        name_list.append(name)
        logging.info("\tname: " + name + "\tid: " + props['id'])
        count+=1

    else:
        logging.info("\tHas id property: \t" + props[id])    
geojson.dump(data,out)
os.remove(inpath)
os.rename(outpath, inpath)

with open(id_sheet, 'r') as inf, open(temp, 'w') as outf:
    reader = csv.DictReader(inf, delimiter=',')
    writer = csv.DictReader(outf, delimiter=',')
    outf.write('id' + ',' + 'in_use' + ',' + 'name' + '\n')

    for row in reader:
        id = row.get('id', None)
        in_use = row.get('in_use', None)
        name = row.get('name', None)
        if id == used_id_list[id_count]:
            outf.write(id + ',' + 'Y' + ',' + name_list[id_count] + '\n')
            if id_count >= (len(used_id_list)-1):
                pass
            else:
                id_count+=1
        else:
            outf.write(id + ',' + 'NULL' + ',' + 'NULL' + '\n')
            pass  
    os.remove(id_sheet)
    os.rename(temp, id_sheet)
    outf.close()

    

