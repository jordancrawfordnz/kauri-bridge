'use strict';

var colors = require('colors/safe');
var FakeBridge = require('./fakebridge.js')

console.log(colors.green('Off Grid Monitoring') + ': Fake Bridge');
console.log(colors.dim('Jordan Crawford, 2017'));

var configurationFile = process.argv[2];

if (!configurationFile) {
  console.log('Usage: node . [configuration file path]');
  process.exit();
}

var fakeBridge = new FakeBridge(configurationFile)
fakeBridge.start();
