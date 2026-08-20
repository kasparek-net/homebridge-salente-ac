<p align="center">
  <img src="https://raw.githubusercontent.com/homebridge/branding/latest/logos/homebridge-color-round-stylized.png" width="140">
</p>

<h1 align="center">homebridge-salente-ac</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/homebridge-salente-ac"><img src="https://img.shields.io/npm/v/homebridge-salente-ac.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/homebridge-salente-ac"><img src="https://img.shields.io/npm/dt/homebridge-salente-ac.svg" alt="npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/homebridge-salente-ac.svg" alt="license"></a>
</p>

Homebridge plugin for the **Salente SummerICE9** portable air conditioner.
Controls it **locally over the LAN** using Tuya protocol 3.5 — no cloud, no
internet dependency and no Tuya IoT trial to keep renewing.

## Why it exists

The existing Tuya plugins for Homebridge fall apart on this device: they open a
connection and get `ECONNRESET` within a second. The network, the local key and
the device itself were all ruled out — [`tuyapi`](https://github.com/codetheweb/tuyapi)
reads and writes reliably with the very same credentials. So this plugin builds
on it directly.

## Installation

```
npm install -g homebridge-salente-ac
```

## Configuration

The plugin ships a `config.schema.json`, so it can be set up through the
Homebridge UI. By hand it looks like this:

```json
{
  "accessory": "SalenteAC",
  "name": "Air Conditioner",
  "id": "bfxxxxxxxxxxxxxxxxxxxx",
  "key": "xxxxxxxxxxxxxxxx",
  "ip": "192.168.1.140",
  "version": "3.5"
}
```

| Option | Default | Description |
|---|---|---|
| `id` | — | Virtual ID from Smart Life → Device Information |
| `key` | — | Local key; changes when the device is paired again |
| `ip` | — | Reserve it in your router's DHCP |
| `version` | `3.5` | Tuya protocol version |
| `minTemperature` | `16` | Lower bound |
| `maxTemperature` | `32` | Upper bound |
| `pollInterval` | `15` | Poll interval in seconds |

Get `id` and `key` with `npx @tuyapi/cli wizard`.

## What it exposes

A HomeKit `HeaterCooler` service:

| Characteristic | Datapoint |
|---|---|
| Active | `1` |
| CurrentTemperature | `3` |
| CoolingThresholdTemperature | `2` (16–32 °C) |
| RotationSpeed | `5` (`Low` / `High`) |

Turning the unit on also sets cooling mode (datapoint `4` = `Cool`) so it does
not resume the dehumidify or fan-only mode it used last.

The unit cannot heat, so `TargetHeaterCoolerState` offers cooling only.
Dehumidify and fan-only are not exposed — `HeaterCooler` has no room for them.

## Notes

State is cached and refreshed in the background, so HomeKit never waits on the
network. The plugin reconnects on its own if the connection drops.

Protocol 3.5 is required for this device — 3.3 and 3.4 both fail to establish a
usable session. If you have a different unit and it does not work, try changing
`version`.

## License

MIT
