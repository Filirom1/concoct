/**
 * Resthub-controller is a generic javascript controller for resthub
 * applications. It provides utility functions for basic operations.
 * 
 * <b>Do not remove the lib/jqueryui/widget inclusion: its needed for the destroy mechanism.</b>
 */
define(['lib/class', 'lib/tmpl', 'lib/jqueryui/widget'], function(Class) {

	return Class.extend("Controller", {


		// used to remove the controller from the name
		_underscoreAndRemoveController : function(className) {
			var str = className.replace("jQuery.", "").replace( /\./g, '_').replace(/_?controllers?/ig, "");
			return str.replace(/::/, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '_').toLowerCase();
		},

		init : function() {
			// if you didn't provide a name, or are controller,
			// don't do anything
			if (!this.shortName || this.fullName == "jQuery.Controller") {
				return;
			}
			// cache the underscored names
			this._fullName = this._underscoreAndRemoveController(this.fullName);
			this._shortName = this._underscoreAndRemoveController(this.shortName);

			var controller = this, pluginname = this.pluginName || this._fullName, funcName, forLint;

			// create jQuery plugin
			if (!$.fn[pluginname]) {
				$.fn[pluginname] = function(options) {

					var args = $.makeArray(arguments),
					// if the arg is a method on this controller
					isMethod = typeof options == "string"
							&& $.isFunction(controller.prototype[options]), meth = args[0];
					this.each(function() {
						// create a new controller instance, and stores it in the node.
						$.data(this, pluginname, controller.newInstance.apply(controller, [ this ].concat(args)));
					});
					// always return the element
					return this;
				};
			}
		}

		}, {
			
			template: '',
			
			/**
			 * Handle for event subscription.
			 * Automatically unsubscribed when the controller is destroyed.
			 */
			handles: [],
			
			setup: function( element, options ) {
				this.element = $(element);
				this.handles = [];
				$.extend( true, this, options );
				// Bind to remove element to call the destroy method.
				if (this.element.children().length > 0) {
					$(this.element.children()[0]).bind('remove.'+this['Class']._fullName, $.proxy(this, 'destroy'));
				}
			},
			
			/**
			 * Subscribe an method of this controller (or an anonymous function)
			 * to an event, keeping the returned handle for automatic removal
			 * during destroy.
			 * If eventType is an array, the handler is bound to all events.
			 * 
			 * @param eventType Type of event subscribed. Can be an array.
			 * @param callback anonymous function executed in this controller 
			 * context, or name of an existing method (name is string).
			 */
			subscribe: function(eventType, callback) {
				var bound;
				if (jQuery.isFunction(callback)) {
					bound = $.proxy(callback, this);
				} else {
					bound = $.proxy(this, callback);
				}
				if (!jQuery.isArray(eventType)) {
					eventType = [eventType];
				}
				for (var i = 0; i < eventType.length; i++) {
					// Register the callback and kept the handle.
					this.handles.push($.subscribe(eventType[i], bound));
				}
			}, // subscribe().
			
			/**
			 * Destroy function, invoked when the rendering is removed.
			 * May be overrited to add specific finalization code.
			 * 
			 * <b>Don't forget to call this._super() in overriden methods.</b>
			 * Unsubribe all event handles stored in this.handles.
			 */
			destroy: function() {
				// Unsubscribed known handles
				for (var i = 0; this.handles && i < this.handles.length; i++) {
					$.unsubscribe(this.handles[i]);
				}
				// Unbind the removal event.
				if (this.element.children().length > 0) {
					$(this.element.children()[0]).unbind('remove.'+this['Class']._fullName);
				}
			},
			
			/**
			 * Renders current widget with the template specified in
			 * this.options.template. If none is defined, it used a
			 * view with the same name of the controller
			 */
			render : function(data, options) {
				// Unbind the destroy handler during rendering.
				$(this.element.children()[0]).unbind('.'+this['Class']._fullName);
				// Performs rendering.
				if (typeof (this.template) == 'undefined') {
					this.element.render('./' + this.widgetName + '.html', data, options);
				} else {
					this.element.render(this.template, data, options);
				}
				// Re-bind the destroy handler.
				$(this.element.children()[0]).bind('remove.'+this['Class']._fullName, $.proxy(this, 'destroy'));
			}
		});

});
