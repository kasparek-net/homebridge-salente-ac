# homebridge-salente-ac

Homebridge plugin pro mobilní klimatizaci **Salente SummerICE9**. Ovládá ji
**lokálně po LAN** přes Tuya protokol 3.5 — bez cloudu, bez závislosti na
internetu a bez prodlužování trialu na Tuya IoT platformě.

## Proč vznikl

Existující Tuya pluginy pro Homebridge se na tomhle zařízení rozpadají:
naváží spojení a do vteřiny dostanou `ECONNRESET`. Ověřeno, že problém není
v síti, klíči ani zařízení — knihovna [`tuyapi`](https://github.com/codetheweb/tuyapi)
se stejnými údaji čte data spolehlivě. Tenhle plugin proto staví přímo na ní.

## Instalace

```
npm install -g homebridge-salente-ac
```

## Konfigurace

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

`id` a `key` získáš přes `npx @tuyapi/cli wizard`. Klíč se mění pokaždé,
když zařízení odpáruješ a znovu spáruješ ve Smart Life.

## Co vystavuje

HomeKit službu `HeaterCooler`:

| Charakteristika | Datapoint |
|---|---|
| Active | `1` |
| CurrentTemperature | `3` |
| CoolingThresholdTemperature | `2` (16–32 °C) |
| RotationSpeed | `5` (`Low` / `High`) |

Se zapnutím se rovnou nastaví režim chlazení (datapoint `4` = `Cool`), aby
stroj nenaskočil do naposledy použitého odvlhčování nebo ventilátoru.

Zařízení neumí topit, takže `TargetHeaterCoolerState` nabízí pouze chlazení.
Odvlhčování a samostatný ventilátor vystavené nejsou — `HeaterCooler` pro ně
nemá místo.

## Poznámky

Hodnoty se drží v cache a na pozadí se obnovují (výchozí interval 15 s), takže
HomeKit nikdy nečeká na síť. Při výpadku spojení se plugin sám připojuje znovu.

## Licence

MIT
