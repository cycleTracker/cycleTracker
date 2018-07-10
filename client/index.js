const mapboxgl = require('mapbox-gl');
const d3 = require('d3');

/*
  * Instantiate the Map
  */

mapboxgl.accessToken =
	'pk.eyJ1IjoiZnVsbHN0YWNram9uIiwiYSI6ImNqZ3M1OTcwcjAwMHMzNGxubXlxbHFxaHoifQ.LYHfQzOU5Hb3GF2JkOJYZQ';

const nycCoords = [-73.951, 40.7385]; // NY

//Setup mapbox-gl map
var map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/mapbox/streets-v10',
	center: nycCoords,
	zoom: 11.5,
	interactive: false,
	pitch: 0
});
map.scrollZoom.disable();

const state = {
	gender: false,
	simulationSpeed: 1,
	mostPopularBike: '25697',
	mostPopularBikeToggle: false,
	age: false
};

//gender 1 === male
// gender 2 === female
// gender 0 === unknown

function setColor(d) {
	if (state.gender) {
		if (d.gender === '1') {
			return {
				fill: '#cc0000',
				stroke: '#ad0000'
			};
		} else if (d.gender === '2') {
			return {
				fill: '#0479a0',
				stroke: '#035e7c'
			};
		} else {
			return {
				fill: 'black',
				stroke: 'black'
			};
		}
	} else if (state.age) {
		if (d.birthYear <= 24) {
			return {
				fill: 'orange',
				stroke: 'orange'
			};
		} else if (d.birthYear >= 25 && d.birthYear <= 39) {
			return {
				fill: 'green',
				stroke: 'green'
			};
		} else if (d.birthYear >= 40 && d.birthYear <= 54) {
			return {
				fill: 'purple',
				stroke: 'purple'
			};
		} else if (d.birthYear >= 55) {
			return {
				fill: '#ef1f3f',
				stroke: '#ef1f3f'
			};
		} else {
			return {
				fill: 'black',
				stroke: 'black'
			};
		}
	}
	return {
		fill: '#D8c320',
		stroke: '#b7a51b'
	};
}

function filterNodes(node, startTime, previousTime) {
	if (
		node.starttime <= startTime % 86400 &&
		node.starttime >= previousTime % 86400
	) {
		if (state.mostPopularBikeToggle) {
			return node.bikeid === state.mostPopularBike;
		} else {
			return true;
		}
	}
	return false;
}

const genderToggle = d3.select('#gender');
genderToggle.on('click', () => {
	state.gender = true;
	state.age = false;
	state.mostPopularBikeToggle = false;
});

const popularToggle = d3.select('#popular');
popularToggle.on('click', () => {
	state.mostPopularBikeToggle = true;
	state.gender = false;
	state.age = false;
});

const ageToggle = d3.select('#age');
ageToggle.on('click', () => {
	state.age = true;
	state.mostPopularBikeToggle = false;
	state.gender = false;
});

const allButton = d3.select('#all');
allButton.on('click', () => {
	state.age = false;
	state.mostPopularBike = false;
	state.gender = false;
});

const slider = d3.select('#slider');
slider.on('change', () => {
	if (d3.event.target.value === '2') {
		state.simulationSpeed = 1;
	} else if (d3.event.target.value === '1') {
		state.simulationSpeed = 0.25;
	} else if (d3.event.target.value === '3') {
		state.simulationSpeed = 2;
	}
});

const clock = d3.select('#clock');

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

d3.csv('https://s3.us-east-2.amazonaws.com/replicode/Citibike_Data.csv').then(
	function(data) {
		let dots;
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
				startTime += 225;
				clock.text(new Date(startTime * 1000).toISOString().substr(11, 8));
				if (startTime === 86400) {
					clearInterval(stopInterval);
					stopRender();
				}

				dots = svg
					.selectAll('circle.dot')
					.filter(function(d) {
						return filterNodes(d, startTime, previousTime);
					})
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
					.attr('r', () => {
						return state.mostPopularBikeToggle ? 6 : 3;
					})
					.style('fill', function(d) {
						return setColor(d).fill;
					})

					.style('stroke', function(d) {
						return setColor(d).stroke;
					})
					.style('stroke-width', 2)
					.style('fill-opacity', () => {
						return state.mostPopularBikeToggle ? 0.7 : 0.4;
					})
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
				let currentYear = new Date();
				currentYear = currentYear.getFullYear();
				node.birthYear = currentYear - Number(node.birthYear);
			});
			const frequencyObj = {};
			copiedData.forEach(node => {
				frequencyObj[node.bikeid] = frequencyObj[node.bikeid] + 1 || 1;
			});
			stopRender();
			dots = svg.selectAll('circle.dot').data(copiedData);
			dots
				.enter()
				.append('circle')
				.classed('dot', true);
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
			clock.text('00:00:00');
		}
	}
);

function getMostPopularBike(frequencyObj) {
	let freqArr = Object.entries(frequencyObj);
	freqArr = freqArr.sort((a, b) => {
		return b[1] - a[1];
	});
	return freqArr[0];
}
