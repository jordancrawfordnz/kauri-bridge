'use strict';

var SerialPort = require('serialport')

console.log("Listing serial devices...");
SerialPort.list(function(error, devices) {
  if (error) {
    console.log("Got an error when listing devices.");
    console.log(error);
  }
  console.log(devices);
});
