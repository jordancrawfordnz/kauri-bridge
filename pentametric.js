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

// Returns a promise containing the voltage at the address.
Pentametric.prototype.getVoltageReading = function(id) {
	return this.requestData(id, 2).then(function(data) {
		return data / 20;
	});
};

Pentametric.prototype.getCurrentReading = function(id) {
	id -= 4;
	return this.requestData(id, 2).then(function(data) {
   		// From Mohammed Alahmari's original code.
   		var sign = amp1 >> 23;
    	amp &= 0x7fffff;
    	if (sign != 0)
    	{
        	amp |= 0xff800000;
    	}
		return -(amp1) / 1000.0;
	});	
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

// Process the top task in the queue.
Pentametric.prototype.processQueue = function() {
	if (this.processingQueue.length > 0) {
		var _this = this;
		this.getConnection().then(function(connection) {
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
			   		// From Mohammed Alahmari's original code.
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
Pentametric.prototype.getConnection = function() {
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
		                
		                // handle incoming data with the onData function.
		                pentametricSerial.on("data", function(data) {
		                	_this.onData(data);
		                });

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

module.exports = Pentametric;