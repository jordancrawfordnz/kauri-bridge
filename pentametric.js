'use strict';

console.log("Bogart Engineering Pentametric driver loaded.");

var SerialPort = require('serialport')
var SerialPortObject = SerialPort.SerialPort;
var Promise = require('promise');
var Deferred = require('deferred')

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
	requestData(1,2); // TODO: promise and convert result.
}


var processingQueue = [];

// Adds a request to the processing queue.
	// Returns a promise.
function requestData(address, bitsToGet) {
	var deferred = Deferred();
	processingQueue.push({
		address : address,
		bitsToGet : bitsToGet,
		deferred : deferred
	});
	// If this is the only item on the queue.
	if (processingQueue.length === 1) {
		// Start the queue processing.
		processingQueue();
	}
	return deferred.promise;
};

function processQueue() {
	getDevice().then(function(device) {
		// Process while there are items in the queue.
		while (processingQueue.length > 0) {
			var task = processingQueue[0];
			
			console.log("Requesting data at address: " + task.address);
			console.log("Getting: " + task.bitsToGet + " bits.");

			var checksum = 255 - readCommand - task.address - task.bitsToGet;

			device.write([readCommand, task.address, task.bitsToGet, checksum], function(error) {
				if (error) {
					task.deferred.reject(error);
				}
			});

			// Shift the item off the front of the queue.
			processingQueue.shift();
		}
	}
}

// Hander for data received on the serial port.
function onData(data) {
	console.log("Got data from serial:");
    console.log(data);
}

// // Makes a request for data at an address, getting a particular number of bits.
// 	// Returns a promise containing the data received.
// function readData(address, bitsToGet) {
// 	getDevice().then(function(device) {
// 		console.log("Requesting data at address: " + address);
// 		console.log("Getting: " + bitsToGet + " bits.");

// 		// TODO: Manage a request object.
// 		// currentRequest = new Promise(function() {

// 		console.log("checksum");
// 		console.log(checksum);

		
// 	});
// }

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
		                pentametricSerial.on("data", onData); // handle incoming data with the onData function.
		                resolve(pentametricSerial);
			        }
				}
			);
		});
	}
	return pentametricSerialPromise;
}

// Testing:
getVolt1Reading();
setInterval(getVolt1Reading, 5000);
