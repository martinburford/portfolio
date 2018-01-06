module.exports = (function(){
	var options = {
		breakpoints: [
			{name: 'baseLayout', width: -1},
			{name: 'mobileLargeUpwards', width: 480},
			{name: 'tabletPortraitUpwards', width: 728},
			{name: 'tabletLandscapeUpwards', width: 1024},
			{name: 'desktop', width: 1240}
		],
		scrollToTop: {
			framesPerSecond: 2500
		}
	};

	/**
	 * Convert a nodeList to an array
	 * @function nodeListToArray
	 * @param {Object} nl - The nodeList to convert into an array
	 * @returns {Array} - The converted nodeList in array format
	 */
	function nodeListToArray(nl) {
		var arr = [];
		var i;
		var nlLength = nl.length;

		for(i = 0; i < nlLength; i++) {
			arr[i] = nl[i];
		}

		return arr;
	}

	/**
	 * Which breakpoint is the site being viewed within?
	 * @function getBreakpoint
	 * @param {number} [input] - The width of the window
	 * @returns {string} - Either 'baseLayout' || 'mobileLargeUpwards' || 'tabletPortraitUpwards' || 'tabletLandscapeUpwards' || 'desktop'
	 */
	function getBreakpoint(width){
		width = width || window.innerWidth;

		var breakpoints = options.breakpoints;
		var breakpointLength = breakpoints.length;
		var i;

		for(i=0; i<breakpointLength; i++){
			if(width < breakpoints[i].width){
				return breakpoints[i-1].name;
			}
		}

		return breakpoints[breakpointLength-1].name;
	}

	/**
	 * Debounce a function to prevent too many executions
	 * @function debounce
	 * @param {Function} func - The function to run
	 * @param {number} wait - The debounce delay, in milliseconds
	 * @param {boolean} immediate - Execute at the start of the debounce period instead of the end
	 * @returns {Function}
	 */
	function debounce(func, wait, immediate) {
		var timeout;

		return function(){
			var context = this, args = arguments;
			var later = function(){
				timeout = null;

				if(!immediate){
					func.apply(context, args);
				}
			};

			var callNow = immediate && !timeout;

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if(callNow){
				func.apply(context, args);
			}
		};
	}

	/**
	 * Retrieve the offset (left and top) of the requested DOM element
	 * @function currentOffset
	 * @param {Object} elem - The DOM element to retrieve the offsets for
	 * @returns {Object} The left and top px offsets of the requested DOM element
	 */
	function currentOffset(elem){
		var viewportOffset = elem.getBoundingClientRect();
		var offsetLeft = viewportOffset.left + ((window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft);
		var offsetTop = viewportOffset.top + ((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop);

		return {
			left: offsetLeft,
			top: offsetTop
		};
	}  

	/**
	 * Scroll the document to a specifix y-axis offset
	 * @function scrollToY
	 * @param {Number} pixelPosition - The offset to scroll the y-axis to
	 * @param {Number} speed - Time in pixels per second
	 * @param {String} easing - The easing equation to use
	 */
	function scrollToY(pixelPosition, speed, easing){
		var scrollY = window.scrollY;
		var pixelPosition = pixelPosition || 0;
		var speed = speed || 2000;
		var easing = easing || 'easeOutSine';
		var currentTime = 0;

		// Minimum time .1, maximum time .8 seconds
		var time = Math.max(.1, Math.min(Math.abs(scrollY - pixelPosition) / speed, .8));

		// Further easing equations: https://github.com/danro/easing-js/blob/master/easing.js
		var PI_D2 = Math.PI / 2;
		var easingEquations = {
			/**
			 * easeOut animation
			 * @function easeOutSine
			 * @param {Number} position - The current scroll position
			 */
			easeOutSine: function(position){
				return Math.sin(position * (Math.PI / 2));
			},

			/**
			 * easeInOut animation
			 * @function easeInOutSine
			 * @param {Number} position - The current scroll position
			 */
			easeInOutSine: function(position){
				return (-0.5 * (Math.cos(Math.PI * position) - 1));
			},

			/**
			 * easeOutSine animation
			 * @function easeOutSine
			 * @param {Number} position - The current scroll position
			 */
			easeInOutQuint: function(position){
				if((position /= 0.5) < 1){
					return 0.5 * Math.pow(position, 5);
				}

				return 0.5 * (Math.pow((position - 2), 5) + 2);
			}
		};

		/**
		 * Execute animation loop
		 * @function tick
		 */
		function animateLoop(){
			currentTime += 1 / 60;

			var p = currentTime / time;
			var t = easingEquations[easing](p);

			if(p < 1){
				requestAnimFrame(animateLoop);
				window.scrollTo(0, scrollY + ((pixelPosition - scrollY) * t));
			} else {
				window.scrollTo(0, pixelPosition);
			}
		}

		// Execute animation loop
		animateLoop();
	}

	/**
	 * Is an element the window element?
	 * @function isWindowElement
	 * @ returns {Boolean} - Either true || false
	 */
	function isWindowElement(element){
		return element.classList ? false : true;
	}

	/**
	 * Locate a parentnode DOM element, based on a classname || nodeName to match
	 * @function findParentNode
	 * @param {String} className - The className to look for, in order to find the desired parent node
	 * @param {String} nodeName - The nodeName to look for, in order to find the desired parent node
	 * @param {Object} obj - The originating DOM element, where the event was initiated
	 * @returns {Object} - The DOM element which is the requested parentNode
	 */
	function findParentNode(options, obj){
		var nodeToTestElem = obj.parentNode;
		var searchByClassName = options.hasOwnProperty('className');
		var searchByNodeName = options.hasOwnProperty('nodeName');

		if(searchByClassName){
			while(!nodeToTestElem.classList.contains(options.className)){
				nodeToTestElem = nodeToTestElem.parentNode;
			}
		} else if(searchByNodeName){
			while(nodeToTestElem.nodeName !== options.nodeName.toUpperCase()){
				nodeToTestElem = nodeToTestElem.parentNode;
			}
		}

		return nodeToTestElem;
	}

	/**
	 * Retrieve the left and top scroll offsets of the window
	 * @function windowOffsets
	 * @returns {number} left - The current left scroll offset of the window
	 * @returns {number} top - The current top scroll offset of the window
	 */
	function windowOffsets(){
		return {
			left: (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0),
			top: (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0)
		};
	}

	return {
		currentOffset: currentOffset,
		debounce: debounce,
		findParentNode: findParentNode,
		getBreakpoint: getBreakpoint,
		isWindowElement: isWindowElement,
		nodeListToArray: nodeListToArray,
		options: options,
		scrollToY: scrollToY,
		windowOffsets: windowOffsets
	}
}());