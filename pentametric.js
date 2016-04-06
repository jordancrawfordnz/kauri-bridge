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
var requestTimeout = 500;

var pentametricSerialPromise = null;
var currentRequest = null;

// Setup an object for the serial port.
var pentametricSerialOptions = {
	baudRate : baudRate,
	dataBits : dataBits,
	parity: parity
};

// Returns a promise containing the voltage at the address.
function getVoltageReading(id) {
	return requestData(id,2).then(function(data) {
		return data/20;
	});
}

var processingQueue = [];

// Adds a request to the processing queue.
	// Returns a promise.
function requestData(address, bytesToGet) {
	var deferred = Deferred();
	var request = {
		address : address,
		bytesToGet : bytesToGet,
		deferred : deferred,
		receivedData : new Buffer([])
	};
	processingQueue.push(request);
	request.timeout = setTimeout(function() {
		var index = processingQueue.indexOf(request);
		if (index !== -1) { // if the request is still around.
			processingQueue.splice(index, 1); // remove the request from the queue.
		}
	}, requestTimeout);

	// If this is the only item on the queue.
	if (processingQueue.length === 1) {
		// Start the queue processing.
		processQueue();
	}
	return deferred.promise;
};

function processQueue() {
	if (processingQueue.length > 0) {

	getDevice().then(function(device) {
		// Process while there are items in the queue.	
		var task = processingQueue[0];
			var checksum = 255 - readCommand - task.address - task.bytesToGet;

			device.write([readCommand, task.address, task.bytesToGet, checksum], function(error) {
				if (error) {
					task.deferred.reject(error);
				}
			});
	});
	}
}

// Hander for data received on the serial port.
function onData(data) {
    // If we are expecting some data.
    if (processingQueue.length > 0) {
    	var task = processingQueue[0];
		task.receivedData = Buffer.concat([task.receivedData, data]);

    	// If we have received the expected number of bits plus a checksum.
    	if (task.receivedData.length === task.bytesToGet + 1) {
			// Check the checksum.
			var total = 0;
			for (var value of task.receivedData.values()) {
				total += value;	
			}
			if (total === 255) {
				// Convert the raw data to a number.
				var result = 0;
                for (var i = task.bytesToGet - 1; i >= 0; i--) {
                    result <<= 8;
                    result |= task.receivedData[i];
                }

				task.deferred.resolve(result);
			} else {
				task.deferred.reject("An error occured in transmission. Invalid checksum.");
			}

			clearTimeout(task.timeout); // no need to auto-expire now.
			
			// Move on to the next item.
			processingQueue.shift();
			processQueue();	
    	}
    }
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
function getReadings() {
	getVoltageReading(1).then(function(volt1) {
		getVoltageReading(2).then(function(volt2) {
			console.log("Volt1: " + volt1.toFixed(2) + ", Volt2: " + volt2.toFixed(2));		});
	});
}
getReadings();
setInterval(getReadings, 500);
