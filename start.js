'use strict';

var LogContext = require('./logcontext.js');
var Configuration = require('./configuration.js');
var colors = require('colors/safe');
var DeviceObjects = require('./deviceobjects.js');

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

// TODO: Setup API communication / data handling.

// TODO: use something real
function sendSensorData(sensorId, sensorValue) {
	logContext.log('Got sensor data back. id: ' + sensorId + ', value: ' + sensorValue);
};

Configuration.current.devices.forEach(function(deviceConfig) {
	var deviceLogContext = logContext.descend(deviceConfig.name);
	
	// Find the device object to use.
	var deviceObject = DeviceObjects[deviceConfig.type];
	if (!deviceObject) {
		logContext.log('Unknown device type.');
		return;
	}

	deviceLogContext.log('Setting up.');
	var device = new deviceObject(deviceConfig, sendSensorData, deviceLogContext);

	deviceLogContext.log('Start.');
	device.start();
});