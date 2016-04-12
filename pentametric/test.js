'use strict';

// Opens a Pentametric device and starts outputting readings.
module.exports.singleTest = function(pentametricDevice) {
	return pentametricDevice.getVoltageReading(1).then(function(volt1) {
		return pentametricDevice.getVoltageReading(2).then(function(volt2) {
			return pentametricDevice.getCurrentReading(1).then(function(amp1) {
				return pentametricDevice.getCurrentReading(2).then(function(amp2) {
					return pentametricDevice.getCurrentReading(3).then(function(amp3) {
						console.log("Volt1: " + volt1.toFixed(2) + ", Volt2: " + 
							volt2.toFixed(2) + ", Amp1: " + amp1.toFixed(2) + ", Amp2: "
							+ amp2.toFixed(2) + ", Amp3: " + amp3.toFixed(2));
					});
				});
			});	
		});
	});
};