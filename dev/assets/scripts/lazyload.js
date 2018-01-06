var events = require('./events.js');
var utilities = require('./utilities.js');

module.exports = (function(){
	var options = {
		modsCurrentlyInView: []
	};

	/**
	 * Initialize the lazyloading
	 * @function init
	 */
	function init(){
		// Perform a refresh on a specific scrolled DOM element
		refresh(window);
	}

	/**
	 * Setup scrollStart and scrollStop events for a specific DOM element
	 * @function registerForLazyloading
	 * @private
	 * @param {Object} elementId - The id identifying the DOM element to attach lazyloading functionality to (within configuration)
	 */
	function registerForLazyLoading(elementId){
		var handlersElement = options.elements[elementId].handlersElement;
		var inViewElement = options.elements[elementId].inViewElement;

		// Scroll start
		handlersElement.addEventListener('scroll',utilities.debounce(function(){
			events.fire(handlersElement,'scroll.start');
		},options.debounce.scroll, true));

		// Scroll stop
		handlersElement.addEventListener('scroll',utilities.debounce(function(){
			events.fire(handlersElement,'scroll.stop');
		},options.debounce.scroll));

		// Assign an event, to be triggered on scrollStop
		handlersElement.addEventListener('scroll.stop',function(){
			refresh(this, inViewElement, elementId === 'document');
		});

		// Assign an event, to be triggered on scrollStop
		// handlersElement.addEventListener('scroll.start',function(){ ... });
	}

	/**
	 * Perform a refresh on a specific scrolled DOM element
	 * @function refresh
	 * @param {Object} element - The lazyload DOM element which has been scrolled
	 * @param {Object} inViewElement - The element to check the modules viewability against (not necessarily the same as the element which has been scrolled eg: document && #outer)
	 * @param {Boolean} isDocumentScroll - Whether or not the scrolled DOM element is the document or not
	 */
	function refresh(element){
		// Check to see which elements are in view, and despatch events to perform the necessary actions for all elements in view
		refreshElementsInView(element);
	}

	/**
	 * Retrieve the left and top scroll offsets of the scrolling DOM element
	 * @function elementOffsets
	 * @private
	 * @param {Object} element - The scrolling DOM element
	 * @param {Boolean} isDocumentScroll - Whether or not the scrolled DOM element is the document or not
	 * @returns {number} bottom - The current bottom scroll offset of the scrolling DOM element
	 * @returns {number} top - The current top scroll offset of the scrolling DOM element
	 */
	function elementOffsets(element){
		var isWindowElem = utilities.isWindowElement(element);
		var offsetHeight;
		var top;
		var bottom;

		switch(isWindowElem){
			case true: 
				top = document.documentElement.scrollTop || document.body.scrollTop;
				bottom = top + window.innerHeight;

				break;
			case false:
				top = element.scrollTop;
				bottom = top + element.offsetHeight;      

				break;
		}

		return {
			bottom: bottom,
			top: top
		};
	}

	/**
	 * Retrieve the full mod-xx data attibute from a DOM element, regardless of its position in the classlist
	 * @function getModName
	 * @private
	 * @param {string} modName - The entire class name of the DOM element which contains a mod-xx classname
	 * @returns {string} - A fully qualified mod-xx classname, inclusive of the mod- prefix
	 */
	function getModName(modName){
		return modName.replace('mod-','');
	}

	/**
	 * Retrieve all elements on page which have a mod- classname AND ALSO HAVE an additional inview class
	 * @function getModsInView
	 * @private
	 * @param {Object} element - The DOM element which contains the mod- components. This is necessary to set the scope of the mod- searches
	 * @returns {Object} A DOM selector matching the filter criteria
	 */
	function getModsInView(element){
		// Query against all DOM elements which contain a classname (in any position of the classList), beginning with mod-
		var modules = utilities.nodeListToArray(element.querySelectorAll('[data-lazyload-module*=mod-]'));
		var inViewModules = [];
		var okToInitialize;

		modules.forEach(function(moduleObj){
			// Check to see whether a module is ok to initialize (or has an override been provided by the page template
			okToInitialize = true;

			// Only if a DOM elements module type is NOT in the exclusion list AND it has a data-inview property should be be initialized
			if(okToInitialize && moduleObj.hasAttribute('data-inview') && !moduleObj.hasAttribute('data-initialized')){
				inViewModules.push(moduleObj);
			}
		});

		return inViewModules;
	}

	/**
	 * Check to see whether the current mod- DOM element is in view
	 * @function isModCurrentlyInView
	 * @private
	 * @param {Object} parentElement - The DOM element the lazyload load item sits inside
	 * @param {Boolean} isWindowScroll - Whether or not the lazyload has been triggered by a window scroll or not
	 * @returns {boolean} - Whether or not the DOM element is in view
	 */
	function isModCurrentlyInView(parentElement, isWindowScroll){
		var parentRect;
		var elementRect = this.getBoundingClientRect();
		var scrollUpThreshold;   
		var scrollDownThreshold = 0;
		var elementBottom;
		var elementTop;

		if(isWindowScroll){
			// Retrieve the left and top scroll offsets of the window
			var offsets = utilities.windowOffsets(); 
			var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

			elementTop = elementRect.top;
			scrollUpThreshold = windowHeight;
		} else {
			parentRect = parentElement.getBoundingClientRect();
			elementTop = elementRect.top - parentRect.top;
			scrollUpThreshold = parentElement.offsetHeight;
		}

		elementBottom = elementTop + this.offsetHeight;

		var isInView = (elementTop <= scrollUpThreshold && elementBottom >= scrollDownThreshold);

		if(elementTop === 0 && elementBottom === 0){
			return false;
		} else {
			return isInView;
		}    
	}

	/**
	 * Check to see which elements are in view, and despatch events to perform the necessary actions for all elements in view
	 * @function refreshElementsInView
	 * @private
	 * @param {Object} element - The lazyload DOM element which has been scrolled
	 * @param {Object} inViewElement - The element to check the modules viewability against (not necessarily the same as the element which has been scrolled eg: document && #outer)
	 */
	function refreshElementsInView(element){
		// Flush out the previously stored in view modules, and re-define them in response to the current scroll offset
		options.modsCurrentlyInView.length = 0;

		var inViewElement = element === window ? document.getElementById('outer') : element;
		var isWindowScroll = element === window;
		var selector = getModsInView(inViewElement);
		var matchedDomObj;
		var i;
		var isModInView;

		for(i=0; i<selector.length; i++){
			matchedDomObj = selector[i];

			// Check to see whether the current mod- DOM element is in view
			isModInView = isModCurrentlyInView.call(matchedDomObj, inViewElement, isWindowScroll);

			if(isModInView){
				options.modsCurrentlyInView.push(matchedDomObj);
			}
		}

		// With the sequence queue populated, run through it sequentially, loading each mod- DOM element match one-by-one
		try {
			dispatcher.execute();
		}
		catch (err){}
	}

	var dispatcher = (function(){
		/**
		 * With the sequence queue populated, run through it sequentially, loading each mod- DOM element match one-by-one
		 * @function execute
		 */
		function execute(){
			// Only loop through the queue if it contains 1 or more tasks to execute
			if(options.modsCurrentlyInView.length > 0){
				// Initialize the required functionality for the first module in the queue
				moduleInitialize(options.modsCurrentlyInView[0]);
			}
		}

		/**
		 * Initialize the required functionality for the desired module
		 * @function moduleInitialize
		 * @private
		 * @param {Object} element - The DOM object to execute the initialization against
		 */
		function moduleInitialize(element){
			var options = {
				functionToRun: 'update',
				modType: getModName(element.getAttribute('data-lazyload-module'))
			};

			var routeOptions = options;
			routeOptions.element = element;

			// Route a request through to the necessary function
			route(routeOptions);
		}

		/**
		 * Route a request through to the necessary function
		 * @function route
		 * @private
		 * @param {Object} element - The DOM object to execute the initialization against
		 * @param {string} functionToRun - The name of a custom function to execute (rather than the default 'update' one)
		 * @param {string} modType - The type of component, mapped to the plugin name used to build/initialize it (eg: mod-image = image)
		 */
		function route(obj){
			try{
				components[obj.modType][obj.functionToRun].call(obj.element,initializeComplete);
			}
			catch(error){}
		}

		/**
		 * Notify the dispatcher that a component has finished initializing
		 * @function initializeComplete
		 * @param {string} queueId - The queueId of the module which has finished initializing
		 */
		function initializeComplete(obj){
			var i;

			for(i=0; i<options.modsCurrentlyInView.length; i++){
				// Remove the completed queue element from the queue, and proceed with the next, until the queue is empty
				options.modsCurrentlyInView.splice(0,1);

				// With the sequence queue populated, run through it sequentially, loading each mod- DOM element match one-by-one
				execute();
			}
		}

		return {
			execute: execute,
			initializeComplete: initializeComplete
		};
	}()); 

	var components = {
		image: (function(){
			/**
			 * Lazyload an image
			 * @function update
			 * @param {function} callback - The callback routine to execute, once the image has been lazyloaded
			 */
			function update(callback){
				this.setAttribute('data-initialized', true);
				this.setAttribute('src', this.getAttribute('data-src'));

				// Once the image has been switched, execute the necessary queue callback routine
				callback();
			}

			return {
				update: update
			}
		}())
	};

	return {
		init: init,
		refresh: refresh
	}
}());