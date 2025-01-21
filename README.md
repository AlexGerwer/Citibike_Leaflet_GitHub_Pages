# Citi Bike Visualization

This repository contains a visualization of Citi Bike station data using Leaflet.js and D3.js.  The visualization displays markers for each bike station on a map, color-coded by their current status (e.g., available bikes, low on bikes, out of order). A summary box also provides an overview of the total number of stations and the count for each status category.

## Files

The repository includes the following files:

- **README.md:** This file.
- **index.html:** The main HTML file that sets up the map and loads the necessary JavaScript and CSS files.
- **static/css/style.css:** The CSS file for styling the map and summary box.
- **static/js/logic.js:** The JavaScript file containing the core logic for fetching data, creating markers, and managing the map.
- **logic_js_Explanation.pdf:** A detailed explanation of the code within the `logic.js` file.
- **logic_js_output:** The output generated when the `logic.js` file is executed. This likely demonstrates the fetched data and other computations performed within the script.

## How to Run

1. Clone this repository to your local machine.
2. Open the `index.html` file in your web browser.

The map should load, displaying the Citi Bike station markers and the summary box.  You can interact 
with the map by zooming and panning, and you can toggle the visibility of different station status categories using the layer control.

You can also see the webpage output of running the repository at https://AlexGerwer.github.io/Citibike_Leaflet_GitHub_Pages/

## Data Source

The visualization fetches data from the Citi Bike API, specifically using the following endpoints:

- Station Information: `https://gbfs.citibikenyc.com/gbfs/en/station_information.json`
- Station Status: `https://gbfs.citibikenyc.com/gbfs/en/station_status.json`

## Libraries Used

- **Leaflet.js:**  A JavaScript library for interactive maps.
- **D3.js:** A JavaScript library for manipulating the document based on data.

## Additional Notes

The `logic_js_Explanation.pdf` file is crucial for understanding the implementation details within the `logic.js` file.  
The `logic_js_output` file provides insights into the data processing and calculations performed by the script.
