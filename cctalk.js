/*
CCBus = Connection to port with CCTalk protocol
CCCommand = Command in CCTalk Formart
CCDevice = Register a Device on the CCBus
 */

'use strict';
//new 254

const CCBus = require('./bus');
const CCCommand = require('./command');
const CCDevice = require('./device');

module.exports = {
  command: CCCommand,
  bus: CCBus,
  device: CCDevice,
};
