var redis = require('redis');
var async = require('async');

var timeUtil = require('./timeUtil.js');
//return;
///////////////Global Const String Variable////////////////
var SET_VETERAN_KEY = 'zjdx_msg:set_veteran:key';
var HASH_MSG_POOL_KEY = 'zjdx_msg:hash_pool:key';
//var SET_MSG_POOL_KEY = 'zjdx_msg:setpool:key';
var UNREADED_FLAG = 'U';
var READED_FLAG = 'R';
var WITHSCORES_FLAG = 'WITHSCORES';
///////////////Global Const String Variable////////////////

var client = redis.createClient(6379, '172.21.0.102', null);
client.select(0);
client.on('error', function(err){
  console.log("Error happens: " + err);
});

//用户登录后 先判断其是不是初次登录, 如果是就马上查询oracle再render, 负责内容有可能为空
//如果不是就先render页面, 在后台查询oracle插入redis 新内容将在其下次登录后展现
exports.isNebie = function(phoneNumber, callback){
	if(phoneNumber.constructor === String){
		client.SADD(SET_VETERAN_KEY, phoneNumber, function(err, result){
			callback(result);
		});
	}else{
		callback(0);
	}
};

//先迭代HASH_MSG_POOL_KEY的所有Field-Value, 如果msgContent已存在, 则直接用之
//如果不存在, 则根据消息类型和HLEN生成新的msgCode传入回调
var _getMsgCodeByContent = function(msgContent, prefix, callback){
	if(msgContent.constructor === String){
		async.waterfall([
			function(cb){
				client.HGETALL(HASH_MSG_POOL_KEY, function(err, result){
					var hasMsgContent = false;
					var msgCode = null;
					for(var p in result){
						if(result[p] === msgContent){
							hasMsgContent = true;
							msgCode = p;
							console.log('已存在msgCode: ' + p);
							break;  //break in advance if found
						}
					}	
					cb(err, hasMsgContent, msgCode);
				});
			},     //迭代结果传入下一层waterfall

			//hasMsgContent/msgCode同步改变 -> false/null or true/***
			function(hasMsgContent, msgCode, cb){
				if(hasMsgContent){
					cb(null, msgCode);                //msgCode存在, msgCode直接传入结果waterfall
				}else{
					client.HLEN(HASH_MSG_POOL_KEY, function(err, result){
						result += 1;              // 18
						result = prefix + result; // M19
						cb(err, result);		
					});  //根据HLEN-prefix生成新msgCode
				}
			},
				
			], function(err, result){
				callback(result);
			}
		); // End of async.waterfall
	} // End of msgContent OK
};


var _setMsgCodeContentHash = function(msgCode, msgContent, callback){
	client.HSETNX(HASH_MSG_POOL_KEY, msgCode, msgContent, function(err, result){
		//事实上只可能返回result=0/1, 永远不可能有Error
		var detail = err ? 'Error ...' : (result ? 'Set-New-MsgCode' : 'MsgCode-Exists-Already');
		callback(detail);
	});
};

//批量插入, 给N个号码插入同一个msgCode
//var _zaddMsgCodeToNumbers = function(numbers, msgCode, callback){
//	if(numbers.constructor === Array && msgCode.constructor == String){
//		var score = timeUtil.getElapsedMinutesSince();
//		var count = 0;      //计数器
//		for(var i=0; i<numbers.length; i++){
//			client.ZADD(numbers[i] + UNREADED_FLAG, score, msgCode, function(err, result){
//				count ++;
//				console.log('第' + i + '次ZADD的结果: ' + result);	
//					console.log('count: ' + count);
//				if(count === numbers.length){    	//最后一次循环结束时执行回调
//					//The number of elements added to the sorted sets, not including elements already existing for which the score was updated.
//					if(result === 0){ 		//插入的msgCode已存在, 只更新score
//						callback('member: ' + msgCode + '已存在, 更新score为: ' + score);
//					}else{
//						callback('总共ZADD的数量: ' + numbers.length);
//					}
//				}				
//			});
//		}
////		callback('总共ZADD的数量: ' + numbers.length);
//	}else{   //For Test   一个号码也要当数组对待, 为统一接口
//		callback('参数有问题?numbers是: '+numbers.constructor);
//	}
//};

var _zaddMsgCodeToNumbers = function(numbers, msgCode, callback){
	if(numbers.constructor === Array && msgCode.constructor == String){
		var score = timeUtil.getElapsedMinutesSince();
		var count = 0;

		async.whilst(
			function(){return count < numbers.length},
			function(callback){
				client.ZADD(numbers[count] + UNREADED_FLAG, score, msgCode, function(err, result){
					callback();
				});

				count++;
			},
			function(err){
				callback('总共ZADD的数量: ' + numbers.length);
			}
		); //End of async.whilst
	}else{
		callback('参数有问题?numbers是: '+numbers.constructor);
	}
};


exports.getMsgCodeByContent   = _getMsgCodeByContent;
exports.setMsgCodeContentHash = _setMsgCodeContentHash;
exports.zaddMsgCodeToNumbers  = _zaddMsgCodeToNumbers;

//HSETNX key field value
//Sets field in the hash stored at key to value, only if field does not yet exist. If key does not exist, a new key holding a hash is created. If field already exists, this operation has no effect.

//获取用户所有的{A B N} -> 已读/未读信息 个数及内容
var _getUserInfo = function(phoneNumber, start, end, callback){
	if(phoneNumber.length > 0 && phoneNumber.constructor === String){
		async.parallel({
			'Unreaded' : function(cb){
				client.ZRANGE(phoneNumber + UNREADED_FLAG, start, end, WITHSCORES_FLAG, function(err, result){
					cb(err, result);		
				});
			},
			
			'Readed'   : function(cb){
				client.ZRANGE(phoneNumber + READED_FLAG, start, end, WITHSCORES_FLAG, function(err, result){
					cb(err, result);
				});
			},		
		}, function(err, result){
//			callback(result);
//			这里先不callback 否则得到的毛数据难处理  
			
			console.log(result);
//ZRANGE 取出来时已是默认按照score从小到大排列, 只需要按顺序依次分类 -> unshift进不同的数组即可
//The elements are considered to be ordered from the lowest to the highest score.
//Lexicographical order is used for elements with equal score.
//See ZREVRANGE when you need the elements ordered from highest to lowest score

			var o = new Array();
			for(p in result){
				o = o.concat(flagZRANGEResultWithIsReaded(p, result[p]));
//				o[p] = analyzeZRANGEResults(result[p]);
			}
			console.log('----------Before QuickSort-------------');
			console.log(o);
			console.log('^^^^^^^^^^After QuickSort^^^^^^^^^^^^^^^');
			quickSortByScore(o, 0, o.length - 1);
			console.log(o);
			o = typeSortedObjArray(o);
			console.log('#############After typeSorted#############');
			console.log(o);
			callback(o);
		});  //End of async.parallel
	}
};

//对快速排序过的对象数组分类(A/B/N)  [{}, {}, {}, {}] -> {A:[{}, {}, {}], B:[{}], N:[{}, {}]}
function typeSortedObjArray(objArr){
	if(objArr.constructor === Array){
		var o = new Object();
		var arrA = new Array();
		var arrB = new Array();
		var arrN = new Array();

		for(var i=0; i<objArr.length; i++){
			switch(objArr[i].msgCode.charAt(0)){
				case 'A':
					//快速排序结果是score从小到大, score越大表示离现在越近, 需要把score大的unshift到前列
					arrA.unshift(objArr[i]);  					
					break;
				case 'B':
					arrB.unshift(objArr[i]);
					break;
				case 'N':
					arrN.unshift(objArr[i]);
					break;
				default:
					break;
			}
		}

		o.A = arrA;
		o.B = arrB;
		o.N = arrN;
//		console.log(arrA);
//		console.log(arrB);
//		console.log(arrN);
//		console.log(o);
		return o;
	}
}

//根据score从小到大快速排序所有{msgCode:***, score:***, isReaded:***}对象,方便前端按时间倒排(先不分A/B/N)
function quickSortByScore(objArr, left, right){
	if(objArr.constructor === Array){
		if(left < right){
			var i=left, j=right, x=objArr[left];  			//直接比较score值, 否则要proto实现对象的比较
			while(i < j){
				while(i < j && objArr[j].score >= x.score){   	//从右向左找第一个小于x的
					j--;
				}
				if(i < j){
					objArr[i++] = objArr[j];
				}

				while(i < j && objArr[i].score < x.score){   	//从左向右找第一个大于等于x的
					i++;
				}
				if(i < j){
					objArr[j--] = objArr[i];
				}
			}

			objArr[i] = x;
			//递归调用
			quickSortByScore(objArr, left, i - 1);
			quickSortByScore(objArr, i + 1, right);
		}
	}
}

//把ZRANGE返回的数据转为方便处理的对象形式(之前是分为Unreaded/Readed两大类, 分类下再分A/B/N; 现在改为A/B/N三大类, 分类下再分Unreaded/Readed)
//先给Unreaded和Readed的返回数组打上isReaded属性标记 -> concat两个数组 -> 快速排序 -> 重新分类
function flagZRANGEResultWithIsReaded(flag, msgCodeWithScore){
	if(flag.constructor === String && msgCodeWithScore.constructor === Array){
		var isReaded = (flag === 'Readed' ? true : false);
		var newArr = new Array(msgCodeWithScore.length / 2); //生成的对象个数
		for(var i=0; i<msgCodeWithScore.length / 2; i++){
			var code_score_isReaded_Obj = new Object();
			code_score_isReaded_Obj.msgCode = msgCodeWithScore[i*2];
			//快速排序按score数字值 String -> Number
			code_score_isReaded_Obj.score = parseInt(msgCodeWithScore[i*2 + 1], 10);  //decimal 
			code_score_isReaded_Obj.isReaded = isReaded;
			newArr[i] = code_score_isReaded_Obj;//不能push push是给末尾增添元素, 会改变数组长度
		}
		
		console.log('---------Resis----flagZRANGEWithIsReaded------');
		console.log(newArr);	
		return newArr;
	}
}

//function analyzeZRANGEResults(msgCodeWithScore){
//	if(msgCodeWithScore.constructor === Array){
//		var sortedObj = new Object();
//        	var Activities = new Array();
//        	var Bills = new Array();
//        	var Notifications = new Array();
//	        var msgCode_score_obj = null;
//
//        	for(var i=0; i<msgCodeWithScore.length / 2; i++){
////       		console.log('MsgCode : ' + msgCodeWithScore[2*i] + ', Score : ' + msgCodeWithScore[2*i + 1]);
//        		var prefix = msgCodeWithScore[2*i].charAt(0);		
//        		
//			msgCode_score_obj = new Object();
//			msgCode_score_obj.msgCode = msgCodeWithScore[2*i]
//			msgCode_score_obj.score = msgCodeWithScore[2*i + 1];
////        		console.log('----------' + prefix + '------');
//        		switch(prefix){
//        		case 'A':
//        			Activities.unshift(msgCode_score_obj);
//        			break;
//        		case 'B':
//        			Bills.unshift(msgCode_score_obj);
//        			break;
//        		case 'N':
//        			Notifications.unshift(msgCode_score_obj);
//        			break;
//        		default:
//        			break;
//        		}
//        	}
//
//        	sortedObj.A = Activities;
//        	sortedObj.B = Bills;
//        	sortedObj.N = Notifications;
//        
//		return sortedObj;
//	}
//};


//Just 4 Test
//_getUserInfo('18161910619', 0, -1, function(results){
//		console.log('......redis--before--return.......');
//		return;
//	console.log('----------Test GetUserInfo------------');
//	console.log(results);    // {'**' : [], '***' : []}
//
//	var unreadedWithScores = results.Unreaded;   //Array
//	var unreadedCount = unreadedWithScores.length / 2;
//
//	var readedWithScores = results.Readed;
//	var readedCount = readedWithScores.length / 2;
//
//	console.log('未读WithScores: ' + unreadedWithScores + 'Member数量: ' + unreadedCount);
//       	console.log('已读WithScores: ' + readedWithScores + 'Member数量: ' + readedCount);
//	analyzeZRANGEResults(unreadedWithScores);
//});

exports.getUserInfo = _getUserInfo;

//根据Msg标号在zjdx_msg::pool中查到内容
var _queryMsgContents = function(msgCodesArray, callback){
	if(msgCodesArray.constructor === Array){
		console.log('打丁狗: '+msgCodesArray);
		client.HMGET(HASH_MSG_POOL_KEY, msgCodesArray, function(err, result){
			if(!err){
				console.log('-------redis-----HMGET-----'+result.constructor);
				console.log(result);
				callback(result);
			}else{
				callback(err);
			}
		});
	}
};

exports.queryMsgContents = _queryMsgContents;

var _markReaded = function(phoneNumber, score, msgCode, callback){
	if(phoneNumber.constructor === String && score.constructor === Number && msgCode.constructor === String){
		async.parallel({
			'RemoveteFromUnreaded' 	: function(cb){
				client.ZREM(phoneNumber + UNREADED_FLAG, msgCode, function(err, result){
					cb(err, result);
				});	
			},
			
			'AddToReaded' 		: function(cb){
				client.ZADD(phoneNumber + READED_FLAG, score, msgCode, function(err, result){
					cb(err, result);
				});
			}
		}, function(err, result){
			callback(result);	
		});
	}
};

exports.markReaded = _markReaded;

