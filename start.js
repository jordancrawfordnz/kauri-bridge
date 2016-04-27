'use strict';

var LogContext = require('./logcontext.js');
var Configuration = require('./configuration.js');
var colors = require('colors/safe');
var DeviceObjects = require('./deviceobjects.js');
var APIInteraction = require('./apiinteraction.js');
var Timing = require('./timing.js');

// This will add the well-known CAs
// to `https.globalAgent.options.ca`
require('ssl-root-cas/latest')
  .inject()
  .addFile('sca.server3.crt'); // required for engmon.cms.waikato.ac.nz

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

// Setup API interaction.
var apiInteraction = new APIInteraction(Configuration.current.apiInteraction, logContext.descend('API Interaction'));

var devices = [];

// Setup the poll timer.
Timing.startMinutelyTimer(Configuration.current.devicePollFrequency, function() {
	apiInteraction.resetReading(Math.floor(new Date().getTime() / 1000)); // reset the reading to use for this timestamp.
	
	// Fetch from each device then queue the data in API interaction.
	devices.forEach(function(device) {
		device.fetch().then(function(sensorData) {
			apiInteraction.queueSensorData(sensorData); // queue the data to be sent off.
		});
	});
}, logContext.descend('Poll Timer'));

// Setup the data send timer.
Timing.startMinutelyTimer(Configuration.current.dataSendFrequency, function() {
	apiInteraction.sendReadings();
}, logContext.descend('Data Send Timer'));

// Setup each device.
Configuration.current.devices.forEach(function(deviceConfig) {
	var deviceLogContext = logContext.descend(deviceConfig.name);
	
	// Find the device object to use.
	var deviceObject = DeviceObjects[deviceConfig.type];
	if (!deviceObject) {
		logContext.log('Unknown device type.');
		return;
	}

	deviceLogContext.log('Setting up.');
	devices.push(new deviceObject(deviceConfig, deviceLogContext));
});
