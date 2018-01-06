var events = require('./events.js');
var gallery = require('./gallery.js');
var lazyload = require('./lazyload.js');
var utilities = require('./utilities.js');

module.exports = (function(){
	var options = {
		debounce: {
			resize: 250,
			scroll: 5
		},
		scrollToTop: {
			framesPerSecond: 2500
		}
	};

	/**
	 * Initialize the site
	 * @function init
	 */
	function init(){
		// Initialize the image gallery
		gallery.init();

		// Initialize the lazyloading
		lazyload.init();

		// Delegate all (global) events for the site
		eventsInit();

		// Check to see whether touch support is avaiable on the device/browser viewing the site
		var isTouch = isTouchSupported();
		if(isTouch){
			document.body.classList.add('has-touch');
		}

		// Due to a few snap events in the DOM, lazyload needs to be fired once these have completed
		window.onload = function(){
			// Perform a refresh on a specific scrolled DOM element
			lazyload.refresh(window);
		}
	}

	/**
	 * Delegate all (global) events for the site
	 * @function eventsInit
	 * @private
	 */
	function eventsInit(){
		document.onkeydown = function(e){
			e = e || window.event;

			if(e.keyCode === 27){
				// Perform specific events if the escape key has been pressed by the user
				processEscapeKey();
			}
		};

		var projectsElem = document.getElementById('projects');
		if(projectsElem){
			projectsElem.addEventListener('scroll',utilities.debounce(function(){
				events.fire(projectsElem,'scroll.stop');
			},options.debounce.scroll));

			projectsElem.addEventListener('scroll.stop', function(){
				// Perform a refresh on a specific scrolled DOM element
				lazyload.refresh(projectsElem);
			});
		}

		// Assign inview events, to be triggered on scrollStop
		// SCROLL.STOP
		window.addEventListener('scroll',utilities.debounce(function(){
			events.fire(window,'scroll.stop');
		},options.debounce.scroll));

		window.addEventListener('scroll.stop', function(){
			// Perform a refresh on a specific scrolled DOM element
			lazyload.refresh(window);
		});

		// RESIZE.START
		window.addEventListener('resize',utilities.debounce(function(){
			// If the overlay is open when the browser is resized, hide it immediately
			// Unless a video player is active
			if(!gallery.options.overlay.isVideoActive){
				gallery.hideOverlayIfOpen();
			}
		},options.debounce.resize, true));

		// RESIZE.STOP
		window.addEventListener('resize',utilities.debounce(function(){
			// Perform a refresh on a specific scrolled DOM element
			lazyload.refresh(window);      
		},options.debounce.resize));
	}

	/**
	 * Check to see whether touch support is avaiable on the device/browser viewing the site
	 * @function isTouchSupported
	 * @private
	 */
	function isTouchSupported(){
		return typeof window.ontouchstart !== 'undefined';    
	}

	/**
	 * Perform specific events if the escape key has been pressed by the user
	 * @function processEscapeKey
	 * @private
	 */
	function processEscapeKey(){
		if(document.body.classList.contains('overlay-visible')){
			document.getElementById('overlay-close').click();
		}
	}

	Element.prototype.appendBefore = function(element){
		element.parentNode.insertBefore(this, element);
	};

	Element.prototype.appendAfter = function(element){
		element.parentNode.insertBefore(this, element.nextSibling);
	};

	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame ||
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame ||
						function(callback){
						window.setTimeout(callback, 1000 / 60);
		};
	})();

	return {
		init: init,
		options: options
	}
}());