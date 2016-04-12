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
	this.pentametricSerialPromise = null;
	var _this = this;
	this.serialQueue = new SerialQueue(function(request) {
		_this.getConnection().then(function(connection) {
			// Process while there are items in the queue.	
			var checksum = 255 - readCommand - request.address - request.bytesToGet;

			connection.write([readCommand, request.address, request.bytesToGet, checksum], function(error) {
				if (error) { // Reject the request if an error occurs writing to the serial port.
					task.deferred.reject(error);
				}
			});
		}, function(error) {
			request.deferred.reject(error); // reject the request due to the connection error.
		});
	});
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
Pentametric.prototype.queueCommand = function(address, bytesToGet) {
	var deferred = Deferred();
	this.serialQueue.add({
		address : address,
		bytesToGet : bytesToGet,
		deferred : deferred,
		receivedData : new Buffer([])
	}, requestTimeout);

	return deferred.promise;
};

// Hander for data received on the serial port.
Pentametric.prototype.onData = function(data) {
    var current = this.serialQueue.current();
    if (current) { // if expecting some data
    	current.receivedData = Buffer.concat([current.receivedData, data]);

    	// If we have received the expected number of bits plus a checksum.
    	if (current.receivedData.length === current.bytesToGet + 1) {
			// Check the checksum.
			var total = 0;
			for (var value of current.receivedData.values()) {
				total += value;	
			}
			if (total === 255) {
				// Convert the raw data to a number.
			   		// From Mohammed Alahmari's original code.
				var result = 0;
                for (var i = current.bytesToGet - 1; i >= 0; i--) {
                    result <<= 8;
                    result |= current.receivedData[i];
                }

				current.deferred.resolve(result);
			} else {
				current.deferred.reject("An error occured in transmission. Invalid checksum.");
			}

			this.serialQueue.next();
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