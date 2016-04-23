'use strict';

/*
	The device API for the SmartCircuit device.
	This follows a standard format for consistancy with other devices.
*/

var SmartCircuitDevice = function(configuration, sendSensorData, logContext) {
	this.configuration = configuration;
	this.sendSensorData = sendSensorData;
	this.logContext = logContext;
};

SmartCircuitDevice.prototype.start = function() {
	if (this.interval) {
		return;
	}
	var _this = this;
	this.interval = setInterval(function() {
		_this.logContext.log('Collect data.');
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