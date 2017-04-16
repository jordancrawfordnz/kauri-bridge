# Dataset

**Type:** Offgrid System

**Amount of data:** 1 week

**Reading frequency:** 10 seconds

## About this Setup
![A diagram of the system](Setup.png?raw=true)

This dataset was collected from an Offgrid System consisting of:

* A six panel solar PV array.
* A small wind turbine.
* A 230 Volt AC petrol generator.
* A 24 Volt deep-cycle battery set.
* An inverter/charger with support for low voltage disconnect (LVD).
* A solar controller.

*V1 in the diagram has been excluded from the dataset as it is not used for processing.*

## Sensor Devices
Two sensor devices are used to collect this data:

### Bogart Engineering PentaMetric PM-5000-U
This device is capable of monitoring two DC voltages and three DC currents. The device was interfaced with the bridge via USB.

The `pentametric` bridge driver was used to communicate with this device.

#### Sensors:

* **System load current** (A1, `system_load_current` column, **DC Current**)

The current flow (in Amps) from the system to the inverter. This is negative when the system is providing energy to the inverter but positive if the inverter is charging the system.

* **Solar current** (A2, `solar_current` column, **DC Current**)

The current flow (in Amps) from the solar controller to the battery. This is positive or zero. Any negative values should be ignored as sensor error.

* **Battery current** (A3, `battery_current` column, **DC Current**)

The current flow to the battery (in Amps). This is a positive value if the battery is charging.

* **Battery voltage** (V2, `battery_voltage` column, **DC Voltage**))

The voltage across the terminals of the battery (in Volts). This can be used as an indication of a battery empty event.

### WattsUp Smart Circuit 20

The Smart Circuit device is labeled as **SC** in the diagram above. This device monitors the AC electricity usage of a load connected to it. The `smartcircuit` bridge driver was used to communicate with this device.

* **Building Power** (SC, `ac_power` column, **AC Power**)
The full power consumption of the house, including when the generator is running (measured in Watts).

## Recommended Configuration

### Building and People

#### Building

* **Standard axis for power graphs**: 1500 Watts
* **Standard axis for daily energy graphs**: 10,000 Wh

### Data Processing

#### Processing Options

* **Size of reading gaps to ignore**: 5 minutes gap.

#### Battery State Options

* **Critical low voltage level**: 23.1 Volts
* **Low voltage trigger time**: 50 seconds
* **Daily Aging Percentage**: 3% per day
* **Tolerance Percentage**: +/- 10%
* **High power threshold**: 500 Watts
* **Re-calculate charge efficiency multiplier**: 8 times the charge capacity
* **Battery current sensor**: A sensor populated with values from the `battery_current` column.
* **Battery voltage sensor**: A sensor populated with values from the `battery_voltage` column.
* **Building power sensor**: A sensor populated with values from the `ac_power` column.
* **Load current sensor**: A sensor populated with values from the `system_load_current` column.
* **House consumption colour**: Renewable red

#### Energy Flow Options

#### Energy Sources

* **Petrol**
  * Source Current Sensor: Charger (when load current is positive)
  * Graph sort index: 1
  * Is a renewable energy source: No
  * Chart colour: Coal Burning Black
  * Prediction Type: None (assume always providing no charge)

* **Solar**
  * Source Current Sensor: Solar Current
  * Graph sort index: 2
  * Is a renewable energy source: Yes
  * Chart colour: Sunshine Yellow
  * Prediction Type: Daily cycle (moving average)

* **Wind**
  * Source Current Sensor: Other (remaining energy generation)
  * Graph sort index: 3
  * Is a renewable energy source: Yes
  * Chart colour: Hydro Blue
  * Prediction Type: Hourly cycle (exponential average)
