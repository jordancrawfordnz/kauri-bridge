'use strict';

/*
	Maps device types to their device object.
*/

var DeviceObjects = {
	smartcircuit : require('./smartcircuit/device.js'),
	pentametric : require('./pentametric/device.js')
};

module.exports = DeviceObjects;