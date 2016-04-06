'use strict';

var Pentametric = require('./pentametric.js');

var pentametricDevice = new Pentametric("/dev/ttyUSB0");

// Opens a Pentametric device and starts outputting readings.

function getReadings() {
	pentametricDevice.getVoltageReading(1).then(function(volt1) {
		pentametricDevice.getVoltageReading(2).then(function(volt2) {
			console.log("Volt1: " + volt1.toFixed(2) + ", Volt2: " + volt2.toFixed(2));		});
	});
}
getReadings();
setInterval(getReadings, 500);
