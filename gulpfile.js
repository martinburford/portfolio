'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var plumber = require('gulp-plumber');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var del = require('del');
var bump = require('gulp-bump');
var argv = require('yargs').argv;
var inquirer = require('inquirer');
var runSequence = require('run-sequence');
var pug = require('gulp-pug');
var extend = require('extend');
var fse = require('fs-extra');

var onError = function(error){
	notify({
		title: 'Gulp task error: '
	}).write(error);

	this.emit('end');
};

var configuration = {
	bump: {
		type: null
	},
	environment: 'development',
	version: require('./package.json').version
};

// Browserify modules, ES6 - ES5 transpilation, along with uglification and bundling
gulp.task('scripts', function(){
	return browserify('dev/assets/scripts/app.js')
		.transform(babelify.configure({
			presets: ['es2015']
		}))
		.bundle()
		.pipe(source('app.min.js'))
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest('web/content/assets/scripts'))
});

// Sass compilation/minification/suffix renaming
gulp.task('sassFiles', function(){
	return gulp.src(['dev/assets/scss/*.scss'])
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(sass({
			outputStyle: 'expanded' // 'compressed' || 'expanded'
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('web/content/assets/css'))
});

// Tasks to execute based on watch routines
gulp.task('watch', function() {
	gulp.watch(['dev/assets/scss/**/*.scss'], ['sassFiles']);
	gulp.watch(['dev/assets/scripts/*.js'], ['scripts']);
});

// Cleanup routine
gulp.task('clean', function(){
	return del([
		'web/content/assets/css/*.*',
		'web/content/assets/scripts/app.min.js',
		'web/content/cv/index.html',
		'web/content/error/',
		'web/content/portfolio/',
		'web/content/index.html'
	]);
});

// Bump sites version number up, either by patch, minor or major
// Use --type=patch || --type=minor || --type=major
gulp.task('bump', function(){
	// The bump type can either be specified directly from the command line, or via inquirer prompts
	configuration.bump.type = argv.type != undefined ? argv.type : configuration.bump.type;

	return gulp.src('./package.json')
		.pipe(bump({
			type: configuration.bump.type
		}))
		.pipe(gulp.dest('./'));
});

// Retrieve the package.json file contents, since a bump may have taken place, and the version number is used for cachebusting
gulp.task('retrievePackageData', function(){
	return configuration.version = require('./package.json').version;
});

// Generate all templates files
gulp.task('generateSite', function(){
	runSequence(
		'clean',
		'scripts',
		'sassFiles',
		'pugNonGallery',
		'pugGalleries'
	);
});

// Generate all pages other than gallery pages
gulp.task('pugNonGallery', function(){
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
	var globalData = require('./dev/data/global.json');
	var templateData;
	var pageUrlObj;

	for(var i=0; i<=pages.length-1; i++){
		templateData = {
			versionSuffix: '?v=' + configuration.version
		};

		pageUrlObj = pages[i];

		// Retrieve all data blocks required for the page/template currently being processed
		extend(templateData, globalData, require('./dev/data/' + pageUrlObj.id + '.json'));

		gulp.src('dev/views/' + pageUrlObj.id + '.pug')
			.pipe(pug({
				data: templateData,
				pretty: configuration.environment !== 'production' ? '\t' : false
			}))
			.pipe(rename(pageUrlObj.file))
			.pipe(gulp.dest('web/content/' + pageUrlObj.folder))
	}
});

// Generate all gallery pages
gulp.task('pugGalleries', function(){
	var contracts = fse.readdirSync('dev/data/galleries');
	var contractName;
	var projects;
	var projectName;
	var destinationFile;
	var templateData;
	var globalData = require('./dev/data/global.json');

	// Loop through all folders within the /dev/data/galleries directory, as this represents each unique contract (and project)
	for(var i=0; i<=contracts.length-1; i++){
		if(fse.lstatSync('dev\\data\\galleries\\' + contracts[i]).isDirectory()){
			contractName = contracts[i];

			// Loop through all files of each contract, since this will represent each individual gallery needing to be created
			projects = fse.readdirSync('dev/data/galleries/' + contractName);

			for(var x=0; x<=projects.length-1; x++){
				projectName = projects[x].replace(/.json/, '');

				templateData = {
					versionSuffix: '?v=' + configuration.version
				}

				// Retrieve all data blocks required for the page/template currently being processed
				extend(templateData, globalData, require('./dev/data/galleries/' + contractName + '/' + projectName + '.json'));

				gulp.src('dev/views/gallery.pug')
					.pipe(pug({
						data: templateData,
						pretty: configuration.environment !== 'production' ? '\t' : false
					}))
					.pipe(rename('index.html'))
					.pipe(gulp.dest('web/content/portfolio/gallery/' + contractName + '/' + projectName))
			}
		}
	}
});

// Default task, with interactive prompting
gulp.task('default', function(){
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
				// Store references to globally required settings, based on the user selection
				configuration.bump.type = releaseTypeAnswers.releaseType;
				configuration.environment = 'production';

				// Run the following tasks in order
				runSequence(
					'bump',
					'retrievePackageData',
					'generateSite'
				);
			});
		} else {
			// Store references to globally required settings, based on the user selection
			configuration.environment = 'development';

			gulp.start(answers.taskType);
		}
	});
});