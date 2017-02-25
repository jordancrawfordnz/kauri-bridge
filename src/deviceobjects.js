'use strict';

/*
  Maps device types to their device object.
*/

var DeviceObjects = {
  smartcircuit : require('../devices/smartcircuit/device.js'),
  pentametric : require('../devices/pentametric/device.js'),
  staticfake : require('../devices/staticfake/device.js')
};

module.exports = DeviceObjects;
