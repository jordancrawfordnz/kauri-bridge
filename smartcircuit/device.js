'use strict';

/*
	The device API for the SmartCircuit device.
	This follows a standard format for consistancy with other devices.
*/

var Promise = require('promise');
var SmartCircuitDriver = require('./driver.js');

var SmartCircuitDevice = function(configuration, logContext) {
	this.configuration = configuration;
	this.logContext = logContext;
	this.driver = new SmartCircuitDriver(configuration.devicePath, logContext.descend('Driver'));
};

// Collect data. Returns a promise with an array of { id : [id], value : [value] }.
SmartCircuitDevice.prototype.fetch = function() {
	var _this = this;
	_this.logContext.log('Clearing memory.');

	return new Promise(function(resolve) {
		var toReturn = [];
		_this.driver.clearMemory().then(function() {
			// Wait two seconds for a reading to happen.
			_this.logContext.log('Memory cleared. Waiting for data.');
			setTimeout(function() {
				_this.logContext.log('Getting memory.');
				_this.driver.getMemory().then(function(readings) {
					if (readings.length === 0) {
						_this.logContext.log('Got no readings.');
						return;
					}
					_this.logContext.log(readings.length + ' reading(s) received.');

					// Use the latest reading.
					var latestReading = readings[readings.length - 1];
					
					// Fill in and send values for sensors.
					_this.configuration.sensors.forEach(function(sensor) {
						// Check if we have a key for this sensor.
						var sensorValue = latestReading[sensor.sensorKey];
						if (!sensorValue) {
							_this.logContext.log('Unknown sensor key.');
						} else {
							// Log the sensor data.
							toReturn.push({ id : sensor.id, value : sensorValue });
						}
					});

					resolve(toReturn);
				}, function(error) {
					_this.logContext.log('Error while fetching from memory.');
					_this.logContext.log(error);
				});
			}, 2*1000);
		}, function(error) {
			_this.logContext.log('Error while clearing memory.');
			_this.logContext.log(error);
		});
	});
};

module.exports = SmartCircuitDevice;
