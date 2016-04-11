'use strict';

if (!process.argv[2]) {
	console.log("node repeattest.js [device]");
	process.exit();
}

var SmartCircuit = require('./interaction.js');
var smartCircuitDevice = new SmartCircuit(process.argv[2]);

// Does a repeated test of the SmartCircuit device.
function repeatedTest() {
	var test = function() {
		smartCircuitDevice.clearMemory().then(function() {
			setTimeout(function() {
				smartCircuitDevice.getMemory().then(function(data) {
					console.log(data);
				}, function(error) {
					console.log("Got error while trying to get memory.");
					console.log(error);
					process.exit();
				});
			}, 3*1000);
		}, function(error) {
			console.log("Got error while trying to clear memory.");
			console.log(error);
			process.exit();
		});
	};

	test();
	setInterval(test, 4*1000);
}

repeatedTest();