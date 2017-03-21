'use strict';

var LogContext = require('../../src/lib/logcontext.js');

if (!process.argv[2]) {
  console.log('node singletest.js [device]');
  process.exit();
}

var SmartCircuit = require('./driver.js');
var logContext = new LogContext('SmartCircuit SingleTest');
var smartCircuitDevice = new SmartCircuit(process.argv[2], logContext.descend('Driver'));

// Outputs data received from the memory of the SmartCircuit and exits.
function singleTest() {
  logContext.log('Requesting memory cleared then get memory contents.');

  smartCircuitDevice.clearMemory().then(function() {
    logContext.log('Memory cleared. Waiting...');

    setTimeout(function() {
      smartCircuitDevice.getMemory().then(function(data) {
        logContext.log('Data received:');
        logContext.log(data);

        process.exit();
      }, function(error) {
        logContext.log('Got error while trying to get memory.');
        logContext.log(error);

        process.exit();
      });
    }, 5*1000);
  }, function(error) {
    logContext.log('Got error while trying to clear memory.');
    logContext.log(error);
    process.exit();
  });
}

singleTest();
