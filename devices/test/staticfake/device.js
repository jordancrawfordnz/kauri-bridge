'use strict';

/*
  This is a fake sensor device.

  For each sensor this returns the sensor's 'value' property defined in the sensor configuration.
*/

var Promise = require('promise');

var StaticFakeDevice = function(configuration, logContext) {
  this.configuration = configuration;
  this.logContext = logContext;
};

// Collect data. Returns a promise with an array of { id : [id], value : [value] }.
StaticFakeDevice.prototype.fetch = function() {
  var _this = this;

  return new Promise(function(resolve) {
    var toReturn = [];

    _this.configuration.sensors.forEach(function(sensor) {
      toReturn.push({ id : sensor.id, value : sensor.value });

      _this.logContext.log('Static sensor reading sent. Sensor ID: ' + sensor.id + ', Value: ' + sensor.value);
    });

    resolve(toReturn);
  });
};

module.exports = StaticFakeDevice;
