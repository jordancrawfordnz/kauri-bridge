'use strict';

var dateFormat = require('dateformat')

if (!process.argv[2]) {
	console.log("node repeattest.js [device] [keep trying, default: false]");
	process.exit();
}

var SmartCircuit = require('./interaction.js');
var smartCircuitDevice = new SmartCircuit(process.argv[2]);
var keepTrying = process.argv[3];

function tsLog(message) {
	console.log(dateFormat(new Date(), "isoDateTime") + ": " + message);
}

// Does a repeated test of the SmartCircuit device.
function repeatedTest() {
	var test = function() {
		smartCircuitDevice.clearMemory().then(function() {
			setTimeout(function() {
				smartCircuitDevice.getMemory().then(function(data) {
					if (data.length === 0) {
						tsLog("No readings.");
					} else {
						var totalReadings = data.length;
						var last = data[data.length - 1];
						tsLog("Total readings: " + totalReadings + 
						", power: " + last.power + "W, voltage: " +
						last.voltage + "V, current: " + last.current +
						"A, power factor: " + last.powerFactor +
						", frequency: " + last.frequency + " Hz.");
					}
				}, function(error) {
					tsLog("Got error while trying to get memory.");
					tsLog(error);

					if (!keepTrying) {
						process.exit();	
					}
				});
			}, 2*1000);
		}, function(error) {
			tsLog("Got error while trying to clear memory.");
			tsLog(error);

			if (!keepTrying) {
				process.exit();	
			}
		});
	};

	test();
	setInterval(test, 4*1000);
}

repeatedTest();