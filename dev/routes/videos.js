var express = require('express');
var router = express.Router();
var extend = require('extend');

// Data retrieval dependencies
var getPageData = require('./../modules/getPageData');

// Locate the JSON data for the requested page
var pageData = getPageData.retrieveData('videos');
extend(pageData, getPageData.retrieveData('global'));

// GET videos
router.get('/portfolio/videos', function(request, response, next) {
	// Pass the current site version, to append to all .css and .js files
	pageData.versionSuffix = request.app.get('versionSuffix');

	response.render('videos', pageData);
});

module.exports = router;