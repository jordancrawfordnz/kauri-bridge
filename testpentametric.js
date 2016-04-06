'use strict';

var Pentametric = require('./pentametric.js');

var pentametricDevice = new Pentametric("/dev/ttyUSB0");

// Opens a Pentametric device and starts outputting readings.

function getReadings() {
	pentametricDevice.getVoltageReading(1).then(function(volt1) {
		pentametricDevice.getVoltageReading(2).then(function(volt2) {
			pentametricDevice.getCurrentReading(1).then(function(amp1) {
				pentametricDevice.getCurrentReading(2).then(function(amp2) {
					pentametricDevice.getCurrentReading(3).then(function(amp3) {
						console.log("Volt1: " + volt1.toFixed(2) + ", Volt2: " + 
							volt2.toFixed(2) + ", Amp1: " + amp1.toFixed(2) + ", Amp2: "
							+ amp2.toFixed(2) + ", Amp3: " + amp3.toFixed(2));
					});
				});
			});	
		});
	});
}
getReadings();
setInterval(getReadings, 500);
