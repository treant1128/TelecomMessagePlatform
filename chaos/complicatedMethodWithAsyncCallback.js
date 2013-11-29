var redis = require('redis');
var async = require('async');

var timeUtil = require('./timeUtil.js');
var MSG_POOL_KEY = 'zjdx_msg::main_pool';

var client = redis.createClient(6379, '172.21.0.102', null);

client.on('error', function(err){
  console.log("Error happens: " + err);
});

var _assignActivityMessageToNumbers = function(msgContent, numbers, callback){
	if(msgContent.constructor === String && numbers.constructor === Array){
		console.log("** redis.js **, 号码数量: " + numbers.length + "---消息内容: " + msgContent);
	
		async.waterfall([
			function(cb2){
				client.HLEN(MSG_POOL_KEY, function(err, result){
					if(!err){
						result += 1;             // 18
						result = 'A' + result;   // A19
						//waterfall这里作为执行结果传入下一个
						cb2(null, result, msgContent, numbers, callback);
					}
				}); //End of redis -> HLEN
			},
			
			function(result, msgContent, numbers, callback, cb2){
			var score = timeUtil.getElapsedMinutesSince('10/30/2013 9:45:54')
                   	async.auto({
                   		saveMsgToHashPool : function(cb1){
                   			//HSETNX key field value
                   			client.HSETNX(MSG_POOL_KEY, result, msgContent, function(err, res){
                   				if(!err){
                   			  		cb1(null, res);
                   			 	}
                   		    	}); // End of redis->HSETNX 
                   		},
                   
                   		assignMsgCodeToNumbers : ['saveMsgToHashPool', function(cb1){
                   		     	for(var i=0; i<numbers.length; i++){
                   				//ZADD key score 
                   				client.ZADD(numbers[i], score, result, function(err, res){
                   					if(!err){
                   						console.log(res);
                   					}
                   				}); // End of redis -> ZADD
                   			} // End of numbers cycle
                   
                   			cb1(null, numbers.length);
                   		}]
                   		}, function(err, results){
                   			if(!err){
                   		//		callback(results);		
						cb2(null, results);
                   			}  // End of async.series callback
                   	}); // End of async.auto
			
			}
			], function(err, result){
//				console.log(result);
				callback(result);
			});  //End of async.waterfall
	
	} // End of numbers status OK
}

var testNumbers = ['18161910619', '15991745025', '13368983356']; 

_assignActivityMessageToNumbers('第n个消息Test1st...打1丁1狗', testNumbers, function(res){
		console.log(res);

		//测试hget
		client.HGETALL(MSG_POOL_KEY, function(err, res){
			if(!err){
				console.log('---HGETALL zjdx_msg::main_pool--------');
				console.log(res);
			}else{
				console.log('-------error---------');
				console.log(err);
			}
			});
		});


//HSETNX key field value
//Sets field in the hash stored at key to value, only if field does not yet exist. If key does not exist, a new key holding a hash is created. If field already exists, this operation has no effect.
