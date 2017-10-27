import { Injectable } from '@angular/core';

@Injectable()
export class HeartRateService {
  private sensor = new HeartRateSensor();

  constructor() {
  }

  connect() {
    this.sensor.connect().then(_ => this.sensor.startNotificationsHeartRateMeasurement()
      .then((heartRateMeasurement) => {
        heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
          console.log(this.sensor.parseHeartRate(event.target.value));
          // const heartRateMeasurementblah = ;
          // statusText.innerHTML = heartRateMeasurement.heartRate + ' &#x2764;';
          // heartRates.push(heartRateMeasurement.heartRate);
          // drawWaves();
        });
      }));
  }
}

class HeartRateSensor {
  device: any;
  server: any;
  _characteristics: any;

  constructor() {
    this.device = null;
    this.server = null;
    this._characteristics = new Map();
  }
  connect() {
    const bluetooth = navigator['bluetooth'];

    if (!bluetooth) {
      return;
    }

    return bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
      .then(device => {
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        this.server = server;
        return Promise.all([
          server.getPrimaryService('heart_rate').then(service => {
            return Promise.all([
              this._cacheCharacteristic(service, 'body_sensor_location'),
              this._cacheCharacteristic(service, 'heart_rate_measurement'),
            ]);
          })
        ]);
      });
  }

  /* Heart Rate Service */

  getBodySensorLocation() {
    return this._readCharacteristicValue('body_sensor_location')
      .then(data => {
        const sensorLocation = data.getUint8(0);
        switch (sensorLocation) {
          case 0: return 'Other';
          case 1: return 'Chest';
          case 2: return 'Wrist';
          case 3: return 'Finger';
          case 4: return 'Hand';
          case 5: return 'Ear Lobe';
          case 6: return 'Foot';
          default: return 'Unknown';
        }
      });
  }
  startNotificationsHeartRateMeasurement() {
    return this._startNotifications('heart_rate_measurement');
  }
  stopNotificationsHeartRateMeasurement() {
    return this._stopNotifications('heart_rate_measurement');
  }
  parseHeartRate(value) {
    // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
    value = value.buffer ? value : new DataView(value);
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    const result = {
      heartRate: null,
      contactDetected: null,
      energyExpended: null,
      rrIntervals: null
    };
    let index = 1;
    if (rate16Bits) {
      result.heartRate = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    } else {
      result.heartRate = value.getUint8(index);
      index += 1;
    }
    const contactDetected = flags & 0x2;
    const contactSensorPresent = flags & 0x4;
    if (contactSensorPresent) {
      result.contactDetected = !!contactDetected;
    }
    const energyPresent = flags & 0x8;
    if (energyPresent) {
      result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    }
    const rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
      const rrIntervals = [];
      for (; index + 1 < value.byteLength; index += 2) {
        rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
      }
      result.rrIntervals = rrIntervals;
    }
    return result;
  }

  /* Utils */

  _cacheCharacteristic(service, characteristicUuid) {
    return service.getCharacteristic(characteristicUuid)
      .then(characteristic => {
        this._characteristics.set(characteristicUuid, characteristic);
      });
  }
  _readCharacteristicValue(characteristicUuid) {
    const characteristic = this._characteristics.get(characteristicUuid);
    return characteristic.readValue()
      .then(value => {
        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
        value = value.buffer ? value : new DataView(value);
        return value;
      });
  }
  _writeCharacteristicValue(characteristicUuid, value) {
    const characteristic = this._characteristics.get(characteristicUuid);
    return characteristic.writeValue(value);
  }
  _startNotifications(characteristicUuid) {
    const characteristic = this._characteristics.get(characteristicUuid);
    // Returns characteristic to set up characteristicvaluechanged event
    // handlers in the resolved promise.
    return characteristic.startNotifications()
      .then(() => characteristic);
  }
  _stopNotifications(characteristicUuid) {
    const characteristic = this._characteristics.get(characteristicUuid);
    // Returns characteristic to remove characteristicvaluechanged event
    // handlers in the resolved promise.
    return characteristic.stopNotifications()
      .then(() => characteristic);
  }
}
