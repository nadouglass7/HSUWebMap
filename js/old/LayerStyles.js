//**********************************************************************************************************************************************************************************************************************// 
/**
* These are the icon on the right of the accordian
* Specifies where to find the marker icons and sets their properties
*/
  //BUILDING STYLES
  var BuildingStyles = {
	color: '#25551B', 
	weight: 2,
	opacity: 0.6,
	fillOpacity: 0.65,
	fillColor: '#E5F0D3'
  };
    
//PARKING STYLES
var generalIcon = L.icon({
  iconUrl: 'images/GeneralParking.svg',
  iconSize:     [20, 20], // size of the icon
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
});
  
  var employeeIcon = L.icon({
  iconUrl: 'images/StaffParking.svg',
  iconSize:     [20, 20], 
  iconAnchor:   [13, 13], 
  popupAnchor:  [0, -20], 
  });
  
  var residentIcon = L.icon({
  iconUrl: 'images/ResidentParking.svg',
  iconSize:     [20, 20], 
  iconAnchor:   [13, 13], 
  popupAnchor:  [0, -20], 
  });
  
  var accessparkingIcon = L.icon({
  iconUrl: 'images/AccessParking.svg',
  iconSize:     [20, 20], 
  iconAnchor:   [13, 13], 
  popupAnchor:  [0, -20], 
  });

  var DispenserIcon = L.icon({
  iconUrl: 'images/ParkingDespenser.svg',
  iconSize:     [14, 14], 
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });  
  
  //DINING STYLES
  var diningIcon = L.icon({
  iconUrl: 'images/dining_map_icon.svg',
  iconSize:     [20, 20], // size of the icon
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
  });

  var CoffeeIcon = L.icon({
  iconUrl: 'images/coffee_map_icon.svg',
  //iconUrl: 'images/Interdisciplinary_Labs.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  }); 
  
  //ACCESSINILITY STYLES
  var elevatorsIcon = L.icon({
  iconUrl: 'images/elevators-01.svg',
  iconSize:     [17, 17], // size of the icon
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
  });
  
  var doorsIcon = L.icon({
  iconUrl: 'images/AutomaticDoor.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  //BUSES
  var busIcon = L.icon({
  iconUrl: 'images/BusStop2.svg',
  iconSize:     [20, 20], // size of the icon
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor 
  });
  
  var GoldRouteStyle = {  //gold
  color: '#FED059',
  weight: 2,
  opacity: 0.8,
  smoothFactor: 2
  };
  
  var RedRouteStyle = {  //red
  color: '#FF0000',
  weight: 2,
  opacity: 0.8,
  smoothFactor: 2
  };
  
  var OrangeRouteStyle = {  //orange
  color: '#FF6100',
  weight: 2,
  opacity: 0.8,
  smoothFactor: 2
  };
  
  //COMPUTER LAB STYLES
  var GenLabIcon = L.icon({
  iconUrl: 'images/GeneralLab.svg',
  iconSize:     [20, 20], // size of the icon 
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
  });

  var InterLabIcon = L.icon({
  iconUrl: 'images/InterLab.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });  
  
  //RECREATION STYLES
  var BasketballIcon = L.icon({
  iconUrl: 'images/New_BasketBall.svg',
  iconSize:     [20, 20], // size of the icon
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
  });
  var DiscGolfIcon = L.icon({
  iconUrl: 'images/DiscGolf.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var FitnessIcon = L.icon({
  iconUrl: 'images/New_Fitnesscenter.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var FootballIcon = L.icon({
  iconUrl: 'images/New_Football.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var SoccerIcon = L.icon({
  iconUrl: 'images/soccer.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var SoftballIcon = L.icon({
  iconUrl: 'images/Softball.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var SwimmingIcon = L.icon({
  iconUrl: 'images/New_Swimming.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var VolleyBallIcon = L.icon({
  iconUrl: 'images/New_volleyball.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  //RESOURCES
  
  //EMERGENCY SERVICES
  var PoliceIcon = L.icon({
  iconUrl: 'images/Police.svg',
  iconSize:     [20, 20], // size of the icon  
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location  
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor  
  });
  
  var EmergencyCallIcon = L.icon({
  iconUrl: 'images/EmergencyLights.svg',
  iconSize:     [20, 20],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  var EAPBlackIcon = L.icon({                             //*************Beginning of EAP Points*************
  iconUrl: 'images/AppropriateBuilding_Black.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPCreekGreenIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Creek_Green.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPCyanIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Cyan.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPFWHIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_FWH.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPGreenGymsIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_GreenGyms.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  }); 

  var EAPGreyIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Grey.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  }); 

  var EAPLightBlueIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_LightBlue.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  }); 

  var EAPLightBrownIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_LightBrownMCC.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  }); 

  var EAPLightGreenIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_LightGreen.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPOrangeIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Orange.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPPlantYellowIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_PlantOps_Yellow.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });  
  
  var EAPPurpCermIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Purple_Ceramics.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPRedIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Red.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPSBSIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_SBS.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPSciencePurpIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Science_Purple.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPToddPurpIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Toddler_Purple.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPVanMatreIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_VanMatre_LightPurple.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPVioletIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Violet.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var EAPBSSYellowIcon = L.icon({
  iconUrl: 'images/AppropriateBuilding_Yellow_BSS.svg',
  iconSize:     [7, 7],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyBlackIcon = L.icon({                          //*************Beginning of Rally Points*************
  iconUrl: 'images/RallyPoint_Black.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var RallyCreekGreekIcon = L.icon({
  iconUrl: 'images/RallyPoint_CreekGreen.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var RallyCyanIcon = L.icon({
  iconUrl: 'images/RallyPoint_Cyan.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyFWHIcon = L.icon({
  iconUrl: 'images/RallyPoint_FWH.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyGreenGymsIcon = L.icon({
  iconUrl: 'images/RallyPoint_GreenGyms.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyGreyIcon = L.icon({
  iconUrl: 'images/RallyPoint_Grey.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyLightBlueIcon = L.icon({
  iconUrl: 'images/RallyPoint_LightBlue.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });

  var RallyLightBrownIcon = L.icon({
  iconUrl: 'images/RallyPoint_LightBrown.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyLightGreenIcon = L.icon({
  iconUrl: 'images/RallyPoint_LightGreen.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyOrangeIcon = L.icon({
  iconUrl: 'images/RallyPoint_Orange.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyPlantYellowIcon = L.icon({
  iconUrl: 'images/RallyPoint_PlantOps_Yellow.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyPurpleCermIcon = L.icon({
  iconUrl: 'images/RallyPoint_Purple_Ceramics.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyRedIcon = L.icon({
  iconUrl: 'images/RallyPoint_Red.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallySBSIcon = L.icon({
  iconUrl: 'images/RallyPoint_SBS.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallySciencePurpleIcon = L.icon({
  iconUrl: 'images/RallyPoint_Science_Purple.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyToddlerIcon = L.icon({
  iconUrl: 'images/RallyPoint_Toddler_Purple.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyVanMatreIcon = L.icon({
  iconUrl: 'images/RallyPoint_VanMatre_LightPurple.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyVioletIcon = L.icon({
  iconUrl: 'images/RallyPoint_Violet.svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  var RallyYellowBSSIcon = L.icon({
  iconUrl: 'images/RallyPoint_Yellow(BSS).svg',
  iconSize:     [14, 14],  
  iconAnchor:   [13, 13],  
  popupAnchor:  [0, -20],  
  });
  
  //MICELLANEOUS
  var venueIcon = L.icon({
  iconUrl: 'images/venue-01.svg',
  iconSize:     [26, 26], // size of the icon
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
  });
  
  var healthIcon = L.icon({
  iconUrl: 'images/healthservices-01.svg',
  iconSize:     [26, 26], // size of the icon
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
  });
  
  
  var smokingIcon = L.icon({
  iconUrl: 'images/smoking-area-01.svg',
  iconSize:     [26, 26], // size of the icon
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
  });
  
  
  var postIcon = L.icon({
  iconUrl: 'images/post-office-01.svg',
  iconSize:     [26, 26], // size of the icon
  iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
  }); 