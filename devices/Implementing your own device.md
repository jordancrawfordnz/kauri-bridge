# Implementing your own device

The bridge is built to be modular, meaning new devices can be easily added later, provided the follow to the following API.

## `device.js`
The device object follows a standard format used by all devices.

The constructor takes the following parameters:
* ``configuration`` (object)
  * This is the configuration for the device from the config JSON file.
* ``logContext`` (object)
  * This is a LogContext (defined in `src/lib/logcontext.js`) object which is pre-scoped with the device name.

The device must implement the following methods:

* ``fetch()``
  * Fetches the latest data for all the devices sensors.
  * Returns a promise.
  * When the promise resolves, this provides an array with objects of the form:
  ```
    {
      id : [sensor ID],
      value : [received sensor value]
    }
  ```

## Device folders
A folder with the devices name should be created in `devices`. All the devices files should be defined in this folder.

The device should have a `README.md` file defined which explains it's purpose and options.

## Device auto-loading

You don't need to worry about loading your device manually. Device objects are found automatically using the `type` of the device (the code which does this is in `devices.js`).
