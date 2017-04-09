# CSV Fake device

When requested for readings, the CSV Fake Device maps values from a CSV file into it's configured sensors as defined. This is useful when you want to test the bridge or the processing capability of the API.

Each call to fetch readings from this devices increments the CSV row in use. When all CSV rows have been used, the device starts again from the first row.

## Device Configuration
In addition to `id`, `type` and `sensors` which are common to all devices, this device accepts:

* `file_path`

This is the relative path from the current directory to the CSV file of the dataset to use. The CSV file is expected to have a header row which defines the column names used in the sensor configuration.

* `startingReadingIndex` (optional, default 0)

This optional parameter defines the starting reading index for the CSV. Use this if you want to start running the dataset from a particular point (for example to reach a problematic piece of the data earlier).

## Sensor Configuration
In addition to `id` which is common to all devices, sensor configuration for this device accepts:

* `column`

This is the name of the column (as defined by the header row) to send for this sensor.
