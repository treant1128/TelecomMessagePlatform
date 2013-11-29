var axon = require('axon'),
    sock = axon.socket('pull'),
    count = 0;

sock.connect(3000);

sock.on('message', function(msg){
		console.log(++count + "-> " + msg.toString());
		});
