'use strict';

/*
  The device API for the SmartCircuit device.
  This follows a standard format for consistancy with other devices.

  This is a fake sensor device. For each sensor it is configured with, this returns the sensor's 'value' property.
*/

var Promise = require('promise');

var StaticFakeDevice = function(configuration, logContext) {
	this.configuration = configuration;
	this.logContext = logContext;
};

// Collect data. Returns a promise with an array of { id : [id], value : [value] }.
StaticFakeDevice.prototype.fetch = function() {
	return new Promise(function(resolve) {
    var toReturn = [];

    _this.configuration.sensors.forEach(function(sensor) {
      toReturn.push({ id : sensor.id, value : sensor.value });
    });

    resolve(toReturn);
  });
};

module.exports = StaticFakeDevice;
