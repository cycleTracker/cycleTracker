const mapboxgl = require('mapbox-gl');
// const api = require('./api');
const buildMarker = require('./marker.js');

/*
 * App State
 */

/*
  * Instantiate the Map
  */

mapboxgl.accessToken =
	'pk.eyJ1IjoiZnVsbHN0YWNram9uIiwiYSI6ImNqZ3M1OTcwcjAwMHMzNGxubXlxbHFxaHoifQ.LYHfQzOU5Hb3GF2JkOJYZQ';

const fullstackCoords = [-73.9654, 40.7829]; // NY

const map = new mapboxgl.Map({
	container: 'map',
	center: fullstackCoords,
	zoom: 11, // starting zoom
	style: 'mapbox://styles/mapbox/streets-v10' // mapbox has lots of different map styles available.
});

// Create the marker
// const marker = buildMarker(category, attraction.place.location);

//ADD TO DOM
// marker.addTo(map);

// Animate the map
// map.flyTo({ center: attraction.place.location, zoom: 15 });

// Remove the current attrction from the application state
// state.selectedAttractions = state.selectedAttractions.filter(
// 	selected => selected.id !== attraction.id || selected.category !== category
// );

// Remove attraction's elements from the dom & Map
// itineraryItem.remove();
// marker.remove();

// console.log(state);

// Animate map to default position & zoom.
// map.flyTo({ center: fullstackCoords, zoom: 12.3 });
