var redis = require('redis');
var async = require('async');
var _ = require('underscore');
var client = redis.createClient(6379, 'db01');
client.select(0);

//for(var i=72828; i<72850; i++){
//    client.HGET('zjdx_msg:hash_pool:key', 'N' + i, function(e, r){
////        console.log(r);
//        if(r == null){
//            console.log('This is null--------------------------------' + i);        
//        }
//    });    
//}

var count = 65555;
var myCount = 0;
function generateArray(){
    var a = new Array();
    for(var i=65555; i<73888;i++){
       a.push('N' + i); 
    }

    return a;
};

//console.log(generateArray().join());
//var b = generateArray();
//b.unshift("18006783900R");

//client.ZREM(b, function(e, r){
//    console.log('ZREM de Result');
//    console.log(r);
//    });

//return;

var a = generateArray();
//console.log(a); return;
var bb = _.clone(a);
bb.unshift('zjdx_msg:hash_pool:key');
client.HDEL(bb, function(err, re){
    console.log('Hash zjdx_msg:hash_pool:key Delete Result');
    console.log(re);
    });
return;
return;

//删除所有的Sorted Set的特定key值
client.KEYS('*', function(err, result){
    var size = result.length;
    var tempCount = 0;
    async.whilst(
        function(){return tempCount < size;},
        function(cycle){
            client.TYPE(result[tempCount], function(e, keyType){
                if(keyType === 'zset'){
                    console.log('I\'m sorted set');
                    var bbb = _.clone(a);
                    console.log('生成bbb的长度: ' + bbb.length);
                    bbb.unshift(result[tempCount]);

                    client.ZREM(bbb, function(e, r){
                        console.log(result[tempCount] + 'ZREM的结果是：' + (r == 0 ? r : '*******************************************************' + r));
                    });
                } 
            
                console.log('now tempCount ==========: ' + tempCount);
                tempCount++;
                cycle();
            });  //End of key type    
        },
        function(err){
            console.log('Game Over ......');    
            console.log('总共修复了%d个Sorted Set', size);
        }
    );  //End of whilst
});

return;
return;

async.whilst(
    function(){return count < 72838;},
    function(callback){
        client.HGET('zjdx_msg:hash_pool:key', 'N' + count, function(e, r){
            if(r==null){
                console.log('This is null when count = ' + count);    
            }else{
                myCount++;    
            } 

            count++;
            callback();
        });        
    },
    function(err){
        console.log("Game Over...");    

        client.hlen('zjdx_msg:hash_pool:key', function(e, r){
            console.log('DBsize: ' + r);
            });
    }
);


var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
function randomString(){
    var now = new Date().getTime().toString();
    var ch = chars.charAt(Math.floor(Math.random() * chars.length));
    return now + ch;
};


