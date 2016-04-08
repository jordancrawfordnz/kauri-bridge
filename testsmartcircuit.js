'use strict';

var SmartCircuit = require('./smartcircuit.js');

var smartCircuitDevice = new SmartCircuit("/dev/tty.usbserial-A1017BDG");

// Opens a SmartCircuit device and starts outputting readings.

function getReadings() {
	smartCircuitDevice.getConnection(function(connection) {
		console.log('connection opened');
	});

	smartCircuitDevice.clearMemory();
	setTimeout(function() {
		smartCircuitDevice.getMemory();
	}, 8000);
	// pentametricDevice.getVoltageReading(1).then(function(volt1) {
	// 	pentametricDevice.getVoltageReading(2).then(function(volt2) {
	// 		pentametricDevice.getCurrentReading(1).then(function(amp1) {
	// 			pentametricDevice.getCurrentReading(2).then(function(amp2) {
	// 				pentametricDevice.getCurrentReading(3).then(function(amp3) {
	// 					console.log("Volt1: " + volt1.toFixed(2) + ", Volt2: " + 
	// 						volt2.toFixed(2) + ", Amp1: " + amp1.toFixed(2) + ", Amp2: "
	// 						+ amp2.toFixed(2) + ", Amp3: " + amp3.toFixed(2));
	// 				});
	// 			});
	// 		});	
	// 	});
	// });
}
getReadings();
// setInterval(getReadings, 500);
