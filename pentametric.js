'use strict';

var SerialPort = require('serialport')
var SerialPortObject = SerialPort.SerialPort;
var Promise = require('promise');
var Deferred = require('deferred')

var baudRate = 2400;
var parity = "none";
var dataBits = 8;
var timeout = 5;
var readCommand = 0x81;
var requestTimeout = 500;

// Setup an object for the serial port.
var pentametricSerialOptions = {
	baudRate : baudRate,
	dataBits : dataBits,
	parity : parity
};

var Pentametric = function(device) {
	this.device = device;
	this.processingQueue = [];
	this.pentametricSerialPromise = null;
};

// Adds a request to the processing queue.
	// Returns a promise.
Pentametric.prototype.requestData = function(address, bytesToGet) {
	var deferred = Deferred();
	var request = {
		address : address,
		bytesToGet : bytesToGet,
		deferred : deferred,
		receivedData : new Buffer([])
	};
	this.processingQueue.push(request);
	var _this = this;
	request.timeout = setTimeout(function() {
		var index = _this.processingQueue.indexOf(request);
		if (index !== -1) { // if the request is still around.
			_this.processingQueue.splice(index, 1); // remove the request from the queue.
		}
	}, requestTimeout);

	// If this is the only item on the queue.
	if (this.processingQueue.length === 1) {
		// Start the queue processing.
		this.processQueue();
	}
	return deferred.promise;
};

// Returns a promise containing the voltage at the address.
Pentametric.prototype.getVoltageReading = function(id) {
	return this.requestData(id, 2).then(function(data) {
		return data / 20;
	});
};

// Process the top task in the queue.
Pentametric.prototype.processQueue = function() {
	if (this.processingQueue.length > 0) {
		var _this = this;
		this.openDevice().then(function(connection) {
			// Process while there are items in the queue.	
			var task = _this.processingQueue[0];
				var checksum = 255 - readCommand - task.address - task.bytesToGet;

				connection.write([readCommand, task.address, task.bytesToGet, checksum], function(error) {
					if (error) {
						task.deferred.reject(error);
					}
				});
		});
	}
};

// Hander for data received on the serial port.
Pentametric.prototype.onData = function(data) {
    // If we are expecting some data.
    if (this.processingQueue.length > 0) {
    	var task = this.processingQueue[0];
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
			this.processingQueue.shift();
			this.processQueue();	
    	}
    }
}

// Returns a promise containing the open serial device.
Pentametric.prototype.openDevice = function() {
	if (!this.pentametricSerialPromise) {
		var _this = this;
		this.pentametricSerialPromise = new Promise(function(resolve, reject) {
			var pentametricSerial = new SerialPortObject(_this.device,
				pentametricSerialOptions,
				true,
				function(error) {
			        if (error) {
		                console.log("Error opening Pentametric device.");
		                console.log(error);
		                _this.pentametricSerialPromise = null; // allow re-trying for a connection after a failure.
		                reject(error);
			        } else {
			        	console.log("Opened Pentametric device successfully.");
		                pentametricSerial.on("data", onData); // handle incoming data with the onData function.

		                // On close, require the connection to be opened again.
		                pentametricSerial.on("close", function() {
							_this.pentametricSerialPromise = null;
							console.log("Serial device closed!");
						});
						resolve(pentametricSerial);
			        }
				}
			);
		});
	}
	return this.pentametricSerialPromise;
}

var pentametric = new Pentametric("/dev/ttyUSB0");
// Testing:
function getReadings() {
	pentametric.getVoltageReading(1).then(function(volt1) {
		pentametric.getVoltageReading(2).then(function(volt2) {
			console.log("Volt1: " + volt1.toFixed(2) + ", Volt2: " + volt2.toFixed(2));		});
	});
}
getReadings();
setInterval(getReadings, 500);
