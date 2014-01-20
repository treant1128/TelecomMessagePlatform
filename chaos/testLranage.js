var redis=require('redis');
//var client = redis.createClient(6379, 'db01', null);
var client = redis.createClient(6379, 'app01', null);

//console.log(client);
//client.select(0);
var LIST_ADVISE_KEY = 'zjdx_msg:list_advise:key';
client.DBSIZE(function(d){
    console.log(d);
    });
//client.LRANGE([LIST_ADVISE_KEY, '0', '-1'], function(advices){
//    console.log(advices);
//    });
//
//redis.getAdvises(function(r){
//    console.log(r);
//    });
