var axon = require('axon');
var sock = axon.socket('push');

//sock.bind(3000);
//sock.bind(3000, '0.0.0.0');
sock.bind('tcp://8.8.8.8:3000');
//172.21.0.104    db01
//console.log('Push Server Started!');

//setInterval(function(){
//		sock.send('DaDingGouFrom App01');
//		}, 1000);

