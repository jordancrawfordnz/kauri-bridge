'use strict';

var LogContext = require('./logcontext.js');
var Configuration = require('./configuration.js');
var colors = require('colors/safe');

console.log(colors.green('Off Grid Monitoring') + ': Bridge');
console.log(colors.dim('Jordan Crawford, 2016'));

var configurationFile = process.argv[2];

if (!configurationFile) {
	console.log('Usage: node . [configuration file path]');
	process.exit();
}

// Load in the configuration file.
Configuration.load(configurationFile);

var logContext = new LogContext(['Bridge']);
logContext.log('Loaded configuration file: ' + Configuration.current.name + ' from "' + configurationFile + '"');
logContext = logContext.descend(Configuration.current.name); // include the configuration name in the logContext

console.log("devices");
Configuration.current.devices.forEach(function(device) {
	var deviceLogContext = logContext.descend(device.name);
	deviceLogContext.log('Setting up.');


	console.log("current device");
	console.log(device);
});