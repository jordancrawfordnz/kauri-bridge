'use strict';

/*
	Handles all API interaction.
*/

var request = require('request');
var dateFormat = require('dateformat')

var maxReadingsPerBatch = 50;

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
	var _this = this;
	var toSend = [];
	var emptyBatches = [];

	// Determine which batches should be sent and which removed.
	this.queuedReadings.forEach(function(reading) {
		if (Object.keys(reading.values).length > 0) {
			// Only sends up to the maximum readings per batch.
			if (toSend.length < maxReadingsPerBatch) {
				toSend.push(reading);
			}
			// else keeps the reading in the queue
		} else {
			emptyBatches.push(reading);
		}
	});

	// Clear out empty batches
	emptyBatches.forEach(function(emptyReading) {
		_this.queuedReadings.splice(_this.queuedReadings.indexOf(emptyReading), 1); // remove from the queue.
	});

	// Clear out readings that will be sent from the queue.
	toSend.forEach(function(valueToSend) {
		_this.queuedReadings.splice(_this.queuedReadings.indexOf(valueToSend), 1);
	});
	
	var configuration = this.configuration;

	if (toSend.length > 0) { // send some data away if there is something to send!
		var options = {
			method: 'POST',
		  	url: this.configuration.apiEndpoint + '/Bridges/' + 
			 configuration.bridgeId + '/recordreadings?bridgeSecret=' + configuration.bridgeSecret,
		  	headers: 
		   	{
		   		'cache-control': 'no-cache',
		     	'content-type': 'application/json'
		    },
		  	body: toSend, 
		  	json: true
		};

		this.logContext.log('Starting post to backend.');
		request(options, function (error, response, body) {
		 		if (error || response.statusCode !== 200) {
		 			// Add un-sent batches to the front of the queue so they can be re-sent.
		 			_this.queuedReadings = toSend.concat(_this.queuedReadings);
		 			
		 			_this.logContext.log('Error while posting data. ' + toSend.length + ' batches re-added to the queue, queue size: ' + _this.queuedReadings.length + ', status code: ' + response.statusCode);
					_this.logContext.log(error);
		 		} else {
		 			_this.logContext.log('Sent ' + toSend.length + ' batches successfully. ' + _this.queuedReadings.length + ' remaining in the queue.');
		 		}
		});
	}
};

module.exports = APIInteraction;
