'use strict';

/*
	The device API for the Pentametric device.
	This follows a standard format for consistancy with other devices.
*/

var PentametricDriver = require('./driver.js');

var PentametricDevice = function(configuration, sendSensorData, logContext) {
	this.configuration = configuration;
	this.sendSensorData = sendSensorData;
	this.logContext = logContext;
	this.driver = new PentametricDriver(configuration.devicePath, logContext.descend('Driver'));
};

PentametricDevice.prototype.start = function() {
	if (this.interval) {
		return;
	}
	var _this = this;
	this.interval = setInterval(function() {
		_this.logContext.log('Collect data.');

		var sensors = _this.configuration.sensors;
		sensors.forEach(function(sensor) {
			console.log(sensor);
			if (sensor.sensorType === 'voltage') {
				_this.driver.getVoltageReading(sensor.sensorNumber).then(function(reading) {
					_this.sendSensorData(sensor.id, reading);
				}, function(error) {
					_this.logContext.log('Error reading voltage sensor ' + sensor.id);
					_this.logContext.log(error);
				});
			} else if (sensor.sensorType === 'current') {
				_this.driver.getCurrentReading(sensor.sensorNumber).then(function(reading) {
					_this.sendSensorData(sensor.id, reading);
				}, function(error) {
					_this.logContext.log('Error reading current sensor ' + sensor.id);
					_this.logContext.log(error);
				});
			}
		});

	}, 1000*this.configuration.pollFrequency);
};

PentametricDevice.prototype.stop = function() {
	if (!this.interval) {
		return;
	}
	clearInterval(this.interval);
	_this.logContext.log('Stopped.');
};

module.exports = PentametricDevice;