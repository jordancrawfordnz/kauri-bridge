'use strict';

var colors = require('colors/safe');
var Bridge = require('./src/bridge.js')

console.log(colors.green('Off Grid Monitoring') + ': Bridge');
console.log(colors.dim('Jordan Crawford, 2017'));

var configurationFile = process.argv[2];

if (!configurationFile) {
  console.log('Usage: node . [configuration file path]');
  process.exit();
}

var bridge = new Bridge(configurationFile)
bridge.start();
