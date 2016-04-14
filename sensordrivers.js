'use strict';

var SensorDrivers = {};

SensorDrivers.smartcircuit = require("./smartcircuit/interaction.js");
SensorDrivers.pentametric = require("./pentametric/interaction.js");

module.exports = SensorDrivers;