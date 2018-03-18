# Kauri Bridge
## What is this?

*Kauri Bridge is part of:*
<br><a href="https://github.com/jordancrawfordnz/kauri-energy-monitor"><img src="resources/logo-small.png"></a>

**Kauri Energy Monitor** is a cloud-based system for monitoring your off-grid energy systems.

**Kauri Bridge** communicates with your sensor devices, collects data and sends it to your Kauri server.

### Features
* Supports communication with several sensor devices on a single bridge.
* Can handle failed network connections - keeps readings until the Kauri server is reachable.
* Highly configurable, e.g.: can configure how often data is read and sent to Kauri.
* Sends data to Kauri in batches to lower server and network load.
* Can be expanded to work with additional sensor devices.
* Can run on most hardware - you just need to be able to run NodeJS.

## [Devices](devices)
All supported devices and how to implement your own device.

## Running the bridge
1. [Install Node](https://nodejs.org/en/download/) on your system.

2. From the project's folder, run `npm install` to install dependencies.

3. Run `node start.js [relative path to config file]` to start the bridge.

### Running the bridge with PM2
[PM2](http://pm2.keymetrics.io) is a process manager for Node. When used with the bridge it restart the process if the bridge crashes, starts the bridge at boot, and lets you view the logs.

1. Install PM2 with `npm install -g pm2`.

2. Run `pm2 start start.js --name="Bridge" -- [config file]`.

3. Run `pm2 startup` to start PM2 automatically at boot.

4. Run `pm2 save` to save your current PM2 processes.

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

  The bridge ID is required to identify readings from this bridge. You can get this by creating a bridge in Kauri Energy Monitor under "Configuration" -> "Data Collection".

* `bridgeSecret` (string)

  The bridge secret is like the password for your bridge. This ensures only your can upload readings for your building! This is provided in Kauri Energy Monitor under "Configuration" -> "Data Collection".

### `devicePollFrequency` (number, in seconds)
The device poll frequency is how often all devices will be checked for data in seconds. This should be something divisible by 60 (for consistency between bridge clients), otherwise 10 will be used.

### `dataSendFrequency` (number, in seconds)
The data send frequency is how often readings will be pushed to the API as a batch. This should be something divisible by 60 (for consistency between bridge clients), otherwise 10 will be used.

### `devices` (array of objects)
A device is not a concept known to the API. A device is a single physical device which will contain multiple sensors.

A device is an object which consists of:

* `name` (string)

  Used for diagnostic output purposes.

* `type` (string)

  Used to determine which driver to use.

* `sensors` (array of sensor objects as defined below)

#### Sensors
A device contains several sensors. Sensors must be configured in Kauri Energy Monitor under "Configuration" -> "Data Collection" -> [your bridge] -> "Sensors". Here, the sensor ID is available.

Each sensor is an object consisting of:

* `id` (string)

  The API ID for the sensor (sensor setup in API prior to use).

* Additional fields will be required by the device to identify the sensor. Please see the read me for the device you are using for these options.

## Testing
There are two approaches you can use for testing. Fake sensors (see [devices](devices) for information) can be configured to send fake data to the API. This is useful if you need to test the API's live data processing.

Alternatively, you can use the fake bridge to bulk send data from a fake sensor to the API. This works great if you need a way to back populate a large amount of data into the API. See [testing](test) for more information about this.

## Licence
[MIT](LICENSE)
