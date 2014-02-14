var redis  = require("redis"),
    client = redis.createClient(6379, 'db01');
var async = require('async');
var _ = require('underscore');
//client.set('MyName', 'TreantPanda', function(e, d){
//    console.log(d);
//    client.expire('MyName', 100, function(err, r){
//        setInterval(function(){
//            client.TTL('MyName', function(e, r){
//                console.log(r);    
//            });
//            }, 1000);
//    });
//});
//
//client.SET('name', 'Panda', 'EX', 30, function(err, result){
//    console.log(result);
//    setInterval(function(){
//        client.ttl('name', function(err, result){
//            console.log(result);    
//        });    
//    }, 1000);
//    });

client.HGETALL("zjdx_msg:hash_pool:key", function(e, r){
    var keys = _.keys(r);
    var values = _.values(r);
    var total = keys.length === values.length ? keys.length : 0;
    var count  = 0;

//    async.whilst(
//        function(){ return count < total; },    
//        function(cycle){
//            client.HSET('zjdx_msg:hash_pool_inverse:key', values[count], keys[count], function(eee, rrr){
//                console.log('HSET Result: ' + rrr);    
//            });   
//
//            count++;
//            cycle();
//        },
//        function(ee){
//            console.log("keys length: " + _.keys(r).length);
//            console.log("values length: " + _.values(r).length);
//            console.log('Total Size: ' + total);
//        }
//    );
    var arg = new Array();
    for(var i=0; i<total; i++){
        arg.push(values[i]);
        arg.push(keys[i]);
    }

    console.log('After push size: ' + arg.length);
    arg.unshift('zjdx_msg:hash_pool_inverse:key');
    console.log('After unshift size: ' + arg.length);
   
    client.HMSET(arg, function(eee, rrr){
        console.log('HMSET Result: ' + rrr);    
    });
});
