'use strict';

console.log("Bogart Engineering Pentametric driver loaded.");

var SerialPort = require('serialport')
var SerialPortObject = SerialPort.SerialPort;

var device = "/dev/ttyUSB0";
var baudRate = 2400;
var parity = "none";
var dataBits = 8;
var timeout = 5;

/* SerialPort.list(function(error, devices) {
	console.log("avaliable devices:");
	console.log(devices);
}); */

// Setup an object for the serial port.
var pentametricSerialOptions = {
	baudRate : baudRate,
	dataBits : dataBits,
	parity: parity
};

function readData(address, bitsToGet) {
	console.log("Requesting data at address: " + address);
	console.log("Getting: " + bitsToGet + " bits.");
}

var pentametricSerial = new SerialPortObject(device, pentametricSerialOptions, true, function(error) {
        if (error) {
                console.log("An error occured opening the PentaMetric device.");
                console.log(error);
        } else {
                console.log("Opened PentaMetric device successfully.");
        }
});


