# (deprecated) moved ds-cctalk
CCTalk Node.js Implamentation Classes

## Importent 
Please don't use this the active Maintained version is https://github.com/direktspeed/node-cctalk

```
npm i node-cctalk
```

```
const cc = require('ds-cctalk')

// Use
cc.device() // Register / Create a Device
cc.bus() // Open a new Connection gets used by device if not defined befor
cc.command() // gets used by bus and device for the sendCommand and sendCommandRaw prototypes
// running this file as main
if(!module.parent) {

  var usbBus =  new CCBus('/dev/ttyUSB0');

  var cd = new require(usbBus, { dest: 2, timeout: 1000 });

  cd.on('error', function(e) {
    debug('emp800::')(e);
  });

  cd.on('ready', function() {
    try {
      debug('emp800::')('ready');
      cd.enableAcceptance();
      cd.setAcceptanceMask(0xFFFF);
      // Example sendCommand for usage see CCTalk Spec for more information
      // cd.sendCommand({ src: 1, dest: 2, command: 231, data: new Uint8Array(0) });
      cd.on('error', function(e) { debug('emp800::')('error', e); });
      cd.on('accepted', function(c) {
        debug('emp800::')('Accepted', c);
        cd.getCoinName(c).then(function(name) { debug('emp800::')(name); });
      });
      cd.on('inhibited', function(c) {
        debug('emp800::')('Inhibited', c);
        cd.getCoinName(c).then(function(name) { debug('emp800::')(name); });
      });
      cd.on('rejected', function(c) { debug('emp800::')('Rejected', c); });
    } catch(e) {
      debug('emp800::')(e, e.stack);
    }
  });


}



```


If You need help implamenting this feel free to asks
Wenn Sie Hilfe brauchen bei der Implementierung fragen Sie ruhig
