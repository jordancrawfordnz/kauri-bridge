'use strict';

var Configuration = require("./configuration.js");

console.log("OffGridMonitoring Bridge");
console.log("Jordan Crawford 2016");

var configurationFile = process.argv[2];

if (!configurationFile) {
	console.log("Usage: node . [configuration file path]");
	process.exit();
}

// Load in the configuration file.
Configuration.load(configurationFile);

console.log("Loaded configuration file: " + Configuration.current.name);

console.log("sensors");
Configuration.current.sensors.forEach(function(sensor) {
	console.log("Setting up sensor: " + sensor.name);


	console.log("current sensor");
	console.log(sensor);
});