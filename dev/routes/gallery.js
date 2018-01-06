var express = require('express');
var router = express.Router();
var extend = require('extend');

// Data retrieval dependencies
var getPageData = require('./../modules/getPageData');

// GET homepage
router.get('/portfolio/gallery/:clientName/:projectName', function(request, response, next) {
	// Pull in all global data, which all pages can (and in most cases do) reference
	var pageData = getPageData.retrieveData('global');

	console.log('Client name: ' + request.params.clientName);
	console.log('Project name: ' + request.params.projectName);	

	console.log('****************BEFORE (clientname): ', request.params.clientName);
	console.log('****************BEFORE (projectname): ', request.params.projectName);

	// Locate the JSON data for the requested gallery page
	extend(pageData, getPageData.retrieveData('galleries', {
		clientName: request.params.clientName,
		projectName: request.params.projectName
	}));

	// Pass the current site version, to append to all .css and .js files
	pageData.versionSuffix = request.app.get('versionSuffix');

	response.render('gallery', pageData);	
});

module.exports = router;