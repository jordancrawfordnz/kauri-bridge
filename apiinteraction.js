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
	var _this = this;
	this.logContext.log('Got sensor data back. id: ' + sensorId + ', value: ' + sensorValue);

	var timestamp = dateFormat(new Date(), 'isoDateTime');
	var url = this.configuration.apiEndpoint + '/Readings';
	var data = {
	  sensorId : sensorId,
	  value : sensorValue,
	  timestamp : timestamp
	};

	var options = { method: 'POST',
	  url: url,
	  headers: 
	   { 'cache-control': 'no-cache',
	     'content-type': 'application/json' },
	  body: data, 
	  json: true };

	request(options, function (error, response, body) {
	  if (error) {
	  	_this.logContext.log('Error while posting data.');
		_this.logContext.log(error);
	  }
	});
};

module.exports = APIInteraction;
