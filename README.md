# Bridge

The bridge collects data from devices with sensors setup and sends this data to the API.

A single bridge can have multipule devices, but a bridge belongs to only a single building.

## Configuration

See the ``example.json`` file.

### Name
The ``name`` of the configuration file. To be displayed in diagnostic messages.

### API Interaction
The ``apiInteraction`` object defines the ``apiEndpoint`` to use for requests and the ``bridgeId`` data is added against.

The ``bridgeSecret`` is used to authenticate requests from this bridge and should be kept a secret!

A bridge must be setup in the API prior to use.

### Device Poll Frequency
``devicePollFrequency`` is how often all devices will be checked for data in seconds. This should be something divisible by 60 (for consistancy between clients), otherwise 10 will be used.

### Data Send Frequency
``dataSendFrequency`` is how often readings will be pushed to the API as a batch. This should be something divisible by 60 (for consistancy between clients), otherwise 10 will be used.

### Devices
A device is not a concept known to the API. A device is a single physical device which will contain multipule sensors.

- ``name`` is used for diagnostic output purposes.
- ``type`` is used to determine which driver to use.
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
 
- ``logContext`` is a LogContext object.

The device must implement the following methods:

- ``fetch()`` - should fetch the latest data for all the devices sensors. Returns a promise with an array of ``{ id : [id], value : [value] }``.
 
### Allow device autoloading
Device objects are found using the ``type`` of the device. These mappings from ``type`` to device object are setup in ``sensordrivers.js``.

### Device driver
Typically, device driver's should be written to provide high level functions for a device's raw functions.

For example, for a SmartCircuit device, the driver provides the ability to clear data and fetch data. It is up to the device object to fetch using clear data and fetch data but these sort of tricks should not be performed at the driver level.