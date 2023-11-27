//Get the url of 4.5 earthquakes from the last month
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"

//Query the data
d3.json(url).then(function (data) {
    // Make a function to get the features of the data we end up needing
    createFeatures(data.features)   
});

// Set colors according to the depth of the Earthquake
function getColor(depth) {
    return  depth < 11 ? '#006400' : // Dark Green
            depth < 51 ? '#FFFF00' : // Yellow
            depth < 101 ? '#FFA500' : // Orange
            depth < 151 ? '#FF4500' : // Light Red
                      '#8B0000';  // Dark Red
}
  
//Create a function which creates a popup for each feature including the date, depth and magnitude referencing from the features directly
  function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr>
        <p>Date: <a href="${feature.properties.url}">${new Date(feature.properties.time)}</a></p>
        <p>Depth: ${feature.geometry.coordinates[2]}</p>
        <p>Magnitude: ${feature.properties.mag}</p>`); 
    }
 
//Create an earthquake layer which includes the onEachFeature function as described to me by chatGPT. 
    let earthquakeLayer = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
      let markerOptions = {
        radius: 8,
        fillColor: getColor(feature.geometry.coordinates[2]), //fill based on depth
        weight: 1,
        opacity: 1,
        fillOpacity: 0.85,
        radius: (feature.properties.mag)*3
  
    };
        return L.circleMarker(latlng, markerOptions);
    }
    });
//Create a mpa based on the earthquake layer variable
    createMap(earthquakeLayer);
    
  }
  
  //Use the createmap function as seen from the module activties
  function createMap(earthquakeLayer) {
  
    // Copied from the module activties
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
    //Also recevied from the module activities
    let topographic = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create create the baseMaps object to reference the street map and topographic map
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topographic
    };
  
    // Create the overlay maps with the Earthquakes option
    let overlayMaps = {
      Earthquakes: earthquakeLayer
    };
  
    // Create map based from the module activities with the center being Texas 
    let myMap = L.map("map", {
      center: [
        31.96, -99.71
      ],
      zoom: 5,
      layers: [street, earthquakeLayer]
    });
  
    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
  // Add a legend based on the depth numbers from above
let legend = L.control({ position: 'topright' });
// add legend to the map with the correct bins
legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend'),
        depths = [0, 10, 50, 100, 150],
        labels = [];
// Generate legend with the bins. I couldn't figure out how to get the colors to work but here is the code that I tried with the CSS add ons. 
for (var i = 0; i < depths.length - 1; i++) {
    div.innerHTML +=
        `<i style="background-color:${getColor(depths[i] + 1)};"></i>${depths[i]} &ndash; ${depths[i + 1]}<br>`;
}
div.innerHTML += `<i style="background-color:${getColor(depths[depths.length - 1])};"></i>${depths[depths.length - 1]}+`;

return div;
};
legend.addTo(myMap);

  };