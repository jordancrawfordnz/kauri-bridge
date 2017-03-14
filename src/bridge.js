var LogContext = require('../lib/logcontext.js');

var Configuration = require('./configuration.js');
var Devices = require('./devices.js');
var APIInteraction = require('./apiinteraction.js');
var Timing = require('./timing.js');

var Bridge = function(configurationFile) {
  this.logContext = new LogContext(['Bridge']);

  this._loadConfig(configurationFile);

  this.devices = Devices.setupDevicesFromConfiguration(Configuration.current.devices, logContext);

  // Setup API interaction.
  this.apiInteraction = new APIInteraction(Configuration.current.apiInteraction, this.logContext.descend('API Interaction'));
};

Bridge.prototype.start = function() {
  this._setupPollTimer();
  this._setupTransmissionTimer();
};

Bridge.prototype._setupPollTimer = function() {
  var _this = this;

  // Setup the poll timer.
  Timing.startMinutelyTimer(Configuration.current.devicePollFrequency, function() {
    _this.apiInteraction.resetReading(Math.floor(new Date().getTime() / 1000)); // reset the reading to use for this timestamp.

    // Fetch from each device then queue the data in API interaction.
    _this.devices.forEach(function(device) {
      device.fetch().then(function(sensorData) {
        _this.apiInteraction.queueSensorData(sensorData); // queue the data to be sent off.
      });
    });
  }, _this.logContext.descend('Poll Timer'));
};

Bridge.prototype._setupTransmissionTimer = function() {
  var _this = this;

  Timing.startMinutelyTimer(Configuration.current.dataSendFrequency, function() {
    _this.apiInteraction.sendReadings();
  }, _this.logContext.descend('Data Send Timer'));
};

Bridge.prototype._loadConfig = function(configurationFile) {
  // Load in the configuration file.
  Configuration.load(configurationFile);

  this.logContext.log('Loaded configuration file: ' + Configuration.current.name + ' from "' + configurationFile + '"');
  this.logContext = this.logContext.descend(Configuration.current.name); // include the configuration name in the logContext
};

module.exports = Bridge;
