This is the main code folder for CanvasMap.

At the root of this folder is the BuildMini.bat file which builds the CanvasMap.js minified version of CanvasMap.
BuildMini.bat is created by the Java program "CreateBuildMiniBat.java".

JavaScript (js) Files:

This folder contains all the JavaScript files that make up CanvasMap.
It also contains BuildFiles.txt which is a list of all the files that are released in the minifiied version, CanvasMap.js

CanvasMap.js - the main CanvasMap file
CMDialog.js - Functions to make it easy to put up dialog boxes in a browser
CMLayer.js - base class for all layers in scenes
CMLayerDataset - the layer to display GeoJSON vector data 
CMLayerGraticule.js - layer in development for adding graticules to a map
CMLayerPyramid.js - layer to support pyramids (tiles) from BlueSpray, both raster and vector
CMLayerPyramidOpenFormat - layer to support pyramids (tiles) from the open format used by OpenStreetMap
CMLayerRaster.js - layer to support individual rasters (only use for smallish ones
CMNorthArrow.js - layer in dvelopment to draw north arrows that point north on a map
CMProjector.js - base class for projection classes
CMProjectorGoogleMaps.j - projector to project to exactly the GoogleMaps projection (i.e. their pixel tiles)
CMProj4JS2.js - Provides a projector class to wrap the Proj4JS2.js library below
CMProjectorUTM.js - UTM projection class
CMScaleBar.js - class to put scale bars into a CanvasMap that correctly scale as the map moves
CMScene.js - container for layers within a CanvasMap
CMTiles.js - class to represents a single tile within a pyramid for raster and vector tiles from BlueSpray
CMUtilities.js - general utilities for managing; borders, colors, Geometries from JSON, etc.
CMView.js - the view of a scene in a CanvasMap.

Libraries from other sources:

Chart.js - Library for the charts in the examples from "Chart.js"
hammer.js - library for supporting mobile jestures
jquery-2.1.0.js - jQuery library for browser compatibility and a few animations (i.e. the slider in the HSU web map)
Proj4JS2.js - A convertion of the Proj4.js library.  This was created using a Java program to make the code run in a browser and to make it more readable.

To build the minifie version of the js folder, CanvasMap.js, run BuildMini.bat.  If you get an error that it "Cannot Read File", then 
DW probably put non-UTF 8 characters into the file.  Open the file in NotePad++, set the encoding to UTF-8 and look for blocks of 
green with hex values in them and remove them.