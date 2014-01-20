var redis  = require("redis"),
    client = redis.createClient(6379, 'app01')

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
client.SET('name', 'Panda', 'EX', 30, function(err, result){
    console.log(result);
    setInterval(function(){
        client.ttl('name', function(err, result){
            console.log(result);    
        });    
    }, 1000);
    });
