/**
 * Minimal CommonJS console implementation.
 * Doesn't support advanced feature if not available through original console
 * @see http://wiki.commonjs.org/wiki/Console
 * @author Florian Traverse, Damien Feugas
 */
'use strict';

define(['lib/jquery'], function() {
	
	/**
	 * Defines the logger configuration.
	 * 
	 * This map takes logger name as key, and level as value. The logger name is found in log messages, 
	 * between brackets:
	 * 		console.info('[logger.name] My info to log');
	 * [logger.name] is searched into this map, and if found, the log level is eventually filtered.
	 * If the name is not found, or if there is no logger name, the log is displayed.
	 * 
	 * levels are (level: authorized methods)
	 * - all: console.debug(), console.info(), console.warn(), console.error()
	 * - debug: console.debug(), console.info(), console.warn(), console.error()
	 * - info: console.info(), console.warn(), console.error()
	 * - warn: console.warn(), console.error()
	 * - error: console.error()
	 * - none: no logs
	 */
	window.LOGGER_CONF = {	
	};
	
	/**
	 * Checks if a log command may be displayed or not.
	 * Depends on the log command and the level desired.
	 * 
	 * @param commandName Filtered log command: 'debug', 'info', 'warn', 'error'.
	 * @param level Desired level: 'all', 'debug', 'info', 'warn', 'error', 'none'.
	 * 
	 * @return True if the command must be displayed, false otherwise.
	 */
	$.isLogEnabled = function(commandName, level) {
		var order={'all':0, 'debug':1, 'info':2, 'warn':3, 'error':4, 'off':5};
		return order[commandName] >= (level in order ? order[level] : 0);
	};
	
	var logger, notSupported = function() {};
	logger = ((typeof console === "object") && (typeof console.log === "function")) ? console : {log: notSupported };
	

	//for non-modules
	if(typeof window === "object" && !((typeof console === "object") && (typeof console.log === "function" )))
		window.console = logger;
	
	
	/**
	 * Wraps the original log command with an anonym method that behave likes an Around AOP advisor.
	 * Do not execute the wrapped method if a logger.name is found and configured to be filtered.
	 * If the original log command is not available, use an empty method.
	 * 
	 * @param commandName
	 */
	var wrap = function(commandName) {
		var original = window.console && commandName in window.console ? window.console[commandName] : logger.log;
		var originalObj = window.console || logger;
		logger[commandName] = function(){
			// Gets the first part that define logger.
			var loggerName = arguments.length >= 1 && typeof(arguments[0]) == 'string'? arguments[0]
				.substring(1, arguments[0].indexOf(']')): null;
			// Filter if the logger name exists, is found in the conf, and if the level is suffisant
			if (loggerName == null || !(loggerName in LOGGER_CONF) || 
					$.isLogEnabled(commandName, LOGGER_CONF[loggerName])) {
				original.apply(originalObj, arguments);
			}
		};
	};
	
	/**
	 * Method to add a fallback behaviour if a command is not supported.
	 * 
	 * @param command The log command.
	 * @return The command, or its fallback if not supported.
	 */
	var fallback = function(command) {
		return window.console && command in window.console ? window.console[command] : notSupported;
	};
	
	// log features
	wrap('debug');
	wrap('info');
	wrap('warn');
	wrap('error');
	
	// other features that ar not log related
	logger.trace = fallback('trace');
	logger.assert = fallback('assert');
	logger.dir = fallback('dir');
	logger.dirxml = fallback('dirxml');
	logger.group = fallback('group');
	logger.groupEnd = fallback('groupEnd');
	logger.time = fallback('time');
	logger.timeEnd = fallback('timeEnd');
	logger.profile = fallback('profile');
	logger.profileEnd = fallback('profileEnd');
	logger.count = fallback('count');
		
	return logger;
});
