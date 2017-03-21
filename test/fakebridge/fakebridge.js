// This is a fake bridge, used to back populate data using one of the fake devices.

var LogContext = require('../../lib/logcontext.js');
var moment = require('moment');
var Promise = require('promise');

var Configuration = require('../../src/configuration.js');
var Devices = require('../../src/devices.js');
var APIInteraction = require('../../src/apiinteraction.js');

var CONFIG_DATE_FORMAT = 'HH:mm:ss DD/MM/YYYY'

var FakeBridge = function(configurationFile) {
  this.logContext = new LogContext('FakeBridge');
  this._loadConfig(configurationFile);

  this.devices = Devices.setupDevicesFromConfiguration(Configuration.current.devices, this.logContext);

  // Setup API interaction.
  this.apiInteraction = new APIInteraction(Configuration.current.apiInteraction, this.logContext.descend('API Interaction'));

  // Read the fake bridge config.
  this.readingInterval = Configuration.current.readingInterval;
  this.sendDelay = Configuration.current.sendDelay;
  this.fillFrom = this._parseConfigDate(Configuration.current.fillFrom);
  this.fillUntil = this._parseConfigDate(Configuration.current.fillUntil);

  this.perBatch = Configuration.current.perBatch;
  if (!this.perBatch || this.perBatch >= this.apiInteraction.maxPerBatch()) {
    this.perBatch = this.apiInteraction.maxPerBatch() - 1;  // Subtract 1 to prevent a large build up of readings.
    this.logContext.log('Defaulting to batches of size ' + this.perBatch);
  }
};

FakeBridge.prototype.start = function() {
  var _this = this;

  this.logContext.log('Starting the fake bridge.');
  this.logContext.log('Filling from: ' + this.fillFrom.format(CONFIG_DATE_FORMAT));
  this.logContext.log('Filling until: ' + this.fillUntil.format(CONFIG_DATE_FORMAT));
  this.logContext.log('Reading interval size: ' + this.readingInterval);

  var intervalsToUpload = (this.fillUntil - this.fillFrom) / (this.readingInterval * 1000);
  this.logContext.log('Intervals to upload: ' + intervalsToUpload);

  this.currentBatchSize = 0;

  this.logContext.disable();

  this._makeReading(moment(this.fillFrom)).then(function() {
    _this.logContext.enable();
    _this.logContext.log('Done :)');
  }, function(error) {
    _this.logContext.enable();
    _this.logContext.log('An error occured:');
    console.log(error);
  });
};

FakeBridge.prototype._makeReading = function(currentTime) {
  var _this = this;

  var shouldKeepReading = currentTime <= this.fillUntil;
  var getDataPromise;

  if (shouldKeepReading) {
    // Fetch data from each device.
    getDataPromise = Promise.all(this.devices.map(function(device) {
      return device.fetch();
    })).then(function(fetchResults) {
      _this.apiInteraction.resetReading(currentTime.unix());

      fetchResults.forEach(function(fetchResult) {
        _this.apiInteraction.queueSensorData(fetchResult);
      });

      _this.currentBatchSize++;
    });
  } else {
    getDataPromise = Promise.resolve();
  }

  return getDataPromise.then(function() {
    var sendDataPromise;

    if (!currentTime.isSame(_this.fillFrom) && (_this.currentBatchSize > _this.perBatch || !shouldKeepReading)) {
      sendDataPromise = _this.apiInteraction.sendReadings();
      _this.currentBatchSize = 0;

      _this.logContext.enable();
      _this.logContext.log('Current time: ' + currentTime.format(CONFIG_DATE_FORMAT));
      _this.logContext.disable();
    } else {
      // Don't send data yet.
      sendDataPromise = Promise.resolve();
    }

    return sendDataPromise.then(function() {
      if (shouldKeepReading) {
        return new Promise(function(resolve, reject) {
          // Delay, then make the next reading.
          setTimeout(function() {
            currentTime.add(_this.readingInterval, 's');
            _this._makeReading(currentTime).then(resolve, reject);
          }, _this.sendDelay);
        });
      } else {
        return Promise.resolve();
      }
    });
  });
};

FakeBridge.prototype._parseConfigDate = function(dateString) {
  return moment(dateString, CONFIG_DATE_FORMAT);
};

FakeBridge.prototype._loadConfig = function(configurationFile) {
  // Load in the configuration file.
  Configuration.load(configurationFile);

  this.logContext.log('Loaded configuration file: ' + Configuration.current.name + ' from "' + configurationFile + '"');
  this.logContext = this.logContext.descend(Configuration.current.name); // include the configuration name in the logContext
};

module.exports = FakeBridge;
