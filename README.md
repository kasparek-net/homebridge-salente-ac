<p align="center">
  <img src="https://raw.githubusercontent.com/homebridge/branding/latest/logos/homebridge-color-round-stylized.png" width="140">
</p>

<h1 align="center">homebridge-salente-ac</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/homebridge-salente-ac"><img src="https://img.shields.io/npm/v/homebridge-salente-ac.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/homebridge-salente-ac"><img src="https://img.shields.io/npm/dt/homebridge-salente-ac.svg" alt="npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/homebridge-salente-ac.svg" alt="license"></a>
</p>

Homebridge plugin pro mobilní klimatizaci **Salente SummerICE9**. Ovládá ji
**lokálně po LAN** přes Tuya protokol 3.5 — bez cloudu, bez závislosti na
internetu a bez prodlužování trialu na Tuya IoT platformě.

## Proč vznikl

Existující Tuya pluginy pro Homebridge se na tomhle zařízení rozpadají: naváží
spojení a do vteřiny dostanou `ECONNRESET`. Ověřeno, že problém není v síti,
klíči ani zařízení — knihovna [`tuyapi`](https://github.com/codetheweb/tuyapi)
se stejnými údaji čte i zapisuje spolehlivě. Tenhle plugin proto staví přímo
na ní.

## Instalace

```
npm install -g homebridge-salente-ac
```

## Konfigurace

Plugin má `config.schema.json`, takže se dá nastavit klikáním v Homebridge UI.
Ručně vypadá konfigurace takto:

```json
{
  "accessory": "SalenteAC",
  "name": "Klimatizace",
  "id": "bfxxxxxxxxxxxxxxxxxxxx",
  "key": "xxxxxxxxxxxxxxxx",
  "ip": "192.168.1.140",
  "version": "3.5"
}
```

| Pole | Výchozí | Popis |
|---|---|---|
| `id` | — | Virtual ID ze Smart Life → Device Information |
| `key` | — | Lokální klíč; mění se při novém spárování |
| `ip` | — | Doporučeno mít rezervovanou v DHCP |
| `version` | `3.5` | Verze Tuya protokolu |
| `minTemperature` | `16` | Spodní mez |
| `maxTemperature` | `32` | Horní mez |
| `pollInterval` | `15` | Interval dotazování v sekundách |

`id` a `key` získáš přes `npx @tuyapi/cli wizard`.

## Co vystavuje

HomeKit službu `HeaterCooler`:

| Charakteristika | Datapoint |
|---|---|
| Active | `1` |
| CurrentTemperature | `3` |
| CoolingThresholdTemperature | `2` (16–32 °C) |
| RotationSpeed | `5` (`Low` / `High`) |

Se zapnutím se rovnou nastaví režim chlazení (datapoint `4` = `Cool`), aby stroj
nenaskočil do naposledy použitého odvlhčování nebo ventilátoru.

Zařízení neumí topit, takže `TargetHeaterCoolerState` nabízí pouze chlazení.
Odvlhčování a samostatný ventilátor vystavené nejsou — `HeaterCooler` pro ně
nemá místo.

## Poznámky

Hodnoty se drží v cache a na pozadí se obnovují, takže HomeKit nikdy nečeká na
síť. Při výpadku spojení se plugin sám připojuje znovu.

Protokol 3.5 je u tohoto zařízení podmínkou — s 3.3 a 3.4 spojení selže. Pokud
máš jiný kus a nefunguje ti to, zkus prohodit `version`.

## Licence

MIT
