'use strict';

var LogContext = require('../logcontext.js');

if (!process.argv[2]) {
	console.log('node repeattest.js [device] [keep trying, default: false]');
	process.exit();
}

var Pentametric = require('./driver.js');
var test = require('./test.js');
var keepTrying = process.argv[3];
var logContext = new LogContext('Pentametric RepeatTest');
var pentametricDevice = new Pentametric(process.argv[2], logContext.descend('Driver'));

// Does a repeated test of the Pentametric device.
function repeatedTest() {
	var runTest = function() {
		test.singleTest(pentametricDevice).then(function(allData) {
			logContext.log(test.dataToString(allData));
		}, function(error) {
			logContext.log('An error occured.');
			logContext.log(error);
			if (!keepTrying) {
				process.exit();
			}
		});
	};

	runTest();
	setInterval(runTest, 1*1000);
}

repeatedTest();
