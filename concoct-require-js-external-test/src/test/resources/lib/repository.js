define([ 'lib/class', 'lib/jquery/jquery.pnotify' ], function(Class) {

	/**
	 * Repository class are designed to send ajax requests in order to retreive/send data from/to server
	 * Since they are stateless, they only define static vars and functions
	 * Default data format is json
	 * 
	 * Usage :
	 * 
	 * 		Repository.extend("BookingRepository", {
	 *			root : 'api/booking/'
	 *		}, {});
	 *
	 *  	BookingRepository.read(callback, id);
	 *  
	 *  Be carefull about 2 points :
	 *   - Don't forget the second pair of {} in your repository declaration, it means that vars and functions declared in
	 *     the first one are static. Read Class JSdoc for more details
	 *   - you may need to use $.proxy(this, 'callback') instead just callback if you use "this" object in your callback
	 */
	return Class.extend("Repository", {

		defaults : {
			dataType : 'json',
			contentType : 'application/json; charset=utf-8'
		},

		/**
		 * Default URL root for ajax requests
		 * For example, 'api/users'
		 **/
		root : '',
		
		init : function() {
			this.root = this.root || '';
            // Avoid GET caching issues with Internet Explorer
            if($.browser.msie) {
                $.ajaxSetup({ cache: false });
            }
		},
		read : function(callback, id, errorCallback, settings) {
			return this._get(this.root + id, callback, errorCallback, settings);
		},
		remove : function(callback, id, errorCallback, settings) {
			return this._delete(this.root + id, callback, errorCallback, settings);
		},
		save : function(callback, data, errorCallback, settings) {
			return this._post(this.root, callback, data, errorCallback, settings);

		},
		update : function(callback, id, data, errorCallback, settings) {
			return this._put(this.root + id, callback, data, errorCallback, settings);
		},
		list: function(callback, page, size, settings) {
			page = page===null || page===undefined ? 0 : page;
			size = size===null || size===undefined ? 5 : size;
			this._get(this.root + '?page=' + page + '&size=' + size, callback, settings);
		},		
		listAll: function(callback, settings) {
			this._get(this.root + 'all', callback, settings);
		},

		_post : function(url, callback, data, errorCallback, settings) {
			this._ajax(url, callback, 'POST', data, errorCallback, settings);
			return this;
		},

		_get : function(url, callback, errorCallback, settings) {
			this._ajax(url, callback, 'GET', null, errorCallback, settings);
			return this;
		},

		_put : function(url, callback, data, errorCallback, settings) {
			this._ajax(url, callback, 'PUT', data, errorCallback, settings);
			return this;
		},

		_delete : function(url, callback, errorCallback, settings) {
			this._ajax(url, callback, 'DELETE', null, errorCallback, settings);
			return this;
		},

		/**
		 * Perform basic ajax request and call your widget back.
		 */
		_ajax : function(url, callback, type, data, errorCallback, settings) {
			var _settings = {
				url : url,
				dataType : this.defaults.dataType,
				contentType : this.defaults.contentType,
				type : type,
				data : data,
				success : callback
			};
			if (errorCallback) {
				_settings.error = errorCallback;
			} else {
				// Default callback.
				_settings.error = function(XMLHttpRequest, textStatus, errorThrown) {
					var error = {
							pnotify_title: 'Server problem',
							pnotify_text: 'The action cannot be realized:\n',
							pnotify_type: 'error'
						};
					error.pnotify_text += errorThrown ? errorThrown : textStatus;
					$.pnotify(error);
				};
			}
			if (settings) {
				$.extend(true, _settings, settings);
			}
			$.ajax(_settings);
		}
	}, {});
});
