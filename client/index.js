const mapboxgl = require('mapbox-gl');
const d3 = require('d3');

/*
  * Instantiate the Map
  */

//  MOST POPULAR BIKEID ["25697", 34]

mapboxgl.accessToken =
	'pk.eyJ1IjoiZnVsbHN0YWNram9uIiwiYSI6ImNqZ3M1OTcwcjAwMHMzNGxubXlxbHFxaHoifQ.LYHfQzOU5Hb3GF2JkOJYZQ';

const nycCoords = [-73.9911, 40.7359]; // NY

//Setup mapbox-gl map
var map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/mapbox/streets-v10',
	center: nycCoords,
	zoom: 11.5,
	interactive: false
});
map.scrollZoom.disable();

const state = {
	gender: false,
	simulationSpeed: 1,
	mostPopularBike: '25697',
	mostPopularBikeToggle: false
};

//gender 1 === male
// gender 2 === female
// gender 0 === unknown

function setColor(d) {
	if (state.gender) {
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
genderToggle.on('click', () => {
	state.gender = !state.gender;
});

const popularToggle = d3.select('#popular');
popularToggle.on('click', () => {
	state.mostPopularBikeToggle = !state.mostPopularBikeToggle;
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

d3.csv('citiBike_Data.csv').then(function(data) {
	let startTime = 0;
	let simStart = false;
	let copiedData;
	console.log('data', data[0]);

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
			// startTime += 900;
			startTime += 225;
			if (startTime === 86400) {
				clearInterval(stopInterval);
				stopRender();
			}
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
						// &&
						// d.bikeid === state.mostPopularBike
					);
				})
				// .attr('t', function(d) {
				// 	//lifecycle for each node
				// 	// radius of start position change = 250ms
				// 	// delay before trip duration for 250ms
				// 	// trip duration = (d.tripduration * 10)ms
				// 	// node disapearing = 250ms
				// 	//total lifecycle = 750 + trip duration
				// 	return 750 + d.tripduration * 10;
				// })
				.attr('cx', function(d) {
					var x = project(d, getStartLL).x;
					return x;
				})
				.attr('cy', d => {
					var y = project(d, getStartLL).y;

					return y;
				})
				// .style('fill', '#007c3a')
				// .style('fill-opacity', 0.4)
				// .style('stroke', '#00632e')
				// .style('stroke-width', 2)
				// .attr('r', 6)
				// .transition()
				// .duration(250 / state.simulationSpeed)
				.attr('r', 3)
				.style('fill', function(d) {
					return setColor(d).fill;
				})

				.style('stroke', function(d) {
					return setColor(d).stroke;
				})
				.style('stroke-width', 2)
				.style('fill-opacity', 0.4)
				.transition()
				.delay(250 / state.simulationSpeed)
				//ttest
				// .transition()
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
					// return d.tripduration / 900 / state.simulationSpeed;
					return d.tripduration / 4 / state.simulationSpeed;
				})
				// .transition()
				// .duration(0)
				// .style('fill', '#cc0000')
				// .style('stroke', '#ad0000')
				// .style('fill-opacity', 0.4)
				// .transition()
				// .duration(100 / state.simulationSpeed)
				// .attr('r', 9)
				// .style('fill-opacity', 0)
				// .style('stroke-width', 0)
				.remove();
		}, 250 / state.simulationSpeed);
	};

	function render() {
		copiedData = data.map(row => {
			return Object.assign({}, row);
		});

		copiedData.forEach(node => {
			node.starttime = timeDataCleanUp(node.starttime);
			node.stoptime = timeDataCleanUp(node.stoptime);
		});
		const frequencyObj = {};
		copiedData.forEach(node => {
			frequencyObj[node.bikeid] = frequencyObj[node.bikeid] + 1 || 1;
		});
		console.log('freqobj', getMostPopularBike(frequencyObj));

		stopRender();
		let dots = svg.selectAll('circle.dot').data(copiedData);
		dots
			.enter()
			.append('circle')
			.classed('dot', true);
		// 	.each(d => {
		// 		d.starttime = timeDataCleanUp(d.starttime);
		// 		d.stoptime = timeDataCleanUp(d.stoptime);
		// 	});
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

function getMostPopularBike(frequencyObj) {
	let freqArr = Object.entries(frequencyObj);
	freqArr = freqArr.sort((a, b) => {
		return b[1] - a[1];
	});
	return freqArr[0];
}
