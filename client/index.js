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

const filterState = {
	gender: false
};

//gender 1 === male
// gender 2 === female
// gender 0 === unknown

function setColor(d) {
	if (filterState.gender) {
		if (d.gender === '1') {
			return {
				fill: '#5c0c68',
				stroke: '#45094f'
			};
		} else if (d.gender === '2') {
			return {
				fill: '#4ab0c9',
				stroke: '#3e93a8'
			};
		} else {
			return {
				fill: '#757471',
				stroke: '#565554'
			};
		}
	}
	return {
		fill: '#D8c320',
		stroke: '#b7a51b'
	};
}

const genderToggle = d3.select('#gender');
console.log('gendertoggle1', genderToggle);
genderToggle.on('click', () => {
	filterState.gender = !filterState.gender;
});

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
	let startTime = 0;
	let simStart = false;
	let copiedData;

	const startButton = d3.select('#start-button');
	startButton.on('click', function(data) {
		if (!simStart) {
			render();
		}
		simStart = true;
	});

	const pauseButton = d3.select('#pause-button');
	pauseButton.on('click', function(data) {
		pauseRender();
	});

	const stopButton = d3.select('#stop-button');
	stopButton.on('click', function(data) {
		stopRender();
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
				.data(copiedData)
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
				.attr('t', function(d) {
					//lifecycle for each node
					// radius of start position change = 250ms
					// delay before trip duration for 250ms
					// trip duration = (d.tripduration * 10)ms
					// node disapearing = 250ms
					//total lifecycle = 750 + trip duration
					return 750 + d.tripduration * 10;
				})
				.attr('cx', function(d) {
					var x = project(d, getStartLL).x;
					return x;
				})
				.attr('cy', d => {
					var y = project(d, getStartLL).y;

					return y;
				})
				.style('fill', '#007c3a')
				.style('fill-opacity', 0.6)
				.style('stroke', '#00632e')
				.style('stroke-width', 2)
				.attr('r', 7)
				.transition()
				.duration(250)
				.attr('r', 4)
				.transition()
				.delay(250)
				//ttest
				.style('fill', function(d) {
					return setColor(d).fill;
				})

				.style('stroke', function(d) {
					return setColor(d).stroke;
				})
				.style('fill-opacity', 0.7)
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
				.style('fill', '#cc0000')
				.style('stroke', '#ad0000')
				.style('fill-opacity', 0.6)

				.transition()
				.duration(250)
				.attr('r', 10)
				.style('fill-opacity', 0)
				.style('stroke-width', 0);
		}, 1000);
	};

	function render() {
		copiedData = data.map(row => {
			return Object.assign({}, row);
		});
		stopRender();
		let dots = svg.selectAll('circle.dot').data(copiedData);
		dots
			.enter()
			.append('circle')
			.classed('dot', true)

			.each(d => {
				d.starttime = timeDataCleanUp(d.starttime);
				d.stoptime = timeDataCleanUp(d.stoptime);
			});
		//calls set interval to populate dom based on time bikes/nodes are riding.
		interval();
	}
	function pauseRender() {
		const currentNodes = svg.selectAll('circle.dot');
		currentNodes.transition().duration(0);
		clearInterval(stopInterval);
	}

	function stopRender() {
		//do stuff to resume render
		const currentNodes = svg.selectAll('circle.dot');
		currentNodes.remove();
		clearInterval(stopInterval);
		startTime = 0;
		simStart = false;
		// currentNodes.trans
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
