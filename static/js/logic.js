// let newYorkCoords = [40.73, -74.0059];
// let mapZoomLevel = 12;

// Create the createMap function to initialize the map.
function createMap() {

    // Create the tile layer that will be the background of our map.
    let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object to hold the base map layer.
    let baseMaps = {
        "Street Map": streets  // The "Street Map" key will appear in the layer control.
    };

    // Create an overlayMaps object to hold the bike station layers.
    let overlayMaps = {};

    // Create the map object with options.
    let map = L.map("map-id", {
        center: [40.73, -74.0059],
        zoom: 12,
    });

    // Add the 'streets' tile layer to the map initially.
    streets.addTo(map);

    // Create a layer control, and pass it baseMaps and overlayMaps.
    let layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

    // Perform API calls to the Citi Bike API to get station information and status.
    Promise.all([
        d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_information.json"),
        d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_status.json")
    ]).then(function ([infoResponse, statusResponse]) {
        // Call createMarkers with the fetched data and other necessary objects.
        const stationData = createMarkers(infoResponse.data.stations, statusResponse.data.stations, layerControl, overlayMaps, map);
        // Create the summary box after the markers have been created.
        createSummaryBox(map, stationData);
    }).catch(function (error) {
        // Handle any errors that occur during the API calls.
        console.error("Error fetching data:", error);
    });
}

// Create the createMarkers function to create markers for each bike station.
function createMarkers(stations, stationStatus, layerControl, overlayMaps, map) {

    let stationGroups = {
        "Coming Soon": [],
        "Empty Stations": [],
        "Out of Order": [],
        "Low Stations": [],
        "Healthy Stations": []
    };

    let stationData = {
        totalStations: 0,
        comingSoon: 0,
        emptyStations: 0,
        outOfOrder: 0,
        lowStations: 0,
        healthyStations: 0,
    };

    // Define colors for the legend and menu.
    const colorMapping = {
        "Coming Soon": "#FFEB3B", // Yellow
        "Empty Stations": "#F44336", // Red
        "Out of Order": "#FF9800", // Orange
        "Low Stations": "#4CAF50", // Green
        "Healthy Stations": "#2196F3" // Blue
    };

    // Loop through all the station data retrieved from the API.
    stations.forEach(station => {
        let status = stationStatus.find(s => s.station_id === station.station_id);

        if (!status) {
            console.warn(`Status not found for station ${station.station_id}`);
            return; // Skip to the next station if status is not found.
        }

        let groupKey;
        if (!status.is_installed) {
            groupKey = "Coming Soon";
        } else if (status.num_bikes_available === 0) {
            groupKey = "Empty Stations";
        } else if (!status.is_renting) {
            groupKey = "Out of Order";
        } else if (status.num_bikes_available < 5) {
            groupKey = "Low Stations";
        } else {
            groupKey = "Healthy Stations";
        }

        // Create a marker for the station with the appropriate icon.
        let marker = L.marker([station.lat, station.lon], { icon: getIcon(groupKey) })
            .bindPopup(`<h3>${station.name}</h3><hr>Capacity: ${station.capacity}<br>Available Bikes: ${status.num_bikes_available}`);

        stationGroups[groupKey].push(marker);

        stationData.totalStations++;
        if (groupKey === "Coming Soon") stationData.comingSoon++;
        else if (groupKey === "Empty Stations") stationData.emptyStations++;
        else if (groupKey === "Out of Order") stationData.outOfOrder++;
        else if (groupKey === "Low Stations") stationData.lowStations++;
        else if (groupKey === "Healthy Stations") stationData.healthyStations++;
    });

    // Add the layer groups to the overlayMaps object and the layer control.
    for (let key in stationGroups) {
        overlayMaps[key] = L.layerGroup(stationGroups[key]);
        layerControl.addOverlay(overlayMaps[key], `<span style="color:${colorMapping[key]}">${key}</span>`);
        overlayMaps[key].addTo(map);
    }

    return stationData;
}

function getIcon(group) {
    const iconUrlMapping = {
        "Coming Soon": "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
        "Empty Stations": "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        "Out of Order": "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
        "Low Stations": "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        "Healthy Stations": "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
    };

    let iconUrl = iconUrlMapping[group] || "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png";

    return L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });
}

// Function to create and add the summary box to the map.
function createSummaryBox(map, stationData) {
    let summaryBox = L.control({ position: "bottomright" });

    summaryBox.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        div.style.backgroundColor = "white";
        div.style.border = "1px solid black";
        div.style.padding = "10px";

        let formattedDate = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

        div.innerHTML = `<h3>Summary</h3>`;
        div.innerHTML += `<p>Updated: ${formattedDate}</p>`;

        // Define colors for the legend dots
        const colorMapping = {
            "Coming Soon": "#FFEB3B", // Yellow
            "Empty Stations": "#F44336", // Red
            "Out of Order": "#FF9800", // Orange
            "Low Stations": "#4CAF50", // Green
            "Healthy Stations": "#2196F3" // Blue
        };

        // Use large colored dots for each station type in the legend
        div.innerHTML += `<p><span style="width: 20px; height: 20px; background-color:${colorMapping["Coming Soon"]}; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> Coming Soon: ${stationData.comingSoon}</p>`;
        div.innerHTML += `<p><span style="width: 20px; height: 20px; background-color:${colorMapping["Empty Stations"]}; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> Empty Stations: ${stationData.emptyStations}</p>`;
        div.innerHTML += `<p><span style="width: 20px; height: 20px; background-color:${colorMapping["Out of Order"]}; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> Out of Order: ${stationData.outOfOrder}</p>`;
        div.innerHTML += `<p><span style="width: 20px; height: 20px; background-color:${colorMapping["Low Stations"]}; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> Low Stations: ${stationData.lowStations}</p>`;
        div.innerHTML += `<p><span style="width: 20px; height: 20px; background-color:${colorMapping["Healthy Stations"]}; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> Healthy Stations: ${stationData.healthyStations}</p>`;

        return div;
    };

    summaryBox.addTo(map);
}

// Call the createMap function to start the map initialization process.
createMap();

