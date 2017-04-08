# Example Configuration
This directory contains some example configuration files. All will need tweaking to make these work with your instance of the API and to communicate with your devices.

## [`ac_and_dc_sensors`](ac_and_dc_sensors.json)
A typical bridge configuration. This uses the `pentametric` and `smartcircuit` devices, each with two sensors defined.

## [`static_fake_sensor`](static_fake_sensor.json)
Uses the real bridge with the `staticfake` device to populate the bridge with constant values for each sensor as defined in the configuration.

## [`csv_fake_sensor`](csv_fake_sensor.json)
Uses the real bridge with the `csvfake` device to provide values from the `offgrid_1week_10secintervals` dataset as if they were being read live from a real device.

## [`fake_bridge`](fake_bridge.json)
Configuration for the fake bridge. Details on the fake bridge can be found in the [test directory](../test).

The fake bridge back populates data at speed, to setup a dataset for testing the API. This utilises the `staticfake` and `csvfake` devices, each with two sensors defined.
