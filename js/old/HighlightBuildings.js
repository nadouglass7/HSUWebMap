//**********************************************************************************************************************************************************************************************************************// 
//Provides a hover event to highlight the buildings
var Buildings;  
function highlightFeature(e){
	var layer = e.target;

	layer.setStyle(
		{
			color: '#B65300', 
			weight: 2,
			opacity: 0.6,
			fillOpacity: 0.65,
			fillColor: '#E5F0D3',
			clickable: 'true'
		}
	);
//	if(!L.Browser.ie && !LBrowser.opera){     
//		layer.bringToFront();
//	}
}

//Resets the highlight style
function resetHighlight(e){
	Buildings.resetStyle(e.target);
}

//Provides the mouse on and mouse over styles, along with the popups for each building
function BuildingsOnEachFeature(feature, layer){
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
	});
	var PopUpInfo = "<div><h1 class='PopUpTitle'>"+feature.properties.name+"</h1></div><div><p style='font-size: 12px;'>"+feature.properties.popupContent+"</p></div>";
	layer.bindPopup(PopUpInfo); 
}

//The default style of each building with ZERO opacity
function buildingStyle(feature){
	return{
		color: '#FFF', 
		weight: 1,
		opacity: 0,
		fillOpacity: 0,
		fillColor: '#FFF'
	}
}

//Places the default style of the building and sets the highlight feature
Buildings = L.geoJson(buildings, { 
	style: buildingStyle,
	onEachFeature: BuildingsOnEachFeature
}).addTo(map);