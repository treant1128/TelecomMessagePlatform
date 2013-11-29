var axon = require('axon');
var sock = axon.socket('pull');

sock.connect(3000);

var count = 0;
sock.on('message', function(msg){
		console.log(++count + ': ' + msg.toString());
		});
