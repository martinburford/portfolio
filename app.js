// Default Express dependencies
var express = require('express'); 
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

// Data retrieval dependencies
var getPageData = require('./dev/modules/getPageData');
var extend = require('extend');

// Define all page routes
var homepage = require('./dev/routes/homepage');
var cv = require('./dev/routes/cv');
var portfolio = require('./dev/routes/portfolio');
var gallery = require('./dev/routes/gallery');
var videos = require('./dev/routes/videos');

// Setup Express configuration
var app = express();

// View engine (templates) configuration
app.set('views', path.join(__dirname, 'dev', 'views'));
app.set('view engine', 'pug');
app.set('versionSuffix', '?v=' + JSON.parse(fs.readFileSync('./package.json')).version);

// Ensure that pretty indentation persists for the rendered markup (on the client)
app.locals.pretty = true;

// Uncomment after placing favicon.ico within /public
app.use(favicon(path.join(__dirname, 'web', 'content', 'favicon.ico')));
app.use(favicon(path.join(__dirname, 'web', 'content', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Static paths for CSS, images, JavaScript
app.use('/assets', express.static(path.join(__dirname, 'web', 'content', 'assets')));
app.use('/cv/martin-burford-cv.docx', express.static(path.join(__dirname, 'web','content', 'cv', 'martin-burford-cv.docx')));
app.use('/data', express.static(path.join(__dirname, 'dev', 'data')));
app.use('/_prototyping', express.static(path.join(__dirname, 'web', 'content', '_prototyping')));

// Setup routes to be used, based on URL construct
app.get('/', homepage);
app.get('/cv', cv);
app.get('/portfolio', portfolio);
app.get('/portfolio/gallery/:clientName/:projectName', gallery);
app.get('/portfolio/videos', videos);

// Catch 404 error and forward to an appropriate error handler
app.use(function(request, response, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Error handler
app.use(function(err, request, response, next) {
	var pageData = getPageData.retrieveData('error');
	extend(pageData, getPageData.retrieveData('global'));

	// Pass the current site version, to append to all .css and .js files
	pageData.versionSuffix = request.app.get('versionSuffix');
	pageData.errorData = err;

	// Render the error page
	response.status(err.status || 500);
	response.render('error', pageData);
});

module.exports = app;