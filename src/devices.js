'use strict';

var deviceClasses = {
  smartcircuit : require('../devices/smartcircuit/device.js'),
  pentametric : require('../devices/pentametric/device.js'),
  staticfake : require('../devices/test/staticfake/device.js')
};

var Devices = {};

Devices.setupDevicesFromConfiguration = function(devicesConfiguration, logContext) {
  var devices = [];

  devicesConfiguration.forEach(function(deviceConfig) {
    var deviceLogContext = logContext.descend(deviceConfig.name);

    // Find the device object to use.
    var deviceObject = deviceClasses[deviceConfig.type];
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
