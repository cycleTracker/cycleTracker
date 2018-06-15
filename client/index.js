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

const nycCoords = [-73.9911, 40.7359]; // NY

//Setup mapbox-gl map
var map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/mapbox/streets-v10',
	center: nycCoords,
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

	function render() {
		dots
			.enter()
			.append('circle')
			.classed('dot', true)
			.attr('cx', d => {
				console.log('d', d);
				var x = project(d, getStartLL).x;
				return x;
			})
			.attr('cy', d => {
				var y = project(d, getStartLL).y;
				return y;
			})
			.attr('r', 0.5)
			.style('fill', '#00a34c')
			.style('fill-opacity', 0.6)
			.style('stroke', '#007c3a')
			.style('stroke-width', 1)
			.transition()
			.duration(1000)
			.attr('r', 4)
			.transition()
			.delay(2000)
			.style('fill', '#fc2f00')
			.style('stroke', '#c12300')
			.style('fill-opacity', 0.6)
			.duration(1000)
			.attr('cx', d => {
				console.log('d', d);
				var x = project(d, getEndLL).x;
				return x;
			})
			.attr('cy', d => {
				var y = project(d, getEndLL).y;
				return y;
			});

		// dots
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
