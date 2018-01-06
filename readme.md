# Overview

In April 2017, I decided to spend a little time re-writing my portfolio from scratch. I find that as a Front-End Developer, I'm always so busy, and as a result have never had time to put together a CV and Portfolio that I feel accurately represents me as a developer. The code contained in this repository is available at the following URL: http://www.martinburford.co.uk

## Technologies used

I've built the site using Node, along with Express and Pug for templating. 

## Build scripts

Prior to re-building my portfolio, I was experienced in Grunt, however I'd never used Gulp. As a technical exercise, I wrote all of the tasks I needed using Grunt, followed by re-writing the same in Gulp. I like to look at new technologies, and I felt this was a great exercise to help me gain exposure to another well used technology, much in demand from clients these days of their front-end developers.

## Breakpoints

The site is coded into 5 separate breakpoints:

* Base layout: 1px - 479px
* Mobile (large): 480px - 727px
* Tablet (portrait): 728px - 1023px
* Tablet (landscape): 1024px - 1239px
* Desktop: 1240px +

## CSS/Pre-processors

Throughout the site, I have made extensive use of SASS.

## SVG iconography

There are so many high resolution screens/devices out there nowadays, that it is imperative to cater for all eventualities. Pixelated icons are just horrible. As a result, I've used [icoMoon](https://icomoon.io/app/#/select) to generate a custom webfont, made up of a selection of SVG icons. This makes it possible to position, scale and color all of the icons to match the visual requirements of the site with no loss of quality.

## Node modules used

Since I wrote build scripts for the site using both Grunt and Gulp, there are more Node modules included within the project as a result. A full list of the modules I had to use are below:

### Dependencies

* body-parser
* cookie-parser
* debug
* express
* morgan
* pug
* serve-favicon

### Dev Dependencies

* babel-preset-es2015
* babelify
* browserify
* del
* extend
* fs-extra
* grunt
* grunt-browserify
* grunt-bumpup
* grunt-contrib-clean
* grunt-contrib-pug
* grunt-contrib-sass
* grunt-contrib-watch
* gulp
* gulp-bump
* gulp-notify
* gulp-plumber
* gulp-pug
* gulp-rename
* gulp-sass
* gulp-uglify
* inquirer
* minifyify
* promise
* run-sequence
* vinyl-buffer
* vinyl-source-stream
* yargs

## Contact

I can be contacted on the following email address <martin@martinburford.co.uk>