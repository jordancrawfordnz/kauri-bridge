'use strict';

/*
	Handles all API interaction.
*/

var request = require('request');
var dateFormat = require('dateformat')

var APIInteraction = function(configuration, logContext) {
	this.configuration = configuration;
	this.logContext = logContext;
};

// Sends sensor data to the API.
	// TODO: queue requests up then send.
APIInteraction.prototype.sendSensorData = function(sensorId, sensorValue) {
	this.logContext.log('Got sensor data back. id: ' + sensorId + ', value: ' + sensorValue);

	var timestamp = dateFormat(new Date(), 'isoDateTime');
	request.post(this.configuration.apiEndpoint + '/Readings',
		{
			sensorId : sensorId,
			value : sensorValue,
			timestamp : timestamp
		}, function(error, response, body) {
			if (error) {
				console.log(error);
			} else {
				console.log('res');
				console.log(response);
				console.log('body');
				console.log(body);
			}
		});
};

module.exports = APIInteraction;
