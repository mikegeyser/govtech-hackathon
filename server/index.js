const app = require('express');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(4201);

const noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning();
        noble.on('discover', function(peripheral) { 
            
            var macAdress = peripheral.uuid;

            if (macAdress == "97d781f24f2045fd8d76a945deb6a007") {

                var rss = peripheral.rssi;
                var localName = peripheral.advertisement.localName; 
                console.log(". Mac Address: " + macAdress + ", RSS: " + rss + ", Local Name: " + localName); 
                
                peripheral.connect((error) => {
                    setInterval(() => {
                        console.log("Update RSSI")
                        peripheral.updateRssi((error, rssi) => {
                            const distance = calculateDistance(rssi);
                            console.log(`Distance: ${distance}`);
                            io.emit("distance", distance);
                        });
                    }, 5000);
                });
            }
        });
    }
    else
      noble.stopScanning();
});



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
