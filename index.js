const TuyAPI = require('tuyapi');

// Datapoints verified by reading from a Salente SummerICE9 (protocol 3.5):
//   1 = power (bool)            2 = target temperature (16–32 °C)
//   3 = current temperature     4 = mode ("Cool" / "Dry" / "Wind")
//   5 = fan speed ("Low" / "High")
const DP = { POWER: '1', TARGET: '2', CURRENT: '3', MODE: '4', FAN: '5' };

let hap;

class SalenteAC {
  constructor(log, config) {
    this.log = log;
    this.name = config.name || 'Air Conditioner';
    this.minTemp = config.minTemperature || 16;
    this.maxTemp = config.maxTemperature || 32;
    this.dps = {};
    this.connected = false;

    this.dev = new TuyAPI({
      id: config.id,
      key: config.key,
      ip: config.ip,
      version: config.version || '3.5',
      issueGetOnConnect: true,
    });

    this.dev.on('connected', () => {
      this.connected = true;
      this.log.info(`Connected to ${this.name} (${config.ip})`);
    });
    this.dev.on('disconnected', () => {
      this.connected = false;
      setTimeout(() => this.connect(), 5000);
    });
    this.dev.on('error', (e) => this.log.debug(`tuya: ${e.message}`));
    this.dev.on('data', (d) => this.merge(d));
    this.dev.on('dp-refresh', (d) => this.merge(d));

    this.connect();
    setInterval(() => this.poll(), (config.pollInterval || 15) * 1000);

    const { Service: S, Characteristic: C } = hap;

    this.svc = new S.HeaterCooler(this.name);

    this.svc.getCharacteristic(C.Active)
      .onGet(() => (this.dps[DP.POWER] ? 1 : 0))
      .onSet((v) => this.setActive(v));

    this.svc.getCharacteristic(C.CurrentHeaterCoolerState)
      .onGet(() => (this.dps[DP.POWER] ? 3 : 0)); // 3 = COOLING, 0 = INACTIVE

    this.svc.getCharacteristic(C.TargetHeaterCoolerState)
      .setProps({ validValues: [2] }) // the unit can only cool
      .onGet(() => 2)
      .onSet(() => {});

    this.svc.getCharacteristic(C.CurrentTemperature)
      .onGet(() => Number(this.dps[DP.CURRENT]) || 20);

    this.svc.getCharacteristic(C.CoolingThresholdTemperature)
      .setProps({ minValue: this.minTemp, maxValue: this.maxTemp, minStep: 1 })
      .onGet(() => Number(this.dps[DP.TARGET]) || 24)
      .onSet((v) => this.send({ dps: Number(DP.TARGET), set: Math.round(v) }));

    this.svc.getCharacteristic(C.RotationSpeed)
      .setProps({ minValue: 0, maxValue: 100, minStep: 50 })
      .onGet(() => (this.dps[DP.FAN] === 'High' ? 100 : 50))
      .onSet((v) => this.send({ dps: Number(DP.FAN), set: v > 50 ? 'High' : 'Low' }));

    this.info = new S.AccessoryInformation()
      .setCharacteristic(C.Manufacturer, 'Salente')
      .setCharacteristic(C.Model, config.model || 'SummerICE9')
      .setCharacteristic(C.SerialNumber, String(config.id));
  }

  merge(d) {
    if (d && d.dps) Object.assign(this.dps, d.dps);
  }

  async connect() {
    try {
      await this.dev.connect();
    } catch (e) {
      this.log.debug(`connect: ${e.message}`);
      setTimeout(() => this.connect(), 10000);
    }
  }

  async poll() {
    if (!this.connected) return;
    try {
      this.merge(await this.dev.get({ schema: true }));
    } catch (e) {
      this.log.debug(`poll: ${e.message}`);
    }
  }

  async send(payload) {
    try {
      await this.dev.set(payload);
    } catch (e) {
      this.log.warn(`set: ${e.message}`);
    }
  }

  // Setting cooling mode together with power, otherwise the unit would resume
  // whatever mode it used last (dehumidify or fan only).
  async setActive(v) {
    try {
      await this.dev.set({ multiple: true, data: { [DP.POWER]: !!v, [DP.MODE]: 'Cool' } });
    } catch (e) {
      this.log.warn(`setActive: ${e.message}`);
    }
  }

  getServices() {
    return [this.info, this.svc];
  }
}

module.exports = (api) => {
  hap = api.hap;
  api.registerAccessory('homebridge-salente-ac', 'SalenteAC', SalenteAC);
};
