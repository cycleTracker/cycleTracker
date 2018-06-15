const mapboxgl = require('mapbox-gl');
const d3 = require('d3');

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

const centralParkCoords = [-73.9654, 40.7829]; // NY

//Setup mapbox-gl map
var map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/mapbox/streets-v10',
	center: [-73.9654, 40.7829],
	zoom: 11
});
map.scrollZoom.disable();
map.addControl(new mapboxgl.NavigationControl());

// Setup our svg layer that we can manipulate with d3
var container = map.getCanvasContainer();
var svg = d3.select(container).append('svg');

function project(d, cb) {
	return map.project(cb(d));
}
function getStartLL(d) {
	return new mapboxgl.LngLat(+d.startStationLongitude, +d.startStationLatitude);
}

function getEndLL(d) {
	return new mapboxgl.LngLat(+d.endStationLongitude, +d.endStationLatitude);
}

d3.csv('dataSet.csv').then(function(data) {
	//console.log(data[0], getLL(data[0]), project(data[0]))
	var dots = svg.selectAll('circle.dot').data(data);
	dots
		.enter()
		.append('circle')
		.classed('dot', true)
		.attr('r', 1)
		.style({
			fill: '#0082a3',
			'fill-opacity': 0.6,
			stroke: '#004d60',
			'stroke-width': 1
		})
		.transition()
		.duration(1000)
		.attr('r', 6);

	function render() {
		// dots.attr({
		// 	cx: function(d) {
		// 		var x = project(d, getStartLL).x;
		// 		return x;
		// 	},
		// 	cy: function(d) {
		// 		var y = project(d, getStartLL).y;
		// 		return y;
		// 	}
		// });
		// dots
		// 	.transition()
		// 	.attr({
		// 		cx: function(d) {
		// 			var x = project(d, getEndLL).x;
		// 			return x;
		// 		},
		// 		cy: function(d) {
		// 			var y = project(d, getEndLL).y;
		// 			return y;
		// 		}
		// 	})
		// .style({
		// 	fill: 'red',
		// 	'fill-opacity': 0.6,
		// 	stroke: 'red',
		// 	'stroke-width': 1
		// })
		// .delay(1000)
		// .duration(4000);
	}

	// d3.select('#buttonIdForExmple').on("click", () => {

	// })

	// re-render our visualization whenever the view changes
	map.on('viewreset', function() {
		render();
	});
	map.on('move', function() {
		render();
	});

	// render our initial visualization
	render();
});

// Create the marker
const marker = buildMarker(null, centralParkCoords);

//ADD TO DOM
marker.addTo(map);

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
