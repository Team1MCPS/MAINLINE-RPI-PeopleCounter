var util = require('util');
var bleno = require('bleno');
const http = require('http');
const request = require('sync-request');
var BlenoCharacteristic = bleno.Characteristic;

var PeopleCharacteristic = function() {
  PeopleCharacteristic.super_.call(this, {
    uuid: '3e715fb3-6d8d-442c-8ec6-a35ff777799c',
    properties: ['read', 'write', 'notify'],
    value: null
  });

  this._value = Buffer.from("#");
  this._updateValueCallback = null;
};


util.inherits(PeopleCharacteristic, BlenoCharacteristic);

PeopleCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('EchoCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));
  //Get the value of up or down
  var res = request('GET', 'http://127.0.0.1:5000/camdata');
  var d = res.getBody();
  var data = JSON.parse(d.toString());
  var delta = data.data.delta;
  var str = String(delta);
  this._value = Buffer.from(str);
  callback(this.RESULT_SUCCESS, this._value);
};


PeopleCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('EchoCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));

  if (this._updateValueCallback) {
    console.log('EchoCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  callback(this.RESULT_SUCCESS);
};

PeopleCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('EchoCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

PeopleCharacteristic.prototype.onUnsubscribe = function() {
  console.log('EchoCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};

module.exports = PeopleCharacteristic;