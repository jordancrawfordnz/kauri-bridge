'use strict';

/*
	The device API for the Pentametric device.
	This follows a standard format for consistancy with other devices.
*/

var PentametricDevice = function(configuration, sendSensorData, logContext) {
	this.configuration = configuration;
	this.sendSensorData = sendSensorData;
	this.logContext = logContext;
};

// PentametricDevice.prototype.

module.exports = PentametricDevice;