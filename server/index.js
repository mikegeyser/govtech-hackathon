const app = require('express');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const noble = require('noble');

server.listen(4201);

let myHeartRate;
let heartRateCharacteristic;
const myAddress = '97d781f24f2045fd8d76a945deb6a007';
const heartRateCharAddress = "2a37"

noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        noble.startScanning();
        console.log('Started Scanning');
    } else {
        noble.stopScanning();
        console.log('Is bluetooth on?');
    }
});

noble.on('discover', (peripheral) => {
    if (peripheral.uuid === myAddress){
        console.log("Found HRM");

        io.emit("connected", true);
        noble.stopScanning();

        myHeartRate = peripheral;

        peripheral.connect(connectToPeripheral);
    }
});

function connectToPeripheral(error) {
    if (error) {
        console.log(`Could not connect to HRM ${error}`);
    } else {
        setInterval(updateValues, 5000);

        myHeartRate.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
            heartRateCharacteristic = characteristics.filter((item) => item.uuid === heartRateCharAddress)[0];

            heartRateCharacteristic.notify(true, function(error) {});

            heartRateCharacteristic.on('data', function(data, isNotification) {
                let heartRateData = parseHeartRate(data);
                console.log(`Heart Rate: ${heartRateData.heartRate}`);
                io.emit("heartrate", heartRateData.heartRate);
            });
        });

        myHeartRate.on('disconnect', () => {
            io.emit("connected", false);
            console.log('Disconnected');
            clearInterval(updateValues);
            noble.startScanning();
        });
    }
}

function updateValues() {
    myHeartRate.updateRssi((error, rssi) => {
        if (error) {
            console.log(`Could not get rssi value ${error}`)
        } else {
            const distance = calculateDistance(rssi);
            console.log(`Distance: ${distance}`);
            io.emit("distance", distance);
        }
    });
}

function calculateDistance(rssi) {
    
    var txPower = -59 //hard coded power value. Usually ranges between -59 to -65
    
    if (rssi == 0) {
      return -1.0; 
    }
  
    var ratio = rssi*1.0/txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio,10);
    }
    else {
      var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
      return distance;
    }
  } 

  function parseHeartRate(value) {
    value = new DataView(value.buffer);
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