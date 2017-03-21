'use strict';

/*
  The driver to communicate with the Pentametric device.
  This provides high level functions for the raw device commands.
*/

var SerialPort = require('serialport')
var Promise = require('promise');
var Deferred = require('deferred')
var SerialQueue = require('../../src/lib/serialqueue.js');

var baudRate = 2400;
var parity = "none";
var dataBits = 8;
var timeout = 5;
var readCommand = 0x81;
var requestTimeout = 800;

// Setup an object for the serial port.
var pentametricSerialOptions = {
  baudRate : baudRate,
  dataBits : dataBits,
  parity : parity
};

var PentametricDriver = function(device, logContext) {
  this.device = device;
  this.logContext = logContext;
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
PentametricDriver.prototype.getVoltageReading = function(id) {
  return this.queueCommand(id, 2).then(function(data) {
    return data / 20;
  });
};

PentametricDriver.prototype.getCurrentReading = function(id) {
  id += 4;

  return this.queueCommand(id, 3).then(function(data) {
    // From Mohammed Alahmari's original code.
    var sign = data >> 23;
    data &= 0x7fffff;
    if (sign != 0) {
      data |= 0xff800000;
    }

    return -(data) / 1000.0;
  });
};

// Adds a request to the processing queue.
// Returns a promise.
PentametricDriver.prototype.queueCommand = function(address, bytesToGet) {
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
PentametricDriver.prototype.onData = function(data) {
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

      if (total &= 0xFF === 0xFF) {
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
PentametricDriver.prototype.getConnection = function() {
  if (!this.pentametricSerialPromise) {
    var _this = this;

    this.pentametricSerialPromise = new Promise(function(resolve, reject) {
      var pentametricSerial = new SerialPort(
        _this.device,
        pentametricSerialOptions);

      pentametricSerial.on('error', function(error) {
        _this.logContext.log("Error opening Pentametric device.");
        _this.pentametricSerialPromise = null; // allow re-trying for a connection after a failure.
        reject(error);
      });

      pentametricSerial.on('open', function() {
        _this.logContext.log("Opened Pentametric device successfully.");
        resolve(pentametricSerial);
      });

      // handle incoming data with the onData function.
      pentametricSerial.on('data', function(data) {
        _this.onData(data);
      });

      // On close, require the connection to be opened again.
      pentametricSerial.on('close', function() {
        _this.pentametricSerialPromise = null;
        _this.logContext.log("Serial device closed!");
      });
    });
  }

  return this.pentametricSerialPromise;
}

module.exports = PentametricDriver;
