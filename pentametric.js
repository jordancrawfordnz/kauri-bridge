'use strict';

console.log("Bogart Engineering Pentametric driver loaded.");

var SerialPort = require('serialport')
var SerialPortObject = SerialPort.SerialPort;
var Promise = require('promise');

var device = "/dev/ttyUSB0";
var baudRate = 2400;
var parity = "none";
var dataBits = 8;
var timeout = 5;

var pentametricSerialPromise = null;
var currentRequest = null;

// Setup an object for the serial port.
var pentametricSerialOptions = {
	baudRate : baudRate,
	dataBits : dataBits,
	parity: parity
};

function readData(address, bitsToGet) {
	getDevice().then(function(device) {
		console.log("Requesting data at address: " + address);
		console.log("Getting: " + bitsToGet + " bits.");

		// TODO: Manage a request object.

		// currentRequest = new Promise(function() {

		// });
		// TODO: compute checksum

	console.log(device);
		console.log('about to write.');
		device.write([0x81, 0x03, 0x02, 0x79]);
		//device.write([129,3,2,121], function(error) {
		//	console.log('error from write');
		//	console.log(error);
		//});
		console.log('wrote to device.');
		});
}

// Returns a promise containing the open serial device.
function getDevice() {
	if (!pentametricSerialPromise) {
		pentametricSerialPromise = new Promise(function(resolve, reject) {
			var pentametricSerial = new SerialPortObject(device,
				pentametricSerialOptions,
				true,
				function(error) {
			        if (error) {
		                console.log("Error opening Pentametric device.");
		                console.log(error);
		                reject(error);
			        } else {
			        	console.log("Opened Pentametric device successfully.");
		                pentametricSerial.on("data", function(data) {
		                	console.log("Got data from serial:");
		                	console.log(data);
		                });

		                resolve(pentametricSerial);
			        }
				}
			);
		});
	}
	return pentametricSerialPromise;
}


readData();
setInterval(readData, 5000);
