var EventEmitter = require('events');
const debug = require('debug');
const CCBus = require('./bus');
class CCDevice extends EventEmitter {
  constructor(bus, config){
    debug('CCDevice::')('NEW CCDevice');
    super();
    this.commands = {
      simplePoll: 254,
      addressPoll: 253,
      addressClash: 252,
      addressChange: 251,
      addressRandom: 250,
      requestPoolingPriority: 249,
      requestStatus: 248,
      requestVariableSet: 247,
      requestManufacturerId: 246,
      requestEquipmentCategoryId: 245,
      requestProductCode: 244,
      requestDatabaseVersion: 243,
      requestSerialNumber: 242,
      requestSoftwareRevision: 241,
      testSolenoids: 240,
      testOutputLines: 238,
      readInputLines: 237,
      readOptoStates: 236,
      latchOutputLines: 233,
      performSelfCheck: 232,
      modifyInhibitStatus: 231,
      requestInhibitStatus: 230,
      readBufferedCredit: 229,
      modifyMasterInhibit: 228,
      requestMasterInhibitStatus: 227,
      requestInsertionCounter: 226,
      requestAcceptCounter: 225,
      modifySorterOverrideStatus: 222,
      requestSorterOverrideStatus: 221,
      requestDataStorageAvailability: 216,
      requestOptionFlags: 213,
      requestCoinPosition: 212,
      modifySorterPath: 210,
      requestSorterPath: 209,
      teachModeControl: 202,
      requestTeachStatus: 201,
      requestCreationDate: 196,
      requestLastModificationDate: 195,
      requestRejectCounter: 194,
      requestFraudCounter: 193,
      requestBuildCode: 192,
      modifyCoinId: 185,
      requestCoinId: 184,
      uploadWindowData: 183,
      downloadCalibrationInfo: 182,
      requestThermistorReading: 173,
      requestBaseYear: 170,
      requestAddressMode: 169,
      requestCommsRevision: 4,
      clearCommsStatusVariables: 3,
      requestCommsStatusVariables: 2,
      resetDevice: 1
    };
    this.eventCodes ={
      254: 'return',
      20: 'string',
      19: 'slow',
      13: 'busy',
      8: 'following',
      2: 'inhibited',
      1: 'rejected',
      0: 'accepted',
      accepted: 0,
      rejected: 1,
      inhibited: 2,
      following: 8,
      busy: 13,
      slow: 19,
      string: 20,
      'return': 254
    };
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
