'use strict';

var extend = require('extend');
var fse = require('fs-extra');
var grunt = require('grunt');
var inquirer = require('inquirer');

module.exports = function(grunt){
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-pug');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	var configuration = {
		environment: 'development',
		package: grunt.file.readJSON('package.json')
	};

	// TASK CONFIGURATIONS
	// ****

	// Browserify configuration (including ES6 - ES5 transpiling)
	grunt.config('browserify', {
		jsFiles: {
			src: ['dev/assets/scripts/*.js'],
			dest: 'web/content/assets/scripts/app.min.js',
			options: {
				transform: [
					[
						"babelify", {
							"presets": ["es2015"]
						}
					]
				],
				plugin: [
					[
						"minifyify", { map: false }
					]
				]
			}
		}
	});

	// Bumpup configuration
	grunt.config('bumpup', {
		options: {
			dateformat: 'YYYY-MM-DD',
			updateProps: {
				pkg: 'package.json'
			}
		},
		file: 'package.json'
	});

	// Clean configuration
	grunt.config('clean', {
		'build': [
			'web/content/assets/scripts/app.min.js',
			'web/content/cv/index.html',
			'web/content/error/',
			'web/content/portfolio/',
			'web/content/index.html'
		]
	});

	// Sass configuration
	grunt.config('sass', {
		files: {
			options: {
				style: 'expanded', // compressed || expanded
				sourcemap: 'none'
			},
			files: [{
				expand: true,
				cwd: 'dev/assets/scss',
				src: [
					'*.scss'
				],
				dest: 'web/content/assets/css',
				ext: '.min.css'
			}]
		}
	});

	// Watch configuration
	grunt.config('watch', {
		jsFiles: {
			files: [
				'dev/assets/scripts/*.js'
			],
			tasks: [
				'browserify:jsFiles'
			]
		},
		sassFiles: {
			files: [
				'dev/assets/scss/**/*.scss',
				'!dev/assets/scss/print.scss'
			],
			tasks: [
				'sassFiles:production'
			]
		}
	});

	// TASKS REGISTRATION
	// ****

	// Default task to run
	grunt.registerTask('default','Perform all automated site tasks', function(){
		var done = this.async();
		var questions = {
			type: 'list',
			name: 'taskType',
			message: 'Which task do you want to run?',
			choices: [
				'clean',
				'generateSite',
				'generateSite:production',
				'pugGalleries',
				'pugNonGallery',
				'sassFiles',
				'sassFiles:production',
				'watch'
			]
		};

		var releaseTypeQuestions = {
			type: 'list',
			name: 'releaseType',
			message: 'Which release type is this?',
			choices: [
				'patch',
				'minor',
				'major'
			]
		};

		inquirer.prompt(questions).then(function(answers){
			if(answers.taskType === 'generateSite:production'){
				inquirer.prompt(releaseTypeQuestions).then(function(releaseTypeAnswers){
					done();

					grunt.task.run('wait:bumpup:' + releaseTypeAnswers.releaseType);
					grunt.task.run('wait:retrievePackageData');
					grunt.task.run(answers.taskType);
				});
			} else {
				done();

				grunt.task.run(answers.taskType);
			}		
		});
	});

	// Generate all templated files
	grunt.registerTask('generateSite', 'Perform all tasks to build a complete site', function(environment){
		// Store a reference to whether a 'development' or 'production' build is taking place
		configuration.environment = environment || 'development';

		grunt.task.run('clean'),
		grunt.task.run('browserify'),
		grunt.task.run('sassFiles')
		grunt.task.run('pugNonGallery'),
		grunt.task.run('pugGalleries')
	});	

	// Generate all pages other than gallery pages
	grunt.registerTask('pugNonGallery','Generate all non-gallery pages from templates', function(){
		var pages = [{
			"id": "cv",
			"folder": "cv",
			"file": "index.html"
		},{
			"id": "error",
			"folder": "error",
			"file": "index.html"
		},{
			"id": "homepage",
			"folder": "",
			"file": "index.html"
		},{
			"id": "portfolio",
			"folder": "portfolio",
			"file": "index.html"
		},{
			"id": "videos",
			"folder": "portfolio/videos",
			"file": "index.html"
		}];
		var pageUrlObj;
		var destinationFile;
		var pageData;

		for(var i=0; i<=pages.length-1; i++){			
			pageUrlObj = pages[i];

			destinationFile = {};
			destinationFile['web/content/' + pageUrlObj.folder + '/' + pageUrlObj.file] = './dev/views/' + pageUrlObj.id + '.pug';

			// Since some content needs to be dynamically accessed, process this loop as async, pausing execution temporarily, whilst file system access is allowed to complete
			var done = this.async();

			// Retrieve all data blocks required for the page/template currently being processed
			pageData = retrieveTemplateData('./dev/data/global.json', './dev/data/' + pageUrlObj.id + '.json');

			done();

			// Each page requires unique configuration
			setPugTaskConfiguration('pug.' + pageUrlObj.id, pageData, destinationFile);

			grunt.task.run('pug:' + pageUrlObj.id);
		}	
	});

	// Generate all gallery pages
	grunt.registerTask('pugGalleries','Generate all gallery pages from templates', function(){
		var contracts = fse.readdirSync('dev/data/galleries');
		var contractName;
		var projects;
		var projectName;
		var destinationFile;
		var pageData;		
		
		// Loop through all folders within the /dev/data/galleries directory, as this represents each unique contract (and project)
		for(var i=0; i<=contracts.length-1; i++){
			if(fse.lstatSync('dev/data/galleries/' + contracts[i]).isDirectory()){
				contractName = contracts[i];

				// Loop through all files of each contract, since this will represent each individual gallery needing to be created
				projects = fse.readdirSync('dev/data/galleries/' + contractName);

				for(var x=0; x<=projects.length-1; x++){
					projectName = projects[x].replace(/.json/, '');

					destinationFile = {};
					destinationFile['web/content/portfolio/gallery/' + contractName + '/' + projectName + '/index.html'] = './dev/views/gallery.pug';

					// Since some content needs to be dynamically accessed, process this loop as async, pausing execution temporarily, whilst file system access is allowed to complete
					var done = this.async();

					// Retrieve all data blocks required for the page/template currently being processed
					pageData = retrieveTemplateData('./dev/data/global.json', './dev/data/galleries/' + contractName + '/' + projectName + '.json');

					done();

					// Each page requires unique configuration
					setPugTaskConfiguration('pug.' + contractName + '|' + projectName, pageData, destinationFile);

					grunt.task.run('pug:' + contractName + '|' + projectName);
				}
			}
		}
	});

	// Compile all .scss files to .css files
	grunt.registerTask('sassFiles', 'Compile all .scss files to .css', function(environment){
		if(configuration.environment === 'production' || environment === 'production'){
			grunt.config('sass.files.options.style','compressed');
		}

		grunt.task.run('sass');
	});

	// Pull the version number from package.json, since it's been bumped for the upcoming release
	grunt.registerTask('retrievePackageData','Pull the data from package.json',function(){		
		configuration.package = grunt.file.readJSON('package.json');
	});

	// Pause execution of any task, with any number of arguments
	grunt.registerTask('wait', 'Run a task as async', function(){
		var done = this.async();
		var args = Array.prototype.slice.call(arguments,0);
		var taskToRun = args.join(':');

		grunt.task.run(taskToRun);

		done();
	});	

	/**
	 * Each page requires unique configuration
	 * @function setPugTaskConfiguration
	 * @param {string} taskUniqueIdentifier - A specific reference to the pug configuration, per contract/gallery
	 * @param {object} templateData - The entire dataset for the template rendering
	 * @param {object} outputFileConfiguration - The output (.html) filename and put template paths to be used for the current gallery
	 */
	function setPugTaskConfiguration(taskUniqueIdentifier, templateData, outputFileConfiguration){
		grunt.config(taskUniqueIdentifier, {
			options: {
				data: templateData,
				pretty: configuration.environment !== 'production' ? '\t' : false
			},
			files: outputFileConfiguration
		});
	}

	/**
	 * Retrieve all data blocks required for the page/template currently being processed
	 * @function retrieveTemplateData
	 * @param {string} globalDataPath - All pages require global data, this file path contains it
	 * @param {string} pageSpecificDataPath - All pages require page-specific data, this file path contains it
	 * @returns {object} - The merged datasets for both the global and page-specific data
	 */
	function retrieveTemplateData(globalDataPath, pageSpecificDataPath){
		var pageData = grunt.file.readJSON(globalDataPath);
		extend(pageData, grunt.file.readJSON(pageSpecificDataPath));

		// Provide the site version, so that it can be appended to all CSS and JS files, to provide cache-busting
		extend(pageData, {
			versionSuffix: '?v=' + configuration.package.version
		});

		return pageData;
	}
};