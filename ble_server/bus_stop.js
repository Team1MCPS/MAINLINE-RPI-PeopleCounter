var util = require('util');
const bleno = require('bleno');
var BlenoPrimaryService = bleno.PrimaryService;
const SERVICE_UUID = '8ae8d0e1-946a-4d8e-92fd-949c1f04d3e7';

bleno.on('stateChange', function(state) {
    console.log('on stateChange: ' + state);
    if (state === 'poweredOn') {
      bleno.startAdvertising('BusStop', [SERVICE_UUID]);
    } else {
      bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', function(error) {
    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
  
    if (!error) {
      bleno.setServices([
        new BlenoPrimaryService({
          uuid: SERVICE_UUID,
          characteristics: [
            new BusStopCharacteristic(),
          ]
        })
      ]);
    }
});

var BlenoCharacteristic = bleno.Characteristic;

var BusStopCharacteristic = function() {
    BusStopCharacteristic.super_.call(this, {
        uuid: '707479d0-5a40-4775-bf9a-ed7cc3fc726e',
        properties: ['read'],
        value: null
    });

    this._value = Buffer.from("234");
    this._updateValueCallback = null;
};


util.inherits(BusStopCharacteristic, BlenoCharacteristic);

BusStopCharacteristic.prototype.onReadRequest = function(offset, callback) {
    console.log('onReadRequest: value = ' + this._value.toString('hex'));
    callback(this.RESULT_SUCCESS, this._value);
};