const debug = require('debug');
class CCCommand {
  constructor(src, dest, command, data){
    if(src instanceof Uint8Array) {
      // parse command Uint8Array
      this.createCmd(src[2], src[0], src[3], src.slice(4, src[1]+4));
      // TODO: checksum????
      /*
      The “Checksum” is the value that makes the 8 lower bits of the sum of all the bytes in the
      message, including the checksum, give result ‘0’.
      For example, the message [01] [00] [02] [00] will be followed by the checksum [253]
      because:
      1 + 0 + 2 + 0 + 253 = 256 = 0.
       */
    } else {
      // create command Uint8Array
      // 1,2 default src dest
      debug('emp800::')(src, dest, command, data);
      this.createCmd(src, dest, command, data);
    }
  }
  createCmd(src, dest, command, data) {
    debug('CCCommand::')('new ->', { src,dest,command,data,isArray: (src instanceof Uint8Array) });
    this.src = src;
    this.dest = dest;
    this.command = command;
    this.data = data;
  }
  toBuffer() {
    var buffer = new Uint8Array(5 + this.data.length);
    buffer[0] = this.dest;
    buffer[1] = this.data.length;
    buffer[2] = this.src;
    buffer[3] = this.command;
    buffer.set(this.data, 4);
    var sum = 0;
    for (var i=0; i < (buffer.length - 1); ++i)
      sum += (buffer[i]);
    buffer[this.data.length+4] = 0x100 - sum%0x100;
    return buffer;
  }
}
module.exports = CCCommand;
