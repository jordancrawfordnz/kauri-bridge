'use strict';

if (!process.argv[2]) {
	console.log("node singletest.js [device]");
	process.exit();
}

var Pentametric = require('./driver.js');
var test = require('./test.js');
var pentametricDevice = new Pentametric(process.argv[2]);

test.singleTest(pentametricDevice).then(function(data) {
	console.log(test.dataToString(data));
	process.exit();
}, function(error) {
	console.log("An error occured.");
	console.log(error);
});
