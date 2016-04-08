'use strict';

// TODO: Implement some kind of serial handler.
	// I provide to the SH:
		/*
			- name
			- device ID
			- 

			handles:
			- opening connections
			- managing the queue. e.g: add, next. Sets up auto-expiration

		*/

var SerialQueue = require('./serialqueue.js');
var SerialPort = require('serialport')
var SerialPortObject = SerialPort.SerialPort;
var Promise = require('promise');
var Deferred = require('deferred')

var baudRate = 115200;
var parity = "none";
var dataBits = 8;
var requestTimeout = 2000;

// Setup an object for the serial port.
var pentametricSerialOptions = {
	baudRate : baudRate,
	dataBits : dataBits,
	parity : parity,
	parser : SerialPort.parsers.readline("\r\n")
};

var SmartCircuit = function(device) {
	this.device = device;
	this.processingQueue = [];
	this.smartCircuitSerialPromise = null;
	var _this = this;
	this.serialQueue = new SerialQueue(function(request) {
		console.log('got request');
		_this.getConnection().then(function(connection) {
			console.log(request.command);
			connection.write(request.command);
		});
	});
};

// Adds a request to the processing queue.
	// Returns a promise.
// SmartCircuit.prototype.requestData = function(address, bytesToGet) {
// 	var deferred = Deferred();
// 	var request = {
// 		address : address,
// 		bytesToGet : bytesToGet,
// 		deferred : deferred,
// 		receivedData : new Buffer([])
// 	};
// 	this.processingQueue.push(request);
// 	var _this = this;
// 	request.timeout = setTimeout(function() {
// 		var index = _this.processingQueue.indexOf(request);
// 		if (index !== -1) { // if the request is still around.
// 			_this.processingQueue.splice(index, 1); // remove the request from the queue.
// 		}
// 	}, requestTimeout);

// 	// If this is the only item on the queue.
// 	if (this.processingQueue.length === 1) {
// 		// Start the queue processing.
// 		this.processQueue();
// 	}
// 	return deferred.promise;
// };

// // Process the top task in the queue.
// SmartCircuit.prototype.processQueue = function() {
// 	if (this.processingQueue.length > 0) {
// 		var _this = this;
// 		this.getConnection().then(function(connection) {
// 			// Process while there are items in the queue.	
// 			var task = _this.processingQueue[0];
// 				var checksum = 255 - readCommand - task.address - task.bytesToGet;

// 				connection.write([readCommand, task.address, task.bytesToGet, checksum], function(error) {
// 					if (error) {
// 						task.deferred.reject(error);
// 					}
// 				});
// 		});
// 	}
// };

// Hander for data received on the serial port.
SmartCircuit.prototype.onData = function(data) {
  	var current = this.serialQueue.current();
  	if (current) {
  		current.handler(data, current); // give the data to the handler for this command.
  	} else {
  		console.log("command without current");
  		// TODO: ignore
  	}
  //   // If we are expecting some data.
  //   if (this.processingQueue.length > 0) {
  //   	var task = this.processingQueue[0];
		// task.receivedData = Buffer.concat([task.receivedData, data]);

  //   	// If we have received the expected number of bits plus a checksum.
  //   	if (task.receivedData.length === task.bytesToGet + 1) {
		// 	// Check the checksum.
		// 	var total = 0;
		// 	for (var value of task.receivedData.values()) {
		// 		total += value;	
		// 	}
		// 	if (total === 255) {
		// 		// Convert the raw data to a number.
		// 	   		// From Mohammed Alahmari's original code.
		// 		var result = 0;
  //               for (var i = task.bytesToGet - 1; i >= 0; i--) {
  //                   result <<= 8;
  //                   result |= task.receivedData[i];
  //               }

		// 		task.deferred.resolve(result);
		// 	} else {
		// 		task.deferred.reject("An error occured in transmission. Invalid checksum.");
		// 	}

		// 	clearTimeout(task.timeout); // no need to auto-expire now.
			
		// 	// Move on to the next item.
		// 	this.processingQueue.shift();
		// 	this.processQueue();	
  //   	}
  //   }
}

// Sends a command to the SmartCircuit.
	// A handler is called to process the data from the command.
	// TODO: Return promise?
SmartCircuit.prototype.queueCommand = function(command, handler) {
	this.serialQueue.add({
		command : command,
		handler : handler
	}, requestTimeout);
};

// Clears the memory of the smart circuit device.
SmartCircuit.prototype.clearMemory = function() {
	console.log("Clear memory");
	var _this = this;
	return this.queueCommand("#R,W,0;", function(data) {
		_this.serialQueue.next(); // move on once some data comes back.
	});
};

// Gets the contents of the SmartCircuit's memory.
SmartCircuit.prototype.getMemory = function() {
	console.log("Get memory");
	var _this = this;
	return this.queueCommand("#D,R,0;", function(data, request) {
		// Handles each line of the memory response.
		var data = data.toString();
		var commaSplit = data.split(',');
		
		switch (commaSplit[0]) {
			case "#n":
				var lastPart = commaSplit[commaSplit.length - 1];

				// Ignore the semi-colon at the end and convert to a number.
				request.numberOfRecords = parseInt(lastPart.substring(0, lastPart.length - 1));
				break;
			case "#d":
				if (!request.numberOfRecords) {
					// TODO: Respond negative.
				}
				if (!request.records) {
					request.records = [];
				}
				// Organise raw data.
					// From Mohammed Alahmari's original code.
				var record = {
					power : commaSplit[3] / 10,
					voltage : commaSplit[4] / 10,
					current : commaSplit[5] / 1000,
					powerFactor : commaSplit[16],
					frequency : commaSplit[19] / 10
				};
				console.log(record);
				// TODO: conver the record into actual data.
				request.records.push(commaSplit);
				break;
			case "#l":
					// TODO: respond to promise.
				if (request.numberOfRecords && request.records.length === request.numberOfRecords) {
					console.log('done positive');
					// Successful end, respond positively.
				} else {
					console.log('done negative');
					// TODO: respond to promise
				}
				console.log(request.records);
				_this.serialQueue.next();
				break;
		}
	});
};

// Returns a promise containing the open serial device.
SmartCircuit.prototype.getConnection = function() {
	if (!this.smartCircuitSerialPromise) {
		var _this = this;
		this.smartCircuitSerialPromise = new Promise(function(resolve, reject) {
			var pentametricSerial = new SerialPortObject(_this.device,
				pentametricSerialOptions,
				true,
				function(error) {
			        if (error) {
		                console.log("Error opening SmartCircuit device.");
		                console.log(error);
		                _this.smartCircuitSerialPromise = null; // allow re-trying for a connection after a failure.
		                reject(error);
			        } else {
			        	console.log("Opened SmartCircuit device successfully.");
		                
		                // handle incoming data with the onData function.
		                pentametricSerial.on("data", function(data) {
		                	_this.onData(data);
		                });

		                // _this.clearMemory(); // clear out the memory.

		                // On close, require the connection to be opened again.
		                pentametricSerial.on("close", function() {
							_this.smartCircuitSerialPromise = null;
							console.log("Serial device closed!");
						});
						resolve(pentametricSerial);
			        }
				}
			);
		});
	}
	return this.smartCircuitSerialPromise;
}

module.exports = SmartCircuit;