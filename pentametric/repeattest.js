'use strict';

var dateFormat = require('dateformat')

if (!process.argv[2]) {
	console.log("node repeattest.js [device] [keep trying, default: false]");
	process.exit();
}

var Pentametric = require('./interaction.js');
var test = require('./test.js');
var keepTrying = process.argv[3];
var pentametricDevice = new Pentametric(process.argv[2]);

function tsLog(message) {
	console.log(dateFormat(new Date(), "isoDateTime") + ": " + message);
}

// Does a repeated test of the Pentametric device.
function repeatedTest() {
	var test = function() {
		test.singleTest(pentametricDevice).then(function(allData) {
			tsLog(test.dataToString(allData));
		}, function(error) {
			tsLog("An error occured.");
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