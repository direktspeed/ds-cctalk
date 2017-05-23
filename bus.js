/*
CCBus = Connection to port with CCTalk protocol
CCCommand = Command in CCTalk Formart
CCDevice = Register a Device on the CCBus
 */
'use strict';
//new 254
const CCCommand = require('./command');
const SerialPort = require('serialport');
const Promise = require('promise');
const timeout = require('promise-timeout').timeout;
const debug = require('debug');
// Should maybe extends SerialPort
class CCBus {
  constructor(port, config) {
    debug('CCBus::')('NEW CCBus');
    //this.config = defaults(config, { src: 1, timeout: 1000 });
    this.config = config || {};
    this.config.timeout = this.config.timeout || 1000;
    this.config.src = this.config.src || 1;
    console.log('CONFIG In:', config, ' -> CONFIG Out: ',this.config);
    this.parserBuffer = new Uint8Array(255+5);
    this.parserBuffer.cursor = 0;

    this.ser = new SerialPort(port, { baudRate: 9600, parser: this.parser });
    this.ser.parserBuffer = this.parserBuffer;
    this.connectionStatus = 'closed';

    this.onOpen = this.onOpen.bind(this);
    this.onData = this.onData.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
    this.ser.on('open', this.onOpen);
    this.ser.on('data', this.onData);
    this.ser.on('close', this.onClose);
    this.ser.on('error', this.onError);

    this.devices = {};
    this.lastCommand = null;
    this.commandChainPromise = Promise.resolve();
    console.log('BUS CONFIG2', this.config);
  }
  parser(emitter, buffer) {
    this.parserBuffer.set(buffer, this.parserBuffer.cursor);
    this.parserBuffer.cursor += buffer.length;
    while(this.parserBuffer.cursor > 1 && this.parserBuffer.cursor >= this.parserBuffer[1] + 5) {
      // full frame accumulated
      var length = this.parserBuffer[1] + 5;
      //debug('CCBus::')("length", length);

      //copy command from the buffer
      var frame = new Uint8Array(length);
      frame.set(this.parserBuffer.slice(0, length));

      // copy remaining buffer to the begin of the buffer to prepare for next command
      this.parserBuffer.set(this.parserBuffer.slice(length, this.parserBuffer.cursor));
      this.parserBuffer.cursor -= length;

      emitter.emit('data', new CCCommand(frame));
    }
  }
  forEachDevice(callback) {
    debug('CCBus::')('forEachDevice');
    let dests = Object.keys(this.devices).map((dest) => {
      debug('CCBus::forEachDevice')(dest);
      callback(this.devices[dest]);
    });
    debug('CCBus::')('registerDevice');
    return dests;
  }
  onOpen() {
    this.forEachDevice((device) => device.onBusReady());
  }
  onData(command) {
    debug('CCBus::onData')('data', command);
    if(command.dest != this.config.src){
      // Here we can log all Data for other devices
      return;
    }

    if(this.devices[command.src]) {
      this.devices[command.src].onData(command);
    }

    if(this.lastCommand) {
      var lastCommand = this.lastCommand;
      this.lastCommand = null;

      if(command.command === 0) {
        lastCommand.resolve(command);
      } else {
        lastCommand.reject(command);
      }
    }
  }
  onClose() {
    this.forEachDevice((device) => {
      device.onBusClosed();
    });
  }
  onError(err) {
    debug('CCBus::')('Serial port error', err);
  }
  registerDevice(device) {
    debug('CCBus::')('registerDevice');
    this.devices[device.config.dest] = device;
    if(this.ser.isOpen()) {
      device.onBusReady();
    }
  }
  sendRawCommand(command) {
    // Check if Command is already instance of CCCommand
    return new Promise((resolve, reject) => {
      debug('CCBus::sendCommandRaw')(command);
      debug('CCBus::sendCommandRaw::Set')('command.src:', command.src, '->', this.config.src);
      command.src = this.config.src;
      this.ser.write(command.toBuffer(), (err) => {
        debug('CCBus::sendCommandRaw')('Result: ', (!err));
        if(err){
          debug('CCBus::sendCommandRaw::Error')(err);
          reject(err);
        } else { resolve(); }
      });
    });
  }
  sendCommand(command) {
    // Check if Command is already instance of CCCommand
    // Send command with promised reply
    // If you use this function, use it exclusively and don't forget to call _onData() if you override onData()
    debug('CCBus::sendCommand')(command);
    var promise = timeout(new Promise((resolve, reject )=> {
      debug('CCBus::sendCommandPromise')('exec: ',command);
      command.resolve = resolve;
      command.reject = reject;
    }), this.config.timeout);

    // use the command chain to send command only when previous commands have finished
    // this way replies can be correctly attributed to commands
    this.commandChainPromise = this.commandChainPromise
      .then(() => { debug('CCBus::')('commandChainPromise'); this.lastCommand = command; return this.sendRawCommand(command); })
      .then(() => promise)
      .catch((e) => debug('CCBus::Error::')(e));
    return promise;
  }
}
module.exports = CCBus;
