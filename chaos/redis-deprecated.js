var redis = require('redis');
var async = require('async');

var timeUtil = require('./timeUtil.js');

var HASH_MSG_POOL_KEY = 'zjdx_msg:hash_pool:key';
//var SET_MSG_POOL_KEY = 'zjdx_msg:setpool:key';
var UNREADED_FLAG = 'U';
var READED_FLAG = 'R';

var client = redis.createClient(6379, '172.21.0.102', null);
client.select(0);
client.on('error', function(err){
  console.log("Error happens: " + err);
});


var _getUserMailCount = function(phoneNumber, callback){
  if(phoneNumber != null
//		  && phoneNumber.length == 13
		  ){
	  console.log("The phoneNumber is redis.js is: %s", phoneNumber);
//    client.HVALS(phoneNumber, function(err, res){
      client.HGETALL(phoneNumber, function(err, res){
	if(!err){
	  console.log("The following is result...");
	  console.log(res);
	  callback(res);
	}else{
	  console.log(err);
	}
    });
  }

};

console.log('------------Time Util-----------');
console.log('逝去时间: ' + timeUtil.getElapsedMinutesSince('10/30/2013 9:45:54'));

var _assignMsgToNumber = function(msgCode, numbers, callback){
	if(
//			msgCode.constructor === Number && 
			numbers.constructor === Array){
		console.log("** redis.js **, Length of numbers : " + numbers.length + "--" + msgCode);
		for(var i=0; i<numbers.length; i++){
			console.log('--redis.js-- value : ' + getDayFrom20131111());
			client.ZADD(numbers[i], getDayFrom20131111(), msgCode, function(err, res){
				if(!err){
					callback(res);
				}else{
					callback(err);
				}		
			});
		}
	}
};


var _assignMessageToNumbers = function(msgContent, numbers, prefix, callback){
	//每个号码包fork一个sub.js必为Array
	if(numbers.constructor === Array){
		console.log("** redis.js **, 号码数量: " + numbers.length + ", --消息内容: " + msgContent);
	
		//对HASH_MSG_POOLL_KEY HGETALL, in/for迭代对象中所有Field及其Value, 判断Value是否已存在: 
		//1. 不存在 -> 查询HASH_MSG_POOL_KEY的HLEN -> +1加prefix -> 作为新msgCode
		//2. 已存在 -> 复用该msgCode
		//
		//关于async.waterfall, cb的第一个参数为error, 如果!=null -> 直接进入末尾的callback,
		//否则, 除err外.cb后面的参数传入下一个函数
		async.waterfall([
			function(cb){
				client.HGETALL(HASH_MSG_POOL_KEY, function(err, result){
					var hasMsgContent = false;
					var msgCode = null;

					for(var p in result){
						if(result[p] === msgContent){
							hasMsgContent = true;
							msgCode = p;
							console.log('已存在的msgCode: ' + p);
						}
					}
					//cb传入下一个函数啊...
					cb(err, hasMsgContent, msgCode);	
				});
			},

			//hasMsgContent/msgCode同步改变 -> false/null or true/***
			function(hasMsgContent, msgCode, cb){
				if(hasMsgContent){
					cb(null, msgCode, msgContent, numbers);
				}else{
					client.HLEN(HASH_MSG_POOL_KEY, function(err, result){
						result += 1;                //  <- 18
						result = prefix + result;   //  -> A19
						cb(err, result, msgContent, numbers);
					}); //End of redis -> HLEN
				}
			},

			//result 作为即将插入的msgCode
			function(msgCode, msgContent, numbers, cb){
				console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
				console.log(msgCode+"-"+msgContent);
				if(msgCode){
					_assignCoreByReturnCode(msgCode, msgContent, numbers, function(results){
						cb(null, results);			
					});
				}else{
					cb('msgCodeNull', 'missing msgCode from Waterfall'); //error -> interrupt
				}
			}	

			], function(err, result){
				//console.log(result);
				callback(result);
			});  //End of async.waterfall
	
	} // End of numbers status OK
}

//根据msgCode, 先操作Hash, 成功后操作SortedSet
var _assignCoreByReturnCode = function(msgCode, msgContent, numbers, cb2){
	var score = timeUtil.getElapsedMinutesSince('10/31/2013 21:50:54')

	async.auto({
		saveMsgToHashPool : function(cb1){
			//HSETNX key field value
			client.HSETNX(HASH_MSG_POOL_KEY, msgCode, msgContent, function(err, result){
				if(!err){
					if(result){   // 1
						cb1(null, 'HSETNX返回 ' + result + '加了新的field.');
					}else{        // 0
						cb1(null, '已存在field, HSETNX返回 ' + result);
					}
				}else{
					cb1(err, 'HSETNX 出错...');
				}
		    	}); // End of redis->HSETNX 
		},

		assignMsgCodeToNumbers : ['saveMsgToHashPool', function(cb1){
		     	for(var i=0; i<numbers.length; i++){
				//ZADD key score 
				client.ZADD(numbers[i] + UNREADED_FLAG, score, msgCode, function(err, res){
					if(!err){
						console.log('ZADD的结果: ' + res);
					}
				}); // End of redis -> ZADD
			} // End of numbers cycle

			cb1(null, numbers.length);
		}]
		}, function(err, results){
			if(!err){
				cb2(results);		
			}  // End of async.series callback
	}); // End of async.auto
};


var testNumbers = ['18161910619', '15991745025', '13368983356']; 
// Just 4 Test

//_assignMessageToNumbers('Test Err in callback Again1111222?', testNumbers, function(res){
//		console.log(res);
//
//		//测试hget
//		client.HGETALL(HASH_MSG_POOL_KEY, function(err, res){
//			console.log(err);
//			console.log(err == null);
//			if(!err){
//				console.log('-----HGETALL zjdx_msg::main_pool------');
//				console.log(res);
//			}else{
//				console.log('-------error---------');
//				console.log(err);
//			}
//			});
//		});

exports.getUserMailCount = _getUserMailCount;
exports.assignMsgToNumber = _assignMsgToNumber;
exports.assignMsgToNumbers = _assignMessageToNumbers;

//HSETNX key field value
//Sets field in the hash stored at key to value, only if field does not yet exist. If key does not exist, a new key holding a hash is created. If field already exists, this operation has no effect.
