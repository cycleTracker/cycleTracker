const { Marker } = require('mapbox-gl');

const buildMarker = (type, coords) => {
	const markerEl = document.createElement('div');
	markerEl.style.backgroundSize = 'contain';
	markerEl.style.width = '32px';
	markerEl.style.height = '32px';
	// markerEl.style.markerColor = 'red';
	markerEl.style.backgroundImage = `url(http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/map-marker-icon.png)`;
	return new Marker(markerEl).setLngLat(coords);
};

module.exports = buildMarker;
