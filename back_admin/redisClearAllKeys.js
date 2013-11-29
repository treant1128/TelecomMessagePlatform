var redis = require('redis');

var client = redis.createClient(6379, '172.21.0.102', null);
client.select(0);
client.KEYS('*', function(err, result){
		console.log(result);
		for(var a in result){
			console.log(a + '--' + result[a]);
			client.DEL(result[a], function(err, result){
				console.log('DEL result: ' + result);	
			});
		}
		});


其实一个FLUSHALL就搞定的东西啊
