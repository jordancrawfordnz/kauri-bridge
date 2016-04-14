'use strict';

if (!process.argv[2]) {
	console.log("node singletest.js [device]");
	process.exit();
}

var SmartCircuit = require('./driver.js');
var smartCircuitDevice = new SmartCircuit(process.argv[2]);

// Outputs data received from the memory of the SmartCircuit and exits.
function singleTest() {
	console.log("Requesting memory cleared then get memory contents.");
	smartCircuitDevice.clearMemory().then(function() {
		console.log("Memory cleared. Waiting...");
		setTimeout(function() {
			smartCircuitDevice.getMemory().then(function(data) {
				console.log("Data received:");
				console.log(data);
				process.exit();
			}, function(error) {
				console.log("Got error while trying to get memory.");
				console.log(error);
				process.exit();
			});
		}, 5*1000);
	}, function(error) {
		console.log("Got error while trying to clear memory.");
		console.log(error);
		process.exit();
	});
}

singleTest();