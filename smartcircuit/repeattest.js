'use strict';

var LogContext = require('../logcontext.js');

if (!process.argv[2]) {
	console.log('node repeattest.js [device] [keep trying, default: false]');
	process.exit();
}

var SmartCircuit = require('./driver.js');
var logContext = new LogContext('SmartCircuit RepeatTest');
var smartCircuitDevice = new SmartCircuit(process.argv[2], logContext.descend('Driver'));
var keepTrying = process.argv[3];

// Does a repeated test of the SmartCircuit device.
function repeatedTest() {
	var test = function() {
		smartCircuitDevice.clearMemory().then(function() {
			setTimeout(function() {
				smartCircuitDevice.getMemory().then(function(data) {
					if (data.length === 0) {
						logContext.log('No readings.');
					} else {
						var totalReadings = data.length;
						var last = data[data.length - 1];
						logContext.log('Total readings: ' + totalReadings + 
						', power: ' + last.power + 'W, voltage: ' +
						last.voltage + 'V, current: ' + last.current +
						'A, power factor: ' + last.powerFactor +
						', frequency: ' + last.frequency + ' Hz.');
					}
				}, function(error) {
					logContext.log('Got error while trying to get memory.');
					logContext.log(error);

					if (!keepTrying) {
						process.exit();	
					}
				});
			}, 2*1000);
		}, function(error) {
			logContext.log('Got error while trying to clear memory.');
			logContext.log(error);

			if (!keepTrying) {
				process.exit();	
			}
		});
	};

	test();
	setInterval(test, 4*1000);
}

repeatedTest();