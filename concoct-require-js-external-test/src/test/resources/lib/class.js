//jQuery.Class 
// This is a modified version of John Resig's class
// http://ejohn.org/blog/simple-javascript-inheritance/
// It provides class level inheritance and callbacks.
define(['lib/jquery'], function () {

	// jQuery.Class taken from Javascript MVC framework
	//
	// This is a modified version of John Resig's class
	// http://ejohn.org/blog/simple-javascript-inheritance/
	// It provides class level inheritance and callbacks.

		// if we are initializing a new class
		var initializing = false,

			// tests if we can get super in .toString()
			fnTest = /xyz/.test(function() {
				xyz;
			}) ? /\b_super\b/ : /.*/,

			// overwrites an object with methods, sets up _super
			inheritProps = function( newProps, oldProps, addTo ) {
				addTo = addTo || newProps;
				for ( var name in newProps ) {
					// Check if we're overwriting an existing function
					addTo[name] = typeof newProps[name] == "function" && typeof oldProps[name] == "function" && fnTest.test(newProps[name]) ? (function( name, fn ) {
						return function() {
							var tmp = this._super,
								ret;

							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = oldProps[name];

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							ret = fn.apply(this, arguments);
							this._super = tmp;
							return ret;
						};
					})(name, newProps[name]) : newProps[name];
				}
			};

		jQuery.Class = function() {
			if (arguments.length) {
				jQuery.Class.extend.apply(jQuery.Class, arguments);
			}
		};

		/* @Static*/
		jQuery.extend(jQuery.Class, {
			/**
			 * @function callback
			 * Returns a callback function for a function on this Class.
			 * The callback function ensures that 'this' is set appropriately.  
			 * @codestart
			 * $.Class.extend("MyClass",{
			 *     getData: function() {
			 *         this.showing = null;
			 *         $.get("data.json",this.callback('gotData'),'json')
			 *     },
			 *     gotData: function( data ) {
			 *         this.showing = data;
			 *     }
			 * },{});
			 * MyClass.showData();
			 * @codeend
			 * <h2>Currying Arguments</h2>
			 * Additional arguments to callback will fill in arguments on the returning function.
			 * @codestart
			 * $.Class.extend("MyClass",{
			 *    getData: function( <b>callback</b> ) {
			 *      $.get("data.json",this.callback('process',<b>callback</b>),'json');
			 *    },
			 *    process: function( <b>callback</b>, jsonData ) { //callback is added as first argument
			 *        jsonData.processed = true;
			 *        callback(jsonData);
			 *    }
			 * },{});
			 * MyClass.getData(showDataFunc)
			 * @codeend
			 * <h2>Nesting Functions</h2>
			 * Callback can take an array of functions to call as the first argument.  When the returned callback function
			 * is called each function in the array is passed the return value of the prior function.  This is often used
			 * to eliminate currying initial arguments.
			 * @codestart
			 * $.Class.extend("MyClass",{
			 *    getData: function( callback ) {
			 *      //calls process, then callback with value from process
			 *      $.get("data.json",this.callback(['process2',callback]),'json') 
			 *    },
			 *    process2: function( type,jsonData ) {
			 *        jsonData.processed = true;
			 *        return [jsonData];
			 *    }
			 * },{});
			 * MyClass.getData(showDataFunc);
			 * @codeend
			 * @param {String|Array} fname If a string, it represents the function to be called.  
			 * If it is an array, it will call each function in order and pass the return value of the prior function to the
			 * next function.
			 * @return {Function} the callback function.
			 */
			callback: function( funcs ) {

				//args that should be curried
				var args = jQuery.makeArray(arguments),
					self;

				funcs = args.shift();

				if (!jQuery.isArray(funcs) ) {
					funcs = [funcs];
				}

				self = this;
				
				for( var i =0; i< funcs.length;i++ ) {
					if(typeof funcs[i] == "string" && typeof this[funcs[i]] !== 'function'){
						throw ("class.js "+( this.fullName || this.Class.fullName)+" does not have a "+funcs[i]+"method!");
					}
				}
				
				return function class_cb() {
					var cur = args.concat(jQuery.makeArray(arguments)),
						isString, 
						length = funcs.length,
						f = 0,
						func;

					for (; f < length; f++ ) {
						func = funcs[f];
						if (!func ) {
							continue;
						}

						isString = typeof func == "string";
						if ( isString && self._set_called ) {
							self.called = func;
						}
						cur = (isString ? self[func] : func).apply(self, cur || []);
						if ( f < length - 1 ) {
							cur = !jQuery.isArray(cur) || cur._use_call ? [cur] : cur;
						}
					}
					return cur;
				};
			},
			/**
			 *   @function getObject 
			 *   Gets an object from a String.
			 *   If the object or namespaces the string represent do not
			 *   exist it will create them.  
			 *   @codestart
			 *   Foo = {Bar: {Zar: {"Ted"}}}
			 *   $.Class.getobject("Foo.Bar.Zar") //-> "Ted"
			 *   @codeend
			 *   @param {String} objectName the object you want to get
			 *   @param {Object} [current=window] the object you want to look in.
			 *   @return {Object} the object you are looking for.
			 */
			getObject: function( objectName, current ) {
				var current = current || window,
					parts = objectName ? objectName.split(/\./) : [],
					i = 0;
				for (; i < parts.length; i++ ) {
					current = current[parts[i]] || (current[parts[i]] = {});
				}
				return current;
			},
			/**
			 * @function newInstance
			 * Creates a new instance of the class.  This method is useful for creating new instances
			 * with arbitrary parameters.
			 * <h3>Example</h3>
			 * @codestart
			 * $.Class.extend("MyClass",{},{})
			 * var mc = MyClass.newInstance.apply(null, new Array(parseInt(Math.random()*10,10))
			 * @codeend
			 * @return {class} instance of the class
			 */
			newInstance: function() {
				var inst = this.rawInstance(),
					args;
				if ( inst.setup ) {
					args = inst.setup.apply(inst, arguments);
				}
				if ( inst.init ) {
					inst.init.apply(inst, $.isArray(args) ? args : arguments);
				}
				return inst;
			},
			/**
			 * Copy and overwrite options from old class
			 * @param {Object} oldClass
			 * @param {String} fullName
			 * @param {Object} staticProps
			 * @param {Object} protoProps
			 */
			setup: function( oldClass, fullName ) {
				this.defaults = $.extend(true, {}, oldClass.defaults, this.defaults);
				return arguments;
			},
			rawInstance: function() {
				initializing = true;
				var inst = new this();
				initializing = false;
				return inst;
			},
			/**
			 * Extends a class with new static and prototype functions.  There are a variety of ways
			 * to use extend:
			 * @codestart
			 * //with className, static and prototype functions
			 * $.Class.extend('Task',{ STATIC },{ PROTOTYPE })
			 * //with just classname and prototype functions
			 * $.Class.extend('Task',{ PROTOTYPE })
			 * //With just a className
			 * $.Class.extend('Task')
			 * @codeend
			 * @param {String} [fullName]  the classes name (used for classes w/ introspection)
			 * @param {Object} [klass]  the new classes static/class functions
			 * @param {Object} [proto]  the new classes prototype functions
			 * @return {jQuery.Class} returns the new class
			 */
			extend: function( fullName, klass, proto ) {
				// figure out what was passed
				if ( typeof fullName != 'string' ) {
					proto = klass;
					klass = fullName;
					fullName = null;
				}
				if (!proto ) {
					proto = klass;
					klass = null;
				}

				proto = proto || {};
				var _super_class = this,
					_super = this.prototype,
					name, shortName, namespace, prototype;

				// Instantiate a base class (but only create the instance,
				// don't run the init constructor)
				initializing = true;
				prototype = new this();
				initializing = false;
				// Copy the properties over onto the new prototype
				inheritProps(proto, _super, prototype);

				// The dummy class constructor

				function Class() {
					// All construction is actually done in the init method
					if ( initializing ) return;

					if ( this.constructor !== Class && arguments.length ) { //we are being called w/o new
						return arguments.callee.extend.apply(arguments.callee, arguments);
					} else { //we are being called w/ new
						return this.Class.newInstance.apply(this.Class, arguments);
					}
				}
				// Copy old stuff onto class
				for ( name in this ) {
					if ( this.hasOwnProperty(name) && $.inArray(name, ['prototype', 'defaults', 'getObject']) == -1 ) {
						Class[name] = this[name];
					}
				}

				// do static inheritance
				inheritProps(klass, this, Class);

				// do namespace stuff
				if ( fullName ) {

					var parts = fullName.split(/\./),
						shortName = parts.pop(),
						current = $.Class.getObject(parts.join('.')),
						namespace = current;

					current[shortName] = Class;
				}

				// set things that can't be overwritten
				$.extend(Class, {
					prototype: prototype,
					namespace: namespace,
					shortName: shortName,
					constructor: Class,
					fullName: fullName
				});

				//make sure our prototype looks nice
				Class.prototype.Class = Class.prototype.constructor = Class;


				/**
				 * @attribute fullName 
				 * The full name of the class, including namespace, provided for introspection purposes.
				 * @codestart
				 * $.Class.extend("MyOrg.MyClass",{},{})
				 * MyOrg.MyClass.shortName //-> 'MyClass'
				 * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
				 * @codeend
				 */

				var args = Class.setup.apply(Class, [_super_class].concat($.makeArray(arguments)));

				if ( Class.init ) {
					Class.init.apply(Class, args || []);
				}

				/* @Prototype*/
				return Class;
				/** 
				 * @function setup
				 * Called with the same arguments as new Class(arguments ...) when a new instance is created.
				 * @codestart
				 * $.Class.extend("MyClass",
				 * {
				 *    setup: function( val ) {
				 *       this.val = val;
				 *    }
				 * })
				 * var mc = new MyClass("Check Check")
				 * mc.val //-> 'Check Check'
				 * @codeend
				 * 
				 * <div class='whisper'>PRO TIP: 
				 * Setup functions are used to normalize constructor arguments and provide a place for
				 * setup code that extending classes don't have to remember to call _super to
				 * run.
				 * </div>
				 * 
				 * @return {Array|undefined} If an array is return, [jQuery.Class.prototype.init] is 
				 * called with those arguments; otherwise, the original arguments are used.
				 */
				//break up
				/** 
				 * @function init
				 * Called with the same arguments as new Class(arguments ...) when a new instance is created.
				 * @codestart
				 * $.Class.extend("MyClass",
				 * {
				 *    init: function( val ) {
				 *       this.val = val;
				 *    }
				 * })
				 * var mc = new MyClass("Check Check")
				 * mc.val //-> 'Check Check'
				 * @codeend
				 */
				//Breaks up code
				/**
				 * @attribute Class
				 * References the static properties of the instance's class.
				 * <h3>Quick Example</h3>
				 * @codestart
				 * // a class with a static classProperty property
				 * $.Class.extend("MyClass", {classProperty : true}, {});
				 * 
				 * // a new instance of myClass
				 * var mc1 = new MyClass();
				 * 
				 * //
				 * mc1.Class.classProperty = false;
				 * 
				 * // creates a new MyClass
				 * var mc2 = new mc.Class();
				 * @codeend
				 * Getting static properties via the Class property, such as it's 
				 * [jQuery.Class.static.fullName fullName] is very common.
				 */
			}

		});

        /**
	     * Adds to the object an attribute which name and defaultValue are specified.
	     * But this special attribute triggers an event (named 'attrName'-change) when changed.
	     * 
	     * It's also bindable to functions.
	     * 
	     * @param obj The concerned object.
	     * @param attrName The created attribute name.
	     * @param defaultValue The attribute default value.
	     */
        $.makeBindable = function(obj, attrName, defaultValue) {
        	if (Object['defineProperty']){
        		// Javascript >= 1.8.5
                // Adds an non-configurable, non-enumerable attribute, to store the data used by getter/setters.
                Object.defineProperty(obj, '_'+attrName,{
                        value : defaultValue,
                        writable : true
                });
            } else {
        		// Javascript < 1.8.5
            	obj['_'+attrName] = defaultValue;
        	}

            // Creates the getter
            obj.__defineGetter__(attrName, function() {
            	return this['_'+attrName];
	        });
	        // Creates the setter that trigger the event
	        obj.__defineSetter__(attrName, function(value) {
	        	var oldValue = this['_'+attrName];
	        	this['_'+attrName] = value;
	        	$(this).trigger(attrName+'-change', [value, oldValue]);
	        });
        }; // makeBindable().

        /**
	     * Bound a function to changes from an attribute.
	     * Every time the attribute is modified, then the function is called with 
	     * following parameters:
	     * 1 - event The change event.
	     * 2 - newValue Attribute's new value.
	     * 3 - oldValue Attribute's old value.
	     * 
	     * @param obj Concerned object.
	     * @param attrName The bound attribute.
	     * @param method Method bound to the attribute's changes
	     */
        $.bindAttribute = function(obj, attrName, method) {
    		$(obj).bind(attrName+'-change', method);
        }; // bindAttribute().
        
		jQuery.Class.prototype.
		/**
		 * @function callback
		 * Returns a callback function. 
		 * @see [jQuery.Class.static.callback].
		 * The only difference is this callback works
		 * on a instance instead of a class.
		 * @param {String|Array} fname If a string, it represents the function to be called.  
		 * If it is an array, it will call each function in order and pass the return value of the prior function to the
		 * next function.
		 * @return {Function} the callback function
		 */
		callback = jQuery.Class.callback;

		//module's exports
		return jQuery.Class;
});

