var redis = require('redis');
var client = redis.createClient();

client.ZADD('zset1', 123, 'abc', 456, 'mnt', 789, 'ddg', function(err, result){
    console.log('zset1: ' + result);
    });

client.ZADD(['zset2', 123, 'abc', 456, 'mnt', 789, 'ddg'], function(err, result){
    console.log('zset2: ' + result);
    });

client.ZADD('zset3', [123, 'abc', 456, 'mnt', 789, 'ddg'], function(err, result){
    console.log('zset3: ' + result);
    });
client.mset(["test keys 1", "test val 1", "test keys 2", "test val 2"], function (err, res) {});
