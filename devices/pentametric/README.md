# Pentametric device

Communicates with a Bogart Engineering PentaMetric DC sensor device through the USB port.

## Supported devices
This device driver has been tested with:

* Bogart Engineering PentaMetric PM-5000-U

## Device Configuration
In addition to `id`, `type` and `sensors` which are common to all devices, this device accepts:

* `devicePath`

  The filesystem path to the serial device.
  On Linux systems using paths in `/dev/serial/by-path/` is recommended as this identifies the device by it's USB port rather than the order is was connected.

## Sensor Configuration
In addition to `id` which is common to all devices, sensor configuration for this device accepts:

* `sensorType`

  Either "current" or "voltage".

* `sensorNumber`

  For "current" sensors, this is 1 or 2. For "voltage" sensors this is between 1 and 3.

## Testing
**Single Test**

Fetches all sensor values from the device once.

Run `node singletest.js [device]`.

**Repeat Test**

Repeatedly fetches all sensor values from the device.

Run `node repeattest.js [device] [keep trying, default: false]`.
