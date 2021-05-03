const bleno = require('bleno');
const http = require('http');
var BlenoPrimaryService = bleno.PrimaryService;
var PeopleCharacteristic = require('./characteristic');
const SERVICE_UUID = '9e3764f5-e264-4135-a2a9-70f5b8c8330e';

const optionsStart = {
  hostname: '127.0.0.1',
  port: 5000, // Port used by flask
  path: '/opencamera',
  method: 'GET'
}

// Starts the flask service
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

bleno.on('stateChange', function(state) {
    console.log('on stateChange: ' + state);
    if (state === 'poweredOn') {
      bleno.startAdvertising('PeopleCounter', [SERVICE_UUID]);
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
            new PeopleCharacteristic()
          ]
        })
      ]);
    }
  });