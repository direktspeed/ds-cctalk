const debug = require('debug');
/*
  Takes Uint8Array
  Takes params: src(or Uint8Array), dest, command, data(optional)
  src can be Array then gets taken as is without Processing.
 */
class CCCommand {
  constructor(src, dest, command, data, checksum){
    // TODO: checksum????
    // Check if dest === data.length true === is raw cmd complet
    if(src instanceof Uint8Array) {
      // parse command Uint8Array
      this.createCmd(src[2], src[0], src[3], src.slice(4, src[1]+4));
      return
    } else if (src instanceof Array){
      this.buffer = Uint8Array(src)
      return
    } else if (typeof dest != 'number'){
      debug('ERROR::')('NO DEST SUPPLYED')
      return
    }
    // create command Uint8Array
    // 1,2 default src dest
    this.createCmd(src, dest, command, data);

  }
  createCmd(src, dest, command, data) {
    debug('LOG::CCCommand::')('new ->', { src,dest,command,data, isArray: (src instanceof Uint8Array) });
    this.src = src;
    this.dest = dest;
    this.command = command;
    if (!data){
      debug('WARNING::')('CCCommand::No Data Supplyed')
      data = new Uint8Array(0)
    }
    this.data = data;

    if (data.length != 0) {
      this.buffer = new Uint8Array(5+data.length)
    } else {
      this.buffer = new Uint8Array(5);
    }
    this.buffer[0] = dest;
    this.buffer[1] = data.length;
    this.buffer[2] = src;
    this.buffer[3] = command;
    if (this.data.length+4 === 4)  {
      var pos = 4
    } else {
      var pos = this.data.length+4
      this.buffer.set(data, 4);
    }

    // calculating Checksum
    /*
      The “Checksum” is the value that makes the 8 lower bits of the sum of all the bytes in the
      message, including the checksum, give result ‘0’.
      For example, the message [01] [00] [02] [00] will be followed by the checksum [253]
      because:
      1 + 0 + 2 + 0 + 253 = 256 = 0.
      src + data.length + dest +
     */
    var sum = 0;
    console.log(this.buffer)
    for (var i=0; i < (this.buffer.length); ++i) {
      console.log('Add,',this.buffer[i])
      sum += (this.buffer[i]);
    }
    this.checksum = 0x100 - sum%0x100
		this.buffer[this.data.length+4] = this.checksum;
  }
  toBuffer() {
    return this.buffer;
  }
}
//console.log(new CCCommand(1,40,254))

//console.log(new CCCommand(1,2,254,[66,77,88]))
module.exports = CCCommand;
