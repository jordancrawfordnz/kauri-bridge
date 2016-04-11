'use strict';

// A serial queue accepts commands to be sent through a serial device.
	// It calls the provided commandSender function with a request.

var SerialQueue = function(commandSender) {
	this.processingQueue = [];
	this.commandSender = commandSender;
};

module.exports = SerialQueue;

// Processes the queue by calling the command sender.
SerialQueue.prototype._processQueue = function() {
	if (this.processingQueue.length > 0) {
		this.commandSender(this.current());
	}
};

// Adds an item to the serial queue to be processed.
SerialQueue.prototype.add = function(request, autoExpireTimeout) {
	this.processingQueue.push(request); // add the request to be processed.

	// Setup the request to automaticly timeout.
	if (autoExpireTimeout) {
		var _this = this;
		request.timeout = setTimeout(function() {
			var index = _this.processingQueue.indexOf(request);
			if (index !== -1) { // if the request is still around.
				_this.processingQueue.splice(index, 1); // remove the request from the queue.
				if (request.deferred) {
					request.deferred.reject("Request timeout.");
				}
			}
		}, autoExpireTimeout);
	}
	// If this is the only item on the queue.
	if (this.processingQueue.length === 1) {
		// Start the queue processing.
		this._processQueue();
	}
};

// Gets the current request.
SerialQueue.prototype.current = function() {
	return this.processingQueue[0];
};

// Goes to the next request.
SerialQueue.prototype.next = function() {
	var current = this.current();
	if (current.timeout) {
		clearTimeout(current.timeout); // no need to auto-expire now.
	}

	// Move on to the next item.
	this.processingQueue.shift();
	this._processQueue();
};