var redis = require('redis');
var async = require('async');
var _ = require('underscore');
var client = redis.createClient(6379, 'db01');
client.select(0);

client.hget("zjdx_msg:hash_pool:key", 'A1390578065768w', function(e, r){
    console.log('A1390578065768w: ' + r);
});


client.hget("zjdx_msg:hash_pool:key", 'A1390575577928m', function(e, r){
    console.log('A1390575577928m: ' + r);
});
