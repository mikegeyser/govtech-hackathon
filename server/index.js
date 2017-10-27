const app = require('express');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const noble = require('noble');

server.listen(4201);

let myHeartRate;
const myAddress = '97d781f24f2045fd8d76a945deb6a007';

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
