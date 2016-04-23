# Bridge

The bridge collects data from devices with sensors setup and sends this data to the API.

A single bridge can have multipule devices, but a bridge belongs to only a single building.

## Configuration

See the ``config.example`` file.

### Name
The ``name`` of the configuration file. To be displayed in diagnostic messages.

### API Communication
The ``apiCommunication`` object defines the ``apiEndpoint`` to use for requests and the ``bridgeId`` data is added against.

The ``bridgeSecret`` is used to authenticate requests from this bridge and should be kept a secret!

A bridge must be setup in the API prior to use.

### Devices
A device is not a concept known to the API. A device is a single physical device which will contain multipule sensors.

- ``name`` is used for diagnostic output purposes.
- ``type`` is used to determine which driver to use.
- ``pollFrequency`` is how often the device will be checked for data in seconds.
- ``devicePath`` is the filesystem path to the serial device.

#### Sensors
A device contains several sensors.

- ``id`` is the API ID for the sensor (sensor setup in API prior to use)
- Key fields are used to identify which sensor. These are dependant on the device.

## Writing device software
### Device Object
A device object is a standard format used by all devices.

The constructor must be:
``configuration, sendSensorData, logContext``

Where:
- ``configuration`` is the configuration for the device.

- ``sendSensorData`` is a ``function (sensorId, sensorData)``

This should be run as soon as possible after sensor data received such that the data is considered current (timestamp will be added).
 
- ``logContext`` is a LogContext object.

The device must implement the following methods:

- start() - should start collection running.
- stop() - shound stop collection from running.
 
### Allow device autoloading
Device objects are found using the ``type`` of the device. These mappings from ``type`` to device object are setup in ``sensordrivers.js``.

### Device driver
Typically, device driver's should be written to provide high level functions for a device's raw functions.

For example, for a SmartCircuit device, the driver provides the ability to clear data and fetch data. It is up to the device object to fetch using clear data and fetch data but these sort of tricks should not be performed at the driver level.