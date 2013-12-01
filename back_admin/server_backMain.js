//后台操作接口,  fork进程, 操作redis
//1.给指定号码包添加活动消息   2.监听局方接口返回值

var express = require('express');
var fs = require('fs');
var lazy = require('lazy');
var async = require('async');
var cp = require('child_process');

//var soap = require('soap');

var redis = require('../redis.js');

var app = express();
app.use('/', express.static(__dirname + '/'));
app.use(express.bodyParser({}));
var port = 8082;
app.listen(port);
console.log('后台添加号码包服务 Listening Port: ' + port);

//app.get('/', function(req, res){
//	res.send('abcdefg');	
//});


var childProcesses = null;  //每个号码包fork一个child process
function assignMission(msgContent, prefix, nrPkgs, callback){
	console.log(msgContent.constructor);
	if(nrPkgs.constructor === Array && msgContent.constructor === String && (prefix == 'A' || prefix == 'B' || prefix == 'N')){
		childProcesses = new Array();
	    	redis.getMsgCodeByContent(msgContent, prefix, function(msgCode){
		    async.auto({
			'HSETNX-MsgCode-Content' : function(cb){
				redis.setMsgCodeContentHash(msgCode, msgContent, function(detail){
					cb(null, detail);
				});
			},

			'Send-Msg-Children' : function(cb){
				for(var i=0; i<nrPkgs.length; i++){
             				childProcesses[i] = cp.fork(__dirname + '/sub.js');
		    		 	childProcesses[i].send(nrPkgs[i] + '|' + msgCode);
         			}//End of 1st for cycle
				cb(null, 'Forked ' + nrPkgs.length + ' child-processes');
			},

			'Register-On-Message' : ['Send-Msg-Children', function(cb){
	    			var receiverCounter = 0;
			      	for(var i=0; i<nrPkgs.length; i++){
			             	childProcesses[i].on('message', function(result){
	        				console.log('--------Parent Received Message--------');
						console.log(result);
						receiverCounter++;
						if(receiverCounter === childProcesses.length){
							cb(null, "Work Completed ~~~~");
						}
	     				});  //End of on message
   		   	     	}  //End of 2nd for cycle
			
			}]    // on message event can only be observered after send message to child

			}, function(err, result){
				callback(result);	
		     });
		}); //End of getMsgCodeByContent

//	     callback('暂时木有啊...');
        } //End of params OK
}

//一次性按多个号码包批量插入相同任务, 消息msgCode由redis.js中getMsgCodeByContent逻辑自动生成
//监听前端HTTP POST请求, 只需要: 1.各个号码包的绝对路径  2.消息内容  3. 消息分类前缀(不同Menu显示) 
app.post('/addMultiMission', function(req, res){
//console.log(req);
  var name = req.body.name;
  var msgContent = req.body.msgContent;
  var prefix = req.body.prefix;
//  console.log(typeof msgCode);
  var nrPkgs = req.body.nrPkgs;
  var js_code = req.body.js_code || "";

	console.log(name + ' :: ' + msgContent + ' :: ' + prefix);
	console.log("收到的号码包数组: " + nrPkgs);
//暂时截获请求   Just 4 Test	
//	res.send(name + ' :: ' + msgContent + ' :: ' + prefix+" --收到的号码包数组: " + nrPkgs);
//	return;

        assignMission(msgContent, prefix, nrPkgs, function(result){
	   res.send(result);
	});
//        res.send(js_code);
});

//每次只针对一个号码只插入一条消息(查询Oracle的结果), 
//可以做出Dnode形式的RPC, 只是用HTTP测试的...
app.post('/insertSingleTask', function(req, res){
	var prefix = req.body.prefix;
	var msgContent = req.body.msgContent;
	var phoneNumber = req.body.phoneNumber;
	console.log('收到的' + prefix + '-' + msgContent + '-' + phoneNumber);
	if((prefix == 'A' || prefix == 'B' || prefix == 'N') && msgContent.constructor === String && phoneNumber.constructor === String){
		async.waterfall([      			   //其实可以用auto, 后两步骤必须在第一步获取到msgCode之后, 而后两步骤次序无所谓
			function(cb){    					
				redis.getMsgCodeByContent(msgContent, prefix, function(msgCode){
					console.log('有没有生成msgCode: ' + msgCode);
					cb(null, msgCode);
				});			
			},

			function(msgCode, cb){   				//插入zjdx_msg:hash_pool:key
				redis.setMsgCodeContentHash(msgCode, msgContent, function(detail){
					cb(null, msgCode, detail);
				});
			},

			function(msgCode, detail, cb){  			//插入SortedSet
				var temp = phoneNumber;
				phoneNumber = new Array();    			//运行中转型  不推荐
				phoneNumber.push(temp);     			//但一个号码也要转为Array
				temp = null;
				redis.zaddMsgCodeToNumbers(phoneNumber, msgCode, function(result){
					cb(null, 'HSETNX给zjdx_msg:hash_pool:key的结果: ' + detail + ',\nZADD给' + phoneNumber + 'U的结果: ' + result);
				});
			}
			], function(err, result){
				res.send(result);
			}
		);  //End of waterfall
	}
});

//----------------dnode----------------
var dnode = require('dnode');
var checkBill = require('./oracle.js').checkBill;

var dnodeServer = dnode({
	retrieveOracle : function(phoneNumber, prefix, callback){
		if(phoneNumber.constructor === String){
			async.waterfall([
				function(cb){
					checkBill(phoneNumber, function(userLogs){
						console.log('badk_admin里的userLogs结果********');
						console.log(userLogs);
						cb(null, userLogs);
					});		
				},
				function(logs, cb){
					if(logs != null && logs.constructor === Array){
						var msgContents = new Array();
						var temp = new Array();
//---Log Style---
// { USERID: '15356455511',
//   ORDERID: '868673',
//   PROM_NUM: '7243313312300001',
//   PROM_TYPE: '12',
//   OLD_PROM_NUM: null,
//   OLD_PROM_TYPE: null,
//   RESULT: '<?xml version="1.0" encoding="utf-8"?><respone><ErrCode>0000</ErrCode><ErrMsg>e???????Y?????????</ErrMsg></respone>',
//   RET: '1',
//   STATUS: '1',
//   CREATE_TIME: '20131121104933',
//   UPDATE_TIME: '20131121122053',
//   GLOBAL_KEY: '15356455511_1385002172936',
//   FROM_ID: 'rate_move',
//   RATE_USE: '1477',
//   RATE_REMAIN: '2192' }
						for(o in logs){
							for(g in logs[o]){
								temp.push(logs[o][g]);
							}
console.log('-----------temp------------');
console.log(temp);
							//Array join成String相比String+  减少对象创建
							msgContents.push(temp.join('|-_-|'));    //push String to msgContents
							temp.splice(0, temp.length);             //clear temp array
						}

						cb(null, msgContents);
					}
				},	
				function(contents, cb){
					console.log('去Redis执行了)))))))))))))))))))))');
					redis.multiMsgsToOnePhone(phoneNumber, contents, prefix, function(result){
						cb(null, result);
					});
				}
			], function(err, result){
				console.log('回来了到达了');
				console.log(result);
				callback(result);
			});
		}	
	}
});

dnodeServer.listen(port * 2);

