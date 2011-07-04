define(['lib/console', 'lib/pubsub'], function () {
	(function($) {
		
		/**
		 * Define or run a route depending parameters.
		 * A route is defined by a location hash, that will trigger the callback passed in parameter
		 * 
		 * On recent browser, the hashchange event is used. On other browser, a timer check if location.hash has changed
		 * or not in order to determine what route should be runned
		 * 
		 * Define a route with the matching callback
		 * $.route('#/route1', function() {
		 * 	console.log('Run route 1');
		 * });
		 * 
		 * Define a route with parameter
		 * $.route('#/route2/:id', function(params) {
		 * 	console.log('Run route 2 with parameter id = ' + params.id);
		 * });
		 *
		 * Define a route with optionnal parameters (Query String)
		 * $.route('#/route3/:id?foo=bar&goo=car', function(params) {
		 * 	console.log('Run route 3 with parameter id = ' + params.id);
		 * 	console.log('and these optionnal parameters: ' + params.foo + ';' + params.goo);
		 * });
		 * 
		 * Run a route
		 * When a route is runned, the route-run event is dispatched (could be catched thanks to $.subscribe())
		 * $.route('#/route1');
		 * 
		 */
		$.route = function() {
			if(arguments.length == 0 || arguments.length > 2) {
				console.error('Wrong number of arguments, $.route take 1 or 2 argument');
				return;
			}
			
			var path = arguments[0];
			
			// Save the original path
			var real_path = path;

			/* remove trailing query string part of the path */
			path = path.split("?")[0];
			
			/* remove trailing slash from path if it exists */
			if(path[path.length-1]=='/' && path!= '#/') {
				path = path.substring(0, path.length - 1);
			}
			
			if(path=='' || path=='#') {
				path = '#/';
			}
			
			var args = {};
			var parts = real_path.match(/\?([^#]*)$/);
			if (parts) {
				var pairs = parts[1].split('&');
				for (i = 0; i < pairs.length; i++) {
					var pair = pairs[i].split('=');
					var key = decodeURIComponent(pair[0].replace(/\+/g, ' '));
					var val = decodeURIComponent(pair[1].replace(/\+/g, ' '));
					args[key] = val;
				}
			}
			// Run route
			if(arguments.length == 1) {
				
				// Check route pattern matching
				console.debug("Begin matching tests for route " + path);
				for(registered_route in $.route.routes){

					var path_pattern = '^' + registered_route.replace(/:\w+\((.*)\)/g, '($1)').replace(/:\w+/g, '([\\w\-]+)') + '$';
					var path_regexp = new RegExp(path_pattern); 
					var path_parts = path.match(path_regexp);
					
					// If path match
					if(path_parts) {
						console.debug("Found a matching between " + path + ' and ' + registered_route );
						var registered_route_pattern = '^' + registered_route.replace(/:\w+\(.*\)/g, ':(\\w+).*').replace(/:\w+/g, ':(\\w+)') + '$';
						var registered_route_regexp = new RegExp(registered_route_pattern);
						var registered_route_parts = registered_route.match(registered_route_regexp);
						
						if(path_parts.length != registered_route_parts.length) {
							console.error('Path and registered_route have not the same part count !!!');
						}
						
						for(var i=1; i<path_parts.length; i++){
							args[registered_route_parts[i]] = path_parts[i];
						}		
						path = registered_route;
						break;
					}
					
				}
				
				if(typeof $.route.routes[path] == 'undefined'){
					console.info('No route registered for path = ' + path);
					return;
				}
				
				var hash = $(location).attr('hash');
				// Change window hash only if needed: natural browsing already changed the hash, contrary to programmatic
				// calls to $.route('XXX') that need a manual hash change.
				if (hash !== real_path) {
					// If we manually change the hash, we must inhibit the dispatcher, to avoid looping.
					$.route.dispacher._inhibit = true;
					$.route.dispacher._last = real_path;
					$(location).attr('hash', real_path);
				}
				$.publish('route-run', [real_path, args]);
				
				console.debug('Run route ' + arguments[0]);
				
				// Execute route callbacks.
				var callbacks = $.route.routes[path];
				for(var i=0; i<callbacks.length; i++){
					callbacks[i](args);  
				}			
			
				// Register route
			} else if(arguments.length == 2) {
				var callback = arguments[1];
				
				if(typeof $.route.routes[path] == 'undefined'){
					$.route.routes[path] = new Array();
				}
				$.route.routes[path].push(callback);
				console.debug('Route ' + path + ' registered !');
			} 		
		};
		
		$.route.routes = {};
		
		$.route.dispacher = {
			// Inihibition flag when unning a route manually.
			_inhibit: false
		};
		$.route.dispacher._last = '';
		
		$.route.dispacher._onhashchange = function() {
			var hash = $(location).attr('hash');
			// Dispatching may be inhibited if the change is trigger by a programmatic $.route() call.
		    if(!$.route.dispacher._inhibit && $.route.dispacher._last != hash){
		    	$.route.dispacher._last = hash;
		        $.route(hash);
		    }
		    $.route.dispacher._inhibit = false;
		};
		
		if ("onhashchange" in window) {
			$(window).bind( 'hashchange', $.route.dispacher._onhashchange);
			console.debug('Routing is using native window.hashchange event');
		} else {
			console.debug('No support for window.hashchange, so routing is emulated with a timer');
			setInterval($.route.dispacher._onhashchange, 100);
		}
		
	})(jQuery);
});