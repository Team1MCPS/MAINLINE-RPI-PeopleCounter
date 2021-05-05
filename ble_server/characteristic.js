var util = require('util');
var bleno = require('bleno');
const http = require('http');
const request = require('sync-request');
var BlenoCharacteristic = bleno.Characteristic;

var PeopleCharacteristic = function() {
  PeopleCharacteristic.super_.call(this, {
    uuid: '3e715fb3-6d8d-442c-8ec6-a35ff777799c',
    properties: ['read'],
    value: null
  });
  this._value = Buffer.from("#");
  this._updateValueCallback = null;
};

util.inherits(PeopleCharacteristic, BlenoCharacteristic);

PeopleCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('onReadRequest: value = ' + this._value.toString('hex'));
  //Get the value of delta
  var res = request('GET', 'http://127.0.0.1:5000/camdata');
  var d = res.getBody();
  var data = JSON.parse(d.toString());
  var delta = data.data.delta;
  var str = String(delta);
  this._value = Buffer.from(str);
  callback(this.RESULT_SUCCESS, this._value);
};

module.exports = PeopleCharacteristic;