'use strict';

var LogContext = require('../../lib/logcontext.js');

if (!process.argv[2]) {
  console.log('node singletest.js [device]');
  process.exit();
}

var Pentametric = require('./driver.js');
var test = require('./test.js');
var logContext = new LogContext('Pentametric SingleTest');
var pentametricDevice = new Pentametric(process.argv[2], logContext.descend('Driver'));

test.singleTest(pentametricDevice).then(function(data) {
  console.log(test.dataToString(data));
  process.exit();
}, function(error) {
  logContext.log('An error occured.');
  logContext.log(error);
});
