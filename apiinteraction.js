'use strict';

/*
	Handles all API interaction.
*/

var APIInteraction = function(configuration, logContext) {
	this.configuration = configuration;
	this.logContext = logContext;

	console.log(configuration);
};

// Sends sensor data to the API.
	// TODO: queue requests up then send.
APIInteraction.prototype.sendSensorData = function(sensorId, sensorValue) {
	logContext.log('Got sensor data back. id: ' + sensorId + ', value: ' + sensorValue);
};