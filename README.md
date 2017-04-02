# Renewable Energy Dashboard - Bridge

The bridge collects data from devices with sensors setup and sends this data to the API.

A single bridge can have multiple devices, but a bridge belongs to only a single building.

## Running the bridge
* Install NPM on your system.
* From the project's folder, run `npm install` to install dependencies.
* Run `node start.js [relative path to config file]` to start the bridge.

## Supported Devices
<!-- TODO: List all the supported devices with links to their readmes. -->

## Configuration
The configuration file is a JSON file. Below is a list of top level values that must be provided. For an example of a configuration file, see ``examples/config.json``.

### `name` (string)
The name of the configuration file. To be displayed in diagnostic messages. e.g.: "Bridge PC"

### `apiInteraction` (object)

This object defines all configuration needed to upload readings to the API.

It requires the following options:

* `apiEndpoint` (string)
  This is the full path the API endpoint, including the protocol, port, etc.

  e.g.: https://yourdomain.com/api

* `bridgeId` (string)
  The bridge ID is required to identify readings from this bridge. You can get this by creating a bridge in Renewable Energy Dashboard under "Configuration" -> "Data Collection".

* `bridgeSecret` (string)
  The bridge secret is like the password for your bridge. This ensures only your can upload readings for your building! This is provided in Renewable Energy Dashboard under "Configuration" -> "Data Collection".

### `devicePollFrequency` (number, in seconds)
The device poll frequency is how often all devices will be checked for data in seconds. This should be something divisible by 60 (for consistency between bridge clients), otherwise 10 will be used.

### `dataSendFrequency` (number, in seconds)
The data send frequency is how often readings will be pushed to the API as a batch. This should be something divisible by 60 (for consistency between bridge clients), otherwise 10 will be used.

### `devices` (array of objects)
A device is not a concept known to the API. A device is a single physical device which will contain multiple sensors.

A device is an object which consists of:

* `name` (string) is used for diagnostic output purposes.
* `type` (string) is used to determine which driver to use.
* `devicePath` (string) is the filesystem path to the serial device.
  On Linux systems using paths in `/dev/serial/by-path/` is recommended as this identifies the device by it's USB port rather than the order is was connected.
* `sensors` (array of sensor objects as defined below)

#### Sensors
A device contains several sensors. Sensors must be configured in Renewable Energy Dashboard under "Configuration" -> "Data Collection" -> [your bridge] -> "Sensors". Here, the sensor ID is available.

Each sensor is an object consisting of:

* `id` (string) is the API ID for the sensor (sensor setup in API prior to use)
* Key fields are used to identify which sensor. These are dependent on the device so see the read me for the device you're using.

## Implementing your own device
<!-- TODO: Link to device docs -->

## Testing
There are fake devices and a fake bridge which you can use to make development of the bridge or other parts of Renewable Energy Dashboard easier.

<!-- TODO: Link to the testing docs -->
