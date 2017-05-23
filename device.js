var EventEmitter = require('events');
const debug = require('debug');
const CCBus = require('./bus');
class CCDevice extends EventEmitter {
  constructor(bus, config){
    debug('CCDevice::')('NEW CCDevice');
    super();
    this.commands = this.commands || {};
    this.commands.simplePoll = 254;
    this.commands.addressPoll = 253;
    this.commands.addressClash = 252;
    this.commands.addressChange = 251;
    this.commands.addressRandom = 250;

    if(!bus && !config) {
      // initialize prototype only
      return;
    } else if(typeof bus == 'string') {
      this.bus = new CCBus(bus, config);
    } else {
      this.bus = bus;
    }
    console.log('DEVICE CONFIG', config);
    this.config = config || {};
    this.config.dest = this.config.dest;
  }
  onBusReady() {
    debug('CCDevice::')('Warn: CCTalk device proxy doesn\'t override onBusReady()');
  }
  onData(command) {
    // Don't do anything by default
    debug('CCDevice::')(command);
  }
  onBusClosed() {
    debug('CCDevice::')('Warn: CCTalk device proxy doesn\'t override onBusClosed()');
  }
  sendCommand(command) {
    debug('CCDevice::sendCommand::Set')('command.dest:', command.dest, '->', this.config.dest);
    command.dest = this.config.dest;
    return this.bus.sendCommand(command);
  }
}
module.exports = CCDevice;
