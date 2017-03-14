// This is a fake bridge, used to back populate data using one of the fake devices.

var LogContext = require('../lib/logcontext.js');

var Configuration = require('./configuration.js');
var Devices = require('./devices.js');
var APIInteraction = require('./apiinteraction.js');

var FakeBridge = function(configurationFile) {
  this.logContext = new LogContext(['FakeBridge']);

  this._loadConfig(configurationFile);

  this.devices = Devices.setupDevicesFromConfiguration(Configuration.current.devices, logContext);

  // Setup API interaction.
  this.apiInteraction = new APIInteraction(Configuration.current.apiInteraction, this.logContext.descend('API Interaction'));
};

FakeBridge.prototype.start = function() {
  var _this = this;

  // TODO: Support config options to decide how long to loop this.
    // TODO: Need a delay so I don't overwhelm the server? See how it goes I guess :)

  // Fetch data from each device.
  Promise.all(this.devices.map(function(device) {
    return device.fetch();
  })).then(function(fetchResults) {
    // TODO: Reset the API interaction and set a time to use for this batch.

    fetchResults.forEach(function(fetchResult) {
      _this.apiInteraction.queueSensorData(fetchResult);
    });

    _this.apiInteraction.sendReadings();

  }, function() {
    _this.logContext.log('A sensor returned an error. Please ensure you are only using fake sensors with the fake bridge!');
  });
};

FakeBridge.prototype._loadConfig = function(configurationFile) {
  // Load in the configuration file.
  Configuration.load(configurationFile);

  this.logContext.log('Loaded configuration file: ' + Configuration.current.name + ' from "' + configurationFile + '"');
  this.logContext = this.logContext.descend(Configuration.current.name); // include the configuration name in the logContext
};

module.exports = FakeBridge;
