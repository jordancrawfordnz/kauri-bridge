'use strict';

var SerialQueue = require('../../src/lib/serialqueue.js');
var SerialPort = require('serialport')
var Promise = require('promise');
var Deferred = require('deferred')

var baudRate = 115200;
var parity = 'none';
var dataBits = 8;
var requestTimeout = 2000;

// Setup an object for the serial port.
var smartCircuitSerialOptions = {
  baudRate : baudRate,
  dataBits : dataBits,
  parity : parity,
  parser : SerialPort.parsers.readline("\r\n")
};

var SmartCircuit = function(device, logContext) {
  this.device = device;
  this.logContext = logContext;
  this.smartCircuitSerialPromise = null;
  var _this = this;

  this.serialQueue = new SerialQueue(function(request) {
    _this.getConnection().then(function(connection) {
      connection.write(request.command, function(error) {
        if (error) { // Reject the request if an error occurs writing to the serial port.
          task.deferred.reject(error);
        }
      });
    }, function(error) {
      request.deferred.reject(error); // reject the request due to the connection error.
    });
  });
};

// Hander for data received on the serial port.
SmartCircuit.prototype.onData = function(data) {
  var current = this.serialQueue.current();
  if (current) {
    current.handler(data, current); // give the data to the handler for this command.
  }
}

// Sends a command to the SmartCircuit.
// A handler is called to process the data from the command.
SmartCircuit.prototype.queueCommand = function(command, handler) {
  var deferred = Deferred();
  this.serialQueue.add({
    command : command,
    handler : handler,
    deferred : deferred
  }, requestTimeout);
  return deferred.promise;
};

// Clears the memory of the smart circuit device.
SmartCircuit.prototype.clearMemory = function() {
  var _this = this;

  return this.queueCommand("#R,W,0;", function(data, request) {
    request.deferred.resolve();
    _this.serialQueue.next(); // move on once some data comes back.
  });
};

// Gets the contents of the SmartCircuit's memory.
SmartCircuit.prototype.getMemory = function() {
  var _this = this;
  return this.queueCommand("#D,R,0;", function(data, request) {
    // Handles each line of the memory response.
    var data = data.toString();
    var commaSplit = data.split(',');

    if (!request.records) {
      request.records = [];
    }
    switch (commaSplit[0]) {
      case "#n":
        var lastPart = commaSplit[commaSplit.length - 1];

        // Ignore the semi-colon at the end and convert to a number.
        request.numberOfRecords = parseInt(lastPart.substring(0, lastPart.length - 1));
        break;
      case "#d":
        if (!request.numberOfRecords) {
          request.deferred.reject("Expected a header with the number of records.");
          break;
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
        request.records.push(record);
        break;
      case "#l":
        if (request.numberOfRecords !== undefined && request.records.length === request.numberOfRecords) {
          request.deferred.resolve(request.records);
          // Successful end, respond with the records.
        } else {
          // Error end.
          request.deferred.reject("Expected to have received " + request.numberOfRecords + " but got " + request.records.length);
        }
        _this.serialQueue.next(); // Move the command queue.
        break;
    }
  });
};

// Returns a promise containing the open serial device.
SmartCircuit.prototype.getConnection = function() {
  if (!this.smartCircuitSerialPromise) {
    var _this = this;

    this.smartCircuitSerialPromise = new Promise(function(resolve, reject) {
      var pentametricSerial = new SerialPort(
        _this.device,
        smartCircuitSerialOptions
      );

      pentametricSerial.on('error', function(error) {
        _this.logContext.log('Error opening SmartCircuit device.');
        _this.smartCircuitSerialPromise = null; // allow re-trying for a connection after a failure.
        reject(error);
      });

      pentametricSerial.on('open', function() {
        _this.logContext.log('Opened SmartCircuit device successfully.');

        resolve(pentametricSerial);
      });

      // handle incoming data with the onData function.
      pentametricSerial.on('data', function(data) {
        _this.onData(data);
      });

      // On close, require the connection to be opened again.
      pentametricSerial.on('close', function() {
        _this.smartCircuitSerialPromise = null;
        _this.logContext.log('Serial device closed!');
      });
    });
  }

  return this.smartCircuitSerialPromise;
}

module.exports = SmartCircuit;
