console.time('DelRedis');
var redis = require('redis');
var async = require('async');

var client = redis.createClient(6379, 'db01', null);

var HASH_MSG_POOL_KEY = 'zjdx_msg:hash_pool:key';

//1) "A1390546681337f"
//2) "A1390551870440P"
var value = "超值春节流量包大放送*!-_-!* http://b.zj189.cn/msg/file-upload/chunjie.jpg 莫怕春节拷问，且看马上有啥！ <br> http://x.zj189.cn/chunjie";

client.HSET(HASH_MSG_POOL_KEY, "A1390578065768w", value, function(err, rrr){
    console.log('HSET 结果: ' + rrr);
    client.HGET(HASH_MSG_POOL_KEY, "A1390578065768w", function(err, r){
        console.log('设置了再取回来:' + r);
    });

});

return;
return;
client.KEYS('*', function(err, results){
    var total = results.length;
    var count = 0;

    async.whilst(
        function(){ return count < total; },
        function(cycle){
            client.TYPE(results[count], function(e, r){
                if(r === 'zset'){
                    //ZREM key member [member ...]
                    client.ZREM(results[count], "A1390546681337f", "A1390551870440P", function(err, re){
                        console.log(results[count] + ' ZREM 的结果: ' + re);    
                    });    
                }  //End of zset    

                count++;
                cycle();
            });  //End of client.TYPE   
        },
        function(err, rrr){
            //HDEL key field [field ...]
            client.HDEL(HASH_MSG_POOL_KEY, "A1390546681337f", "A1390551870440P", function(e, rt){
                console.log('最后HDEL的结果: ' + rt);    
                console.log('Keys的数量: ' + total);
                console.timeEnd('DelRedis');
            });
        }
    ); //End of async.whilst
});

return;
return;
return;

var field = "A1390549133024a";
var value = '关注\"浙江电信微厅\"抽大奖*!-_-!*易信、微信关注\"浙江电信微厅\"抽大奖<br> http://w.k189.cn/index.php/Wap/WHuodong/micWindow';
value='超值春节流量包大放送*!-_-!* http://b.zj189.cn/msg/admin/file-upload/banner.jpg 莫怕春节拷问，且看马上有啥！<br> http://x.zj189.cn/chunjie';

client.HSET(HASH_MSG_POOL_KEY, field, value,  function(err, rrr){
    console.log('HSETX 结果: ' + rrr);
    client.HGET(HASH_MSG_POOL_KEY, field, function(e, r){
        console.log('HGET 结果: ' + r);        
    });
});
