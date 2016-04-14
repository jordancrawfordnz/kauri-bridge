'use strict';

var jsonfile = require('jsonfile')

var Configuration = {};

Configuration.load = function(path) {
	Configuration.current = jsonfile.readFileSync(path);
};

module.exports = Configuration;