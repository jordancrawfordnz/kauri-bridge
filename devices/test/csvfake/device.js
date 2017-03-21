'use strict';

/*
  This is a fake sensor device.

  This plays back a real data file on a loop to the fake sensors.

  Provide the sensor device with the 'filePath' option - a path to a CSV file. The header line is ignored by default.
  A file path must be absolute, or relative to the current directory.

  An optional 'startingReadingIndex' can be used to start data playback at a different 'reading_index', but this defaults to 0.

  For each sensor, provide a 'column' option which defines which data column to send for the sensor.
*/

var Promise = require('promise');
var fs = require('fs');
var parse = require('csv-parse');

var CSVFakeDevice = function(configuration, logContext) {
  this.configuration = configuration;
  this.logContext = logContext;

  this.filePath = this.configuration.filePath;
  this.currentPosition = this.configuration.startingReadingIndex || 0;

  this.logContext.log('Starting from ' + this.currentPosition + ' in the CSV.');
};

// Collect data. Returns a promise with an array of { id : [id], value : [value] }.
CSVFakeDevice.prototype.fetch = function() {
  var _this = this;

  return _this._getData().then(function(csvData) {
    var toReturn = [];

    var currentRow = csvData[_this.currentPosition];

    _this.configuration.sensors.forEach(function(sensor) {
      if (sensor.column) {
        var columnValue = currentRow[sensor.column];

        if (columnValue) {
          toReturn.push({ id: sensor.id, value: columnValue });
        }
      }
    });

    // Increment and wrap the current position.
    _this.currentPosition = (_this.currentPosition + 1) % _this.rowCount;

    return toReturn;
  });
};

CSVFakeDevice.prototype._getData = function() {
  var _this = this;

  if (!this.csvData) {
    var file = fs.readFileSync(_this.filePath, 'utf8');

    this.csvData = Promise.denodeify(parse)(file, { columns: true }).then(function(dataArray) {
      _this.rowCount = dataArray.length;

      return dataArray.reduce(function(dataObject, currentRow) {
        var readingIndex = parseInt(currentRow.reading_index);

        // Delete the reading key.
        delete currentRow.reading_index;

        // Parse all the keys as floats.
        Object.keys(currentRow).forEach(function(column) {
          currentRow[column] = parseFloat(currentRow[column])
        });

        dataObject[readingIndex] = currentRow;

        return dataObject;
      }, {});
    });
  }

  return this.csvData;
};

module.exports = CSVFakeDevice;
