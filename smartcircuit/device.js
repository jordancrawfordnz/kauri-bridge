'use strict';

/*
	The device API for the SmartCircuit device.
	This follows a standard format for consistancy with other devices.
*/

var SmartCircuitDriver = require('./driver.js');

var SmartCircuitDevice = function(configuration, sendSensorData, logContext) {
	this.configuration = configuration;
	this.sendSensorData = sendSensorData;
	this.logContext = logContext;
	this.driver = new SmartCircuitDriver(configuration.devicePath, logContext.descend('Driver'));
};

SmartCircuitDevice.prototype.start = function() {
	if (this.interval) {
		return;
	}
	var _this = this;
	this.interval = setInterval(function() {
		_this.logContext.log('Collect data.');

		_this.driver.clearMemory(function() {
			// Wait two seconds for a reading to happen.
			setTimeout(function() {
				_this.driver.getMemory(function(readings) {
					if (readings.length === 0) {
						_this.logContext.log('Got no readings.');
						return;
					}

					// Use the latest reading.
					var latestReading = readings[readings.length - 1];
					
					// Fill in values for sensors.
					_this.configuration.sensors.forEach(function(sensor) {
						// Check if we have a key for this sensor.
						var sensorValue = latestReading[sensor.sensorKey];
						if (!sensorValue) {
							_this.logContext.log('Unknown sensor key.');
						} else {
							// Log the sensor data.
							_this.sendSensorData(sensor.id, sensorValue);
						}
					});
				}, function(error) {
					_this.logContext.log('Error while fetching from memory.');
					_this.logContext.log(error);
				});
			}, 2*1000);
		}, function(error) {
			_this.logContext.log('Error while clearing memory.');
			_this.logContext.log(error);
		});
	}, 1000*this.configuration.pollFrequency);
};

SmartCircuitDevice.prototype.stop = function() {
	if (!this.interval) {
		return;
	}
	clearInterval(this.interval);
	_this.logContext.log('Stopped.');
};

module.exports = SmartCircuitDevice;