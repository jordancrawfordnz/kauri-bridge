'use strict';

/*
  The device API for the Pentametric device.
  This follows a standard format for consistancy with other devices.
*/

var Promise = require('promise');
var PentametricDriver = require('./driver.js');

var PentametricDevice = function(configuration, logContext) {
  this.configuration = configuration;
  this.logContext = logContext;
  this.driver = new PentametricDriver(configuration.devicePath, logContext.descend('Driver'));
};

// Collect data. Returns a promise with an array of { id : [id], value : [value] }.
PentametricDevice.prototype.fetch = function() {
  var _this = this;
  _this.logContext.log('Collect data.');

  var promises = [];

  var sensors = _this.configuration.sensors;
  sensors.forEach(function(sensor) {
    if (sensor.sensorType === 'voltage') {
      promises.push(new Promise(function(resolve) {
        _this.driver.getVoltageReading(sensor.sensorNumber).then(function(reading) {
          resolve({id : sensor.id, value : reading});
        }, function(error) {
          _this.logContext.log('Error reading voltage sensor ' + sensor.id);
          _this.logContext.log(error);
        });
      }));
    } else if (sensor.sensorType === 'current') {
      var getReadingPromise = new Promise(function(resolve) {
        _this.driver.getCurrentReading(sensor.sensorNumber).then(function(reading) {
          resolve({id : sensor.id, value : reading});
        }, function(error) {
          _this.logContext.log('Error reading current sensor ' + sensor.id);
          _this.logContext.log(error);
        });
      });

      promises.push(getReadingPromise);
    }
  });

  return Promise.all(promises);
};

module.exports = PentametricDevice;
