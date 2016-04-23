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

// Collect data.
SmartCircuitDevice.prototype._collect = function() {
	var _this = this;
	_this.logContext.log('Clearing memory.');

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
};

// Starts collection.
SmartCircuitDevice.prototype.start = function() {
	if (this.interval) {
		return;
	}
	var _this = this;
	this.interval = setInterval(function() {
		_this._collect();
	}, 1000*this.configuration.pollFrequency);
	this._collect(); // start straight away.
};

// Stops collection.
SmartCircuitDevice.prototype.stop = function() {
	if (!this.interval) {
		return;
	}
	clearInterval(this.interval);
	_this.logContext.log('Stopped.');
};

module.exports = SmartCircuitDevice;
