var utilities = require('./utilities.js');

module.exports = (function(){
	var delegation = (function(){
		/**
		 * Process a specific event
		 * @function handle
		 * @private
		 * @param {event} e - The event
		 * @param {Object} target - The current element which the event has bubbled up to
		 * @param {Object} root - The root level in the DOM tree where the event should be allowed to be delegated from
		 * @param {Array} delegatees - The delegatees which the events can be attached to
		 * @param {function} handler - The event handler function to call
		 * @param {Object} options - Any additional options for the event
		 */
		function handle(e,target,root,delegatees,handler,options){
			// It's been passed up all the way to the top - exit
			if(target === root){
				// Stop the event bubbling up out of the delegated element
				if(options.stopPropagation){
					e.stopPropagation();
				}

				if(options.preventDefault){
					e.preventDefault();
				}

				return;
			}

			// If the current target is in the list, fire the handler
			var index = delegatees.indexOf(target);
			if(index !== -1){
				handler.call(delegatees[index],e);
			}

			// Pass it up to the parent
			handle(e,target.parentNode,root,delegatees,handler,options);
		}

		/**
		 * Find all delegatees for a given event, based on a specific filter
		 * @function getDelegatees
		 * @private
		 * @param {Array} delegatees - The delegatees which the events can be attached to
		 * @param {Object} el - The DOM element that the event will be delegated against
		 * @param {string} filter - A DOM element string selector path
		 * @return {Object} - A filtered array of elements which are to have delegated events attached to
		 */
		function getDelegatees(delegatees,el,filter){
			return delegatees.concat(utilities.nodeListToArray(el.querySelectorAll(filter)));
		}

		/**
		 * Find all child delegatees for a given element, based on a specific filter
		 * @function getChildDelegatees
		 * @private
		 * @param {Array} delegatees - The delegatees which the events can be attached to
		 * @param {Object} el - The DOM element that the event will be delegated against
		 * @param {string} filter - A DOM element string selector path
		 * @return {Object} - A filtered array of elements which are to have delegated events attached to
		 */
		function getChildDelegatees(delegatees,elem,filter){
			// Get everything by selector (without the child bit)
			var els = utilities.nodeListToArray(elem.querySelectorAll(filter.substr(1)));

			els = els.filter(function(child){
				// Throw away anything thats not a child of the element
				return (child.parentNode === elem);
			});

			return delegatees.concat(els);
		}

		/**
		 * Delegate an event handler
		 * @function delegate
		 * @param {Object} roots - Can be a single node, a nodeList, or an array of elements
		 * @param {string} filters - A DOM element string selector path
		 * @param {string} evt - The event type
		 * @param {function} handler - The function to execute when the event listener is fired
		 * @param {Object} options - Any additional options for the event
		 */
		function delegate(roots,filters,evt,handler,options){
			options = options || {};

			// Allow multiple filters in one selector. doing each separately is faster and is the only practical way if we are allowing non-standard selectors (like child)
			filters = filters.split(',');

			if(typeof roots.length === 'undefined'){
				roots = [roots];
			}

			if(!roots.forEach){
				roots = utilities.nodeListToArray(roots);
			}

			roots.forEach(function(elem){
				// Add event listener to the element thats being delegated to
				elem.addEventListener(evt,function(e){
					var delegatees = [];

					// Build up an array of elements based on the filters
					filters.forEach(function(filter){
						if(filter.substr(0,1) === '>'){
							// querySelectorAll doesn't handle > without a quantifying root
							delegatees = getChildDelegatees(delegatees,elem,filter);
						} else {
							delegatees = getDelegatees(delegatees,elem,filter);
						}
					});
				
					handle(e,e.target,elem,delegatees,handler,options);
				});
			});
		}

		return delegate;
	}());

	/**
	 * Fire an event
	 * @function fire
	 * @param {Object} el - The DOM element that the event will be for for
	 * @param {string} evt - The event type
	 * @param {Object} [data] - Custom data to pass with the event
	 * @param {*} data - Data to pass along with the event - will be assigned to Event.data
	 */
	function fire(el,evt,data){
		var event;
		data = data || {};

		if(document.createEvent){
			event = document.createEvent("HTMLEvents");
			event.initEvent(evt, true, true);
			event.data = data;
			el.dispatchEvent(event);
		} else if(document.createEventObject){
			event = document.createEventObject();
			event.data = data;
			el.fireEvent('on'+evt,event);
		}

		// Setting a dataEvent to true indicates it has been fired. useful when adding a listener post-firing
		setDataEvents(el,evt,data);
	}

	/**
	 * Marks an element as having already had an event fired on it. Allows handlers attached after the event has fired to execute immediately
	 * @function setDataEvents
	 * @private
	 * @param {Object} el - The source element of the event
	 * @param {string} evt - The event type
	 * @param {Object} [data] - Custom data to be passed with the event
	 * @returns {boolean} - true if the event has already fired, false if this is the first time
	 */
	function setDataEvents(el,evt,data){
		el.dataEvents = el.dataEvents || {};
		el.dataEvents[evt] = data || {};
	}

	return {
		delegate : delegation,
		fire: fire
	};
}());