const express = require('express');
const volleyball = require('volleyball');
const path = require('path');

const app = express();

// logging and body-parsing
app.use(volleyball);

// static file-serving middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

// failed to catch req above means 404, forward to error handler
app.use(function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// handle any errors
app.use(function(err, req, res, next) {
	res.status(err.status || 500).send(err.message);
});

// listen on a port
const port = 3000;
app.listen(port, function() {
	console.log('The server is listening closely on port', port);
});
