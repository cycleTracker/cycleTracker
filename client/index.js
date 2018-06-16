const mapboxgl = require('mapbox-gl');
const d3 = require('d3');

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
	zoom: 11,
	interactive: false
});
map.scrollZoom.disable();

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

function timeDataCleanUp(time) {
	const timeArray = time.split(' ')[1].split(':');
	const hour = Number(timeArray[0] * 3600);
	const minutes = Number(timeArray[1] * 60);
	const seconds = Number(timeArray[2]);
	const timeTotalSeconds = hour + minutes + seconds;
	return timeTotalSeconds;
}

d3.csv('dataSet.csv').then(function(data) {
	//console.log(data[0], getLL(data[0]), project(data[0]))
	var dots = svg.selectAll('circle.dot').data(data);

	dots
		.enter()
		.append('circle')
		.classed('dot', true)

		.each(d => {
			d.starttime = timeDataCleanUp(d.starttime);
			d.stoptime = timeDataCleanUp(d.stoptime);
		});

	let startTime = 0;
	let simStart = false;
	const startButton = d3.select('#start-button');
	startButton.on('click', function(data) {
		// simStart
		// 	? d3.select(this).text('Start Simulation')
		// 	: d3.select(this).text('Pause Simulation');
		if (!simStart) {
			render();
		}
		simStart = true;
	});

	const pauseButton = d3.select('#pause-button');
	pauseButton.on('click', function(data) {
		pauseRender();
	});
	let stopInterval;
	const interval = () => {
		stopInterval = setInterval(function() {
			let previousTime;
			previousTime = startTime;
			startTime += 900;
			console.log('start time', startTime);
			dots = svg
				.selectAll('circle.dot')
				.data(data)

				// .exit()
				// .enter()
				// .append('circle')
				// .classed('dot', true)
				.filter(function(d) {
					return (
						d.starttime <= startTime % 86400 &&
						d.starttime >= previousTime % 86400
					);
				})
				.attr('cx', function(d) {
					var x = project(d, getStartLL).x;
					return x;
				})
				.attr('cy', d => {
					var y = project(d, getStartLL).y;

					return y;
				})
				.style('fill', '#00a34c')
				.style('fill-opacity', 0.4)
				.style('stroke', '#007c3a')
				.style('stroke-width', 1)
				.attr('r', 7)
				.transition()
				.duration(250)
				.attr('r', 4)
				.transition()
				.delay(250)
				.style('fill', '#DDB800')
				.style('stroke', '#D1AE00')
				.style('fill-opacity', 0.6)
				.transition()
				.attr('cx', d => {
					var x = project(d, getEndLL).x;
					return x;
				})
				.attr('cy', d => {
					var y = project(d, getEndLL).y;
					return y;
				})
				.duration(function(d) {
					//this would be the correct ratio for 900 seconds per real time second;
					// return d.tripduration / 900;
					return d.tripduration * 10;
				})
				.transition()
				.duration(0)
				.style('fill', '#fc2f00')
				.style('stroke', '#c12300')
				.style('fill-opacity', 0.4)

				.transition()
				.duration(250)
				.attr('r', 10)
				.style('fill-opacity', 0)
				.style('stroke-width', 0);
		}, 250);
	};

	function render() {
		//calls set interval to populate dom based on time bikes/nodes are riding.
		interval();
	}
	function pauseRender() {
		const currentNodes = svg.selectAll('circle.dot');
		currentNodes.transition().duration(0);
		clearInterval(stopInterval);
	}
	// re-render our visualization whenever the view changes
	// map.on('viewreset', function() {
	// 	render();
	// });
	// map.on('move', function() {
	// 	render();
	// });

	// render our initial visualization
	// render();
});
