'use strict';

/*
	Handles all API interaction.
*/

var request = require('request');
var dateFormat = require('dateformat')

var APIInteraction = function(configuration, logContext) {
	this.configuration = configuration;
	this.logContext = logContext;
	this.queuedReadings = [];

	var getBridgeOptions = { 
		method: 'GET',
		url: this.configuration.apiEndpoint + '/Bridges/' + 
			 configuration.bridgeId + '?bridgeSecret=' + configuration.bridgeSecret,
  		headers: 
		{
			'cache-control': 'no-cache',
			'content-type': 'application/json'
		},
		json: true
	};

	// Test the bridge communication by fetching the API's name for this bridge.
	request(getBridgeOptions, function (error, response, bridge) {
 		if (error) {
 			logContext.log('Error while getting bridge details.');
			logContext.log(error);
 		} else {
 			logContext.log('Bridge connected to API successfully, my name: ' + bridge.name);
 		}
 	});
};

// Resets the current reading. Data is always added to the latest reading.
// This seals the old reading which will be sent with the next push.
	// The timestamp represents the time period the reading best represents.
APIInteraction.prototype.resetReading = function(timestamp) {
	if (this.currentReading) {
		this.queuedReadings.push(this.currentReading);
	}
	this.currentReading = {
		timestamp : timestamp,
		values : {}
	};
};

// Adds sensor data to the current reading.
	// Sensor data is an array containing id and value.
APIInteraction.prototype.queueSensorData = function(sensorData) {
	var _this = this;
	sensorData.forEach(function(data) {
		_this.currentReading.values[data.id] = data.value;
	});
};

// Sends away the current set of readings except the first reading.
APIInteraction.prototype.sendReadings = function() {
	var toSend = [];
	
	// Determine which batches should be sent (others will just be discarded).
	this.queuedReadings.forEach(function(reading) {
		if (Object.keys(reading.values).length > 0) {
			toSend.push(reading);
		}
	});
	
	var configuration = this.configuration;

	// Clear all queued readings.
	this.queuedReadings.splice(0, this.queuedReadings.length);

	if (toSend.length > 0) { // send some data away if there is something to send!
		var options = {
			method: 'POST',
		  	url: this.configuration.apiEndpoint + '/Bridges/' + 
			 configuration.bridgeId + '/readings?bridgeSecret=' + configuration.bridgeSecret,
		  	headers: 
		   	{
		   		'cache-control': 'no-cache',
		     	'content-type': 'application/json'
		    },
		  	body: toSend, 
		  	json: true
		};

		var _this = this;
		this.logContext.log('Starting post to backend.');
		request(options, function (error, response, body) {
		 		if (error) {
		 			// Add un-sent batches back into the queue. Something went wrong here.
		 			toSend.forEach(function(reading) {
		 				_this.queuedReadings.push(reading);
		 			});

		 			_this.logContext.log('Error while posting data. ' + toSend.length + ' batches re-added to the queue, queue size: ' + _this.queuedReadings.length);
					_this.logContext.log(error);
		 		} else {
		 			_this.logContext.log('Sent ' + toSend.length + ' batches successfully.');
		 		}
		});
	}
};

module.exports = APIInteraction;
