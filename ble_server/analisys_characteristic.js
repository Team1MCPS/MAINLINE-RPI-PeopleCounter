var util = require('util');
var bleno = require('bleno');
const http = require('http');
const request = require('sync-request');
var BlenoCharacteristic = bleno.Characteristic;

var AnalysisCharacteristic = function() {
  AnalysisCharacteristic.super_.call(this, {
    uuid: '77962ccf-b032-4467-b03f-1bde4f9bcf71',
    properties: ['write'],
    value: null
  });
  this._value = Buffer.from("#");
  this._updateValueCallback = null;
};


util.inherits(AnalysisCharacteristic, BlenoCharacteristic);

AnalysisCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;
  console.log('onWriteRequest: value = ' + this._value.toString('hex'));
  console.log('Starting video analysis');
  const optionsStart = {
    hostname: '127.0.0.1',
    port: 5000, // Port used by flask
    path: '/opencamera',
    method: 'GET'
  }
  // Starts the the analysis via flask
  const req = http.request(optionsStart, res => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', d => {
    process.stdout.write(d);
    })
  })
  req.on('error', error => {
    console.error(error);
  })
  req.end();
  if (this._updateValueCallback) {
    console.log('onWriteRequest: notifying');
    this._updateValueCallback(this._value);
  }
  callback(this.RESULT_SUCCESS);
};

module.exports = AnalysisCharacteristic;