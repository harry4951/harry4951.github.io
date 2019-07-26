(function() {
  'use strict';

  class HeartRateSensor {
    constructor() {
      this.device = null;
      this.server = null;
      this._characteristics = new Map();
    }
    connect() {
      let options = {
        filters: [
          {name: 'WRLDS_GEN2'}
        ],
        optionalServices: [0x1811]
      }
      //return navigator.bluetooth.requestDevice({filters:[{services:[ 0x1811 ]}]})
      //return navigator.bluetooth.requestDevice({filters:[{name:[ 'WRLDS_GEN2' ]}]})
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        // Human-readable name of the device.
        console.log(this.device.name);
        // Attempts to connect to remote GATT Server.
        return device.gatt.connect();
      })
      .then(server => {
        this.server = server;
      //   // Getting Battery Service...
      //   return server.getPrimaryService('alert_notification');
      // })
      // .then(service => {
      //   //Getting Battery Level Characteristic...
      //   return service.getCharacteristic(0x2A56);
      // })
      // .then(characteristic => characteristic.startNotifications())
      // .then(characteristic => {
      //   // Set up event listener for when characteristic value changes.
      //   characteristic.addEventListener('characteristicvaluechanged',
      //                                   handleBatteryLevelChanged);
      //   //Reading acc data...
      //   return characteristic.readValue();
      // })
      // .then(value => {
      //   //console.log('acc value is' + value.getUint16(0) + ',' + value.getUint16(1) + ',' + value.getUint16(2));
      //   console.log('acc value is' + value);
      //})
        return Promise.all([
          server.getPrimaryService('alert_notification').then(service => {
            return Promise.all([
              //this._cacheCharacteristic(service, 'body_sensor_location'),
              //this._cacheCharacteristic(service, 'heart_rate_measurement'),
              this._cacheCharacteristic(service, 0x2A56),
            ])
          })
        ]);
        })
      .catch(error => { console.log(error); });

      // function handleBatteryLevelChanged(event) {
      //   let batteryLevel = event.target.value;
      //   console.log('Battery percentage is ' + batteryLevel.getUint16(0));
      //   // TODO: Parse Heart Rate Measurement value.
      // }
    }

    /* Heart Rate Service */

    getBodySensorLocation() {
      return this._readCharacteristicValue('body_sensor_location')
      .then(data => {
        let sensorLocation = data.getUint8(0);
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
      return this._startNotifications(0x2A56);
    }
    stopNotificationsHeartRateMeasurement() {
      return this._stopNotifications(0x2A56);
    }
    parseHeartRate(event) {
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      let value = event.target.value;
      
      value = value.buffer ? value : new DataView(value);
      let result = {};
      let accArray = [];
      for (let index = 0; index < value.byteLength; index += 2) {
        accArray.push(value.getUint16(index, /*littleEndian=*/true));
      }
         result.heartRate = accArray;
      // let flags = value.getUint8(0);
      // let rate16Bits = flags & 0x1;
      // let result = {};
      // let index = 1;
      // if (rate16Bits) {
      //   result.heartRate = value.getUint16(index, /*littleEndian=*/true);
      //   index += 2;
      // } else {
      //   result.heartRate = value.getUint8(index);
      //   index += 1;
      // }
      // let contactDetected = flags & 0x2;
      // let contactSensorPresent = flags & 0x4;
      // if (contactSensorPresent) {
      //   result.contactDetected = !!contactDetected;
      // }
      // let energyPresent = flags & 0x8;
      // if (energyPresent) {
      //   result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
      //   index += 2;
      // }
      // let rrIntervalPresent = flags & 0x10;
      // if (rrIntervalPresent) {
      //   let rrIntervals = [];
      //   for (; index + 1 < value.byteLength; index += 2) {
      //     rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
      //   }
      //   result.rrIntervals = rrIntervals;
      // }
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
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.readValue()
      .then(value => {
        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
        value = value.buffer ? value : new DataView(value);
        return value;
      });
    }
    _writeCharacteristicValue(characteristicUuid, value) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.writeValue(value);
    }
    _startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to set up characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.startNotifications()
      .then(() => characteristic);
    }
    _stopNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to remove characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.stopNotifications()
      .then(() => characteristic);
    }
  }

  window.heartRateSensor = new HeartRateSensor();

})();
