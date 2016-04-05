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
var readCommand = 0x81;

var pentametricSerialPromise = null;
var currentRequest = null;

// Setup an object for the serial port.
var pentametricSerialOptions = {
	baudRate : baudRate,
	dataBits : dataBits,
	parity: parity
};

// Returns a promise containing the battery 1 volts.
function getVolt1Reading() {
	readData(1,2); // TODO: promise and convert result.
}

function readData(address, bitsToGet) {
	getDevice().then(function(device) {
		console.log("Requesting data at address: " + address);
		console.log("Getting: " + bitsToGet + " bits.");

		// TODO: Manage a request object.
		// currentRequest = new Promise(function() {

		var checksum = 255 - readCommand - address - bitsToGet;
		console.log("checksum");
		console.log(checksum);

		device.write([readCommand, address, bitsToGet, checksum], function(error) {
			if (error) {
				console.log("An error occured while writing to the serial device.");
				console.log(error);
			}
		});
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

getVolt1Reading();
setInterval(getVolt1Reading, 5000);
