'use strict';

var Devices = {};

Devices.setupDevicesFromConfiguration = function(devicesConfiguration, logContext) {
  var devices = [];

  devicesConfiguration.forEach(function(deviceConfig) {
    var deviceLogContext = logContext.descend(deviceConfig.name);

    // Find the device object to use.
    var deviceObject = require('../devices/' + deviceConfig.type + '/device.js');
    if (!deviceObject) {
      logContext.log('Unknown device type.');
      return;
    }

    deviceLogContext.log('Setting up.');
    devices.push(new deviceObject(deviceConfig, deviceLogContext));
  });

  return devices;
};

module.exports = Devices;
