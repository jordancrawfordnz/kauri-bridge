'use strict';

/*
	Handles all API interaction.
*/

var APIInteraction = function(configuration, logContext) {
	this.configuration = configuration;
	this.logContext = logContext;
};

// Sends sensor data to the API.
	// TODO: queue requests up then send.
APIInteraction.prototype.sendSensorData = function(sensorId, sensorValue) {
	this.logContext.log('Got sensor data back. id: ' + sensorId + ', value: ' + sensorValue);
};

module.exports = APIInteraction;
