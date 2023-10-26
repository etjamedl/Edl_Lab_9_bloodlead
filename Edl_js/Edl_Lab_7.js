// Create Map Object
var map = L.map('map',{ center: [40.003926, -75.135201], zoom: 11 });

var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXRqYW0iLCJhIjoiY2xvN3F5b2NiMDdnbDJtbzNrZm84MTFyYSJ9.ZTrBgi6Yek6OWQ_MmaEJgg';

var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});

var baseMaps = {
"grayscale": grayscale,
"streets": streets
};

var temple = L.marker([39.981192, -75.155399]);
var drexel = L.marker([39.957352834066796, -75.18939693143933]);
var penn = L.marker([39.95285548473699, -75.19309508637147]);

var universities = L.layerGroup([temple, drexel, penn]);
var universityLayer = {
    "Phily University": universities
    };
		
// Add census tract of blood lead in Philadelphia GeoJSON Data
var neighborhoodsLayer = null;
$.getJSON("data/blood_lead.geojson",function(data){
    neighborhoodsLayer = L.geoJson(data, {
        style: styleFunc,
        onEachFeature: onEachFeature
    }).addTo(map);
    var overlayLayer = {
        "blood_lead_level": neighborhoodsLayer,
        "Phily University": universities
    };

    L.control.layers(baseMaps, overlayLayer).addTo(map);
});


// Set style function that sets fill color property equal to blood lead
function styleFunc(feature) {
    return {
        fillColor: setColorFunc(feature.properties.num_bll_5p),
        fillOpacity: 0.9,
        weight: 1,
        opacity: 1,
        color: '#ffffff',
        dashArray: '3'
    };
}

// Set function for color ramp
function setColorFunc(density){
    return density > 40 ? '#7a0177' :
            density > 20 ? '#c51b8a' :
            density > 10 ? '#f768a1' :
            density > 0 ? '#fbb4b9' :
                            '#BFBCBB';
};

function onEachFeature(feature, layer){
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomFeature
    });
    layer.bindPopup('<b>Philadelphia County Census Tract: </b>' + feature.properties.census_tra.slice(-4) + 
    '<br>' + 
    '<b>Children with Elevated Blood Lead:</b> '+feature.properties.num_bll_5p);
}

function highlightFeature(e){
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    // for different web browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}



function resetHighlight(e) {
    neighborhoodsLayer.resetStyle(e.target);
}


function zoomFeature(e){
    console.log(e.target.getBounds());
    map.fitBounds(e.target.getBounds().pad(1.5));
}


var legend = L.control({position: 'bottomright'});


legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');		    
    div.innerHTML += '<b style = "text-align: center">Incidence of Elevated</b><br />';
    div.innerHTML += '<b style = "text-align: center">Blood Lead in Children</b><br />';
    div.innerHTML += '<p style = "text-align: center">by census tract</p>';
    div.innerHTML += '<br>';
    div.innerHTML += '<i style="background: #7a0177"></i><p>40+</p>';
    div.innerHTML += '<i style="background: #c51b8a"></i><p>20-39</p>';
    div.innerHTML += '<i style="background: #f768a1"></i><p>10-19</p>';
    div.innerHTML += '<i style="background: #fbb4b9"></i><p>0-9</p>';
    div.innerHTML += '<hr>';
    div.innerHTML += '<i style="background: #BFBCBB"></i><p>No Data</p>';

    return div;
};

legend.addTo(map);

L.control.scale({position: 'bottomleft'}).addTo(map);
