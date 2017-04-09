# Static Fake device

When requested for readings, the Static Fake Device sends the constant value defined in the sensor's configuration. This is useful when you want to test the bridge or the processing capability of the API.

## Device Configuration
This device does not accept any parameters other than `id`, `type` and `sensors` which are common to all devices.

## Sensor Configuration
In addition to `id` which is common to all devices, sensor configuration for this device accepts:

* `value`

This is the constant value to send for the sensor device.
