# SmartCircuit device

Communicates with a WattsUp Smart Circuit device through the USB port.

## Supported devices
This device has been tested with:
* WattsUp Smart Circuit 20

## Device Configuration
In addition to `id`, `type` and `sensors` which are common to all devices, this device accepts:

* `devicePath`

  The filesystem path to the serial device.
  On Linux systems using paths in `/dev/serial/by-path/` is recommended as this identifies the device by it's USB port rather than the order is was connected.

## Sensor Configuration
In addition to `id` which is common to all devices, sensor configuration for this device accepts:

* `sensorKey`

  One of:
  * power
  * voltage
  * current
  * powerFactor
  * frequency

## Testing
**Single Test**

Fetches all sensor values from the device once.

Run `node singletest.js [device]`.

**Repeat Test**

Repeatedly fetches all sensor values from the device.

Run `node repeattest.js [device] [keep trying, default: false]`.
