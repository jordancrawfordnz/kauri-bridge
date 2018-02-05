# Testing

## Fake Bridge
The fake bridge shares much of the same code as the real bridge, but rather than sending live readings, the fake bridge is used with fake sensors to backfill historical readings at an increased rate.

This is useful to test the processing capability of the API.

Run the fake bridge with `node startfakebridge.js [relative path to fake bridge configuration file]`.

**[For a full guide on using the fake bridge, see the Kauri guide about this](https://github.com/jordancrawfordnz/kauri-energy-monitor/tree/master/docs/using-fakebridge.md)**

### Configuration

#### `name` (string)
The name of the configuration file. To be displayed in diagnostic messages. e.g.: "Bridge PC".

#### `apiInteraction` (object)
The same API interaction object as described in [the main readme](../README.md).

#### `fillFrom` (date and time, HH:MM:SS DD/MM/YYYY)
The time to start data backfill from.

#### `fillUntil` (date and time, HH:MM:SS DD/MM/YYYY)
The time to backfill data until.

#### `readingInterval` (number, seconds)
The gap between readings. For example, if this is set to "10", filling from "00:00:00 01/01/2017" readings would be at "00:00:10 01/01/2017", "00:00:20 01/01/2017", etc.

#### `readingDelay` (number, milliseconds)
The time to wait between readings. If you have a capable system, this can be set to 0.

#### `maxPerBatch` (number, optional)
The fake bridge batches data to the API for efficiency. The default is `APIInteraction.MAX_READINGS_PER_BATCH`.

### Datasets
* [`offgrid_1week_10secintervals`](datasets/offgrid_1week_10secintervals)

## Test Serial Devices
Use `node test/testserialdevices.js` to list all available serial devices.
