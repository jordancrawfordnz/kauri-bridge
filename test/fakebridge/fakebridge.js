// This is a fake bridge, used to back populate data using one of the fake devices.

var LogContext = require('../lib/logcontext.js');
var moment = require('moment');
var Promise = require('promise');

var Configuration = require('./configuration.js');
var Devices = require('./devices.js');
var APIInteraction = require('./apiinteraction.js');

var FakeBridge = function(configurationFile) {
  this.logContext = new LogContext(['FakeBridge']);
  this._loadConfig(configurationFile);

  this.devices = Devices.setupDevicesFromConfiguration(Configuration.current.devices, logContext);

  // Setup API interaction.
  this.apiInteraction = new APIInteraction(Configuration.current.apiInteraction, this.logContext.descend('API Interaction'));

  // Read the fake bridge config.
  this.readingInterval = Configuration.current.readingInterval;
  this.sendDelay = Configuration.current.sendDelay;
  this.fillFrom = this._parseConfigDate(Configuration.current.fillFrom);
  this.fillUntil = this._parseConfigDate(Configuration.current.fillUntil);
};

FakeBridge.prototype.start = function() {
  var _this = this;

  this.logContext.log('Starting the fake bridge.');
  this.logContext.log('Filling from: ' + this.fillFrom);
  this.logContext.log('Filling until: ' + this.fillUntil);
  this.logContext.log('Reading interval size: ' + this.readingInterval);

  var intervalsToUpload = (this.fillUntil - this.fillFrom) / (this.readingInterval * 1000);
  this.logContext.log('Intervals to upload: ' + intervalsToUpload);
};

FakeBridge.prototype._makeReading = function(currentTime) {
  var _this = this;

  if (currentTime < this.fillUntil) {
    // Fetch data from each device.
    return Promise.all(this.devices.map(function(device) {
      return device.fetch();
    })).then(function(fetchResults) {
      _this.apiInteraction.resetReading(currentTime.unix());

      fetchResults.forEach(function(fetchResult) {
        _this.apiInteraction.queueSensorData(fetchResult);
      });

      return _this.apiInteraction.sendReadings().then(function() {
        return new Promise(function(resolve, reject) {
          // Delay, then make the next reading.
          setTimeout(function() {
            currentTime.add(_this.readingInterval, 's');
            _this.makeReading(currentTime).then(resolve, reject);
          }, _this.sendDelay);
        });
      });;
    });
  } else {
    Promise.resolve();
  }
};

FakeBridge.prototype._parseConfigDate = function(dateString) {
  return moment(dateString, "HH:mm:ss DD/MM/YYYY");
};

FakeBridge.prototype._loadConfig = function(configurationFile) {
  // Load in the configuration file.
  Configuration.load(configurationFile);

  this.logContext.log('Loaded configuration file: ' + Configuration.current.name + ' from "' + configurationFile + '"');
  this.logContext = this.logContext.descend(Configuration.current.name); // include the configuration name in the logContext
};

module.exports = FakeBridge;
