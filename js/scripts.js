// Initialize the map (same as before)
var map = L.map('dotmap', {
    crs: L.CRS.EPSG3857
}).setView([44.1, -120.5], 7);

// Create a new pane for the ESRI Satellite Imagery layer
map.createPane('pane_ESRISatelliteArcGISWorld_Imagery_0');
map.getPane('pane_ESRISatelliteArcGISWorld_Imagery_0').style.zIndex = 400;

// Create the ESRI Satellite Layer
var layer_ESRISatelliteArcGISWorld_Imagery_0 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    pane: 'pane_ESRISatelliteArcGISWorld_Imagery_0',
    opacity: 0.86,
    attribution: '',
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 19
});

// Create a new pane for the Mapbox Imagery layer
map.createPane('pane_MapboxImagery');
map.getPane('pane_MapboxImagery').style.zIndex = 400;

// Set your Mapbox access token
var accessToken = 'pk.eyJ1IjoiYXJhbWk1NCIsImEiOiJjbTZ6ZG53OXQwM24zMm1wcHFpanhxbDdqIn0.iw8ih5GLFA7ZRz8QeqrLaQ';

// Create the Mapbox layer
var layer_MapboxImagery = L.tileLayer(
    `https://api.mapbox.com/styles/v1/arami54/cm6zm6d8700hs01re71r597en/draft/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
    attribution: '<a href="https://github.com/Alramirez14">Created by Alec Ramirez</a>' + ' | ' + '<a href="https://www.mapbox.com/about/maps/">Imagery © Mapbox</a>',
    pane: 'pane_MapboxImagery',
    opacity: 0.9,
    minZoom: 1,
    maxZoom: 18,
    minNativeZoom: 0,
    maxNativeZoom: 19
});

// Initially add the Mapbox layer
map.addLayer(layer_MapboxImagery);

// Create a control button to toggle between the two layers
var baseMaps = {
    "ESRI Satellite": layer_ESRISatelliteArcGISWorld_Imagery_0,
    "Mapbox Imagery": layer_MapboxImagery
};

L.control.layers(baseMaps).addTo(map);

// Function to toggle between the layers
var currentLayer = "Mapbox Imagery";

function toggleLayers() {
    if (currentLayer === "Mapbox Imagery") {
        map.removeLayer(layer_MapboxImagery);
        map.addLayer(layer_ESRISatelliteArcGISWorld_Imagery_0);
        currentLayer = "ESRI Satellite";
    } else {
        map.removeLayer(layer_ESRISatelliteArcGISWorld_Imagery_0);
        map.addLayer(layer_MapboxImagery);
        currentLayer = "Mapbox Imagery";
    }
}

// Custom styling function for catchments.geojson (single symbology)
function styleCatchments() {
    return {
        fillColor: '#19a01d',
        weight: 3,
        opacity: 0.5,
        color: 'green',
        fillOpacity: 1
    };
}

// Custom styling function for Tribs_final.geojson (single symbology)
function styleTribs() {
    return {
        color: '#13EAF6',
        weight: 5,
        opacity: 0.5,
        dashArray: '5, 10',
        fillOpacity: 1
    };
}

// Custom popup styling
var popupOptions = {
    className: 'custom-popup',
    closeButton: false
};

// Function to create popup content for catchments
function onEachCatchmentFeature(feature, layer) {
    if (feature.properties && feature.properties.Name) {
        var popupContent = "<b>Study Area Name:</b> " + feature.properties.Name;
        layer.bindPopup(popupContent, popupOptions);
    }
}

// Function to create popup content for Tribs
function onEachTribsFeature(feature, layer) {
    if (feature.properties && feature.properties.Name) {
        var popupContent = "<b>Stream Name:</b> " + feature.properties.Name;
        layer.bindPopup(popupContent, popupOptions);
    }
}

// Create a new pane for the GeoJSON layers
map.createPane('geojsonPane');
map.getPane('geojsonPane').style.zIndex = 500; // Set zIndex higher than base map panes

fetch('data/catchments.geojson')
    .then(response => response.json())
    .then(data => {
        console.log("Catchments features:", data.features.length);
        var catchmentsLayer = L.geoJSON(data, { style: styleCatchments, onEachFeature: onEachCatchmentFeature, pane: 'geojsonPane' }).addTo(map);
    })
    .catch(error => {
        console.error("Error loading catchments.geojson: ", error);
    });

fetch('data/Tribs_final.geojson')
    .then(response => response.json())
    .then(data => {
        console.log("Tribs features:", data.features.length);
        var tribsLayer = L.geoJSON(data, { style: styleTribs, onEachFeature: onEachTribsFeature, pane: 'geojsonPane' }).addTo(map);
        map.fitBounds(tribsLayer.getBounds());
    })
    .catch(error => {
        console.error("Error loading Tribs.geojson: ", error);
    });

// Create the legend
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var labels = ['<strong>Legend</strong><br/>'];
    var catchmentsColor = '#11AB21';
    var tribsColor = '#13EAF6';

    labels.push('<i style="background:' + catchmentsColor + '"></i> Study Areas <br/>');
    labels.push('<i style="background:' + tribsColor + '"></i> Streams');

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);

