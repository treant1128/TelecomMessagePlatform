var express = require('express');
var async = require('async');
var dnode = require('dnode');
var _ = require('underscore');
var app = express();

var AES = require('../AES.js');
var redis = require('../redis.js');

app.use('/', express.static(__dirname + '/'));
app.use(express.bodyParser({}));
app.use(express.cookieParser());
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

var port  = 8081;
app.listen(port);
console.log('用户端访问服务监听 Port: ' + port);


//这个路径需要在tasks的POST请求中指定
app.get('/', function(req, res){
	console.log(req.headers);
  var phoneNumber = req.headers['x-up-calling-line-id'];  //获取wap登陆实际手机号
  console.log("=============I am cookies parser=============");
  console.log(req.cookies);
  console.log("**********I am query parser***************");
  console.log(req.query);

  if(req.cookies.zjsns_mobile != undefined){
      var phone_cookie=req.cookies.zjsns_mobile;
      console.log('加密的Coolies: ' + phone_cookie);
      phoneNumber=AES.DecryptBase64(phone_cookie);
      console.log("解密的手机号: %s", phoneNumber);
  }  

	console.log('得到的手机号: ' + phoneNumber);

  //获取不到手机号
  if(phoneNumber == null || phoneNumber == ""){  //获取不到wap手机号
     phoneNumber = "";
    var mo = req.query.mo;   //获取get请求的mo, 解密出手机号
    if(mo != null){
  	if(mo == 'debug'){
	  phoneNumber = "18006783900";
	}else{
	  phoneNumber = AES.Decrypt(mo);
	}
    } //End of mo
  }  //End of phoneNumber == null

	//phoneNumber = '18161910619';
  	//
	//phoneNumber = '15356455511';

if(phoneNumber == null || phoneNumber == ""){
	//res.send('<html><head></head><body><marquee width="100%" scrollamount="2"><h1>很抱歉, 不能解析您的手机号 ...</br>请切换到CMWAP上网方式继续访问！</h1></marquee></body></html>');
    console.log('Cant resolve phoneNumber, redirect...');
    res.redirect('http://login.zj189.cn/sso/login.jsp?goto=http://b.zj189.cn/msg/');
	return;
}

    //解密的手机号码constructor是SlowBuffer 没有substr
    phoneNumber = phoneNumber.toString();
	///////////////////////////////
    var hided = phoneNumber.substr(0, 3) + '****' + phoneNumber.substr(7);
	redis.isNebie(phoneNumber, function(nebie){
		if(nebie){ 			//nebie
			console.log('-----------Yes Yes Yes------------');
			var d = dnode.connect(8082 * 2);
			d.on('remote', function(remote){
				remote.retrieveOracle(phoneNumber, 'N', function(result){
			//		res.send(JSON.stringify(result));		
					console.log(nebie + '-----dnode result: ' + result);
					res.render('./indexWhat.html', {'phoneNumber' : phoneNumber, 'hidedPhoneNumber' : hided});
					d.end();
				});
			});
		}else{ 				//veteran
			console.log('-----------------No No No----------------');
			res.render('./indexWhat.html', {'phoneNumber' : phoneNumber, 'hidedPhoneNumber' : hided});
			var d = dnode.connect(8082 * 2);
			d.on('remote', function(remote){
				remote.retrieveOracle(phoneNumber, 'N', function(result){
			//		res.send(JSON.stringify(result));		
					console.log(nebie + '-----dnode result: ' + result);
					d.end();
				});
			});

		}
	});
 });


app.post('/init', function(req, res){
//	phoneNumber = '18161910619';  //Just 4 test
	var phoneNumber = req.body.phoneNumber;
	var start = req.body.start;
	var end = req.body.end;
	console.log('--------接收到的手机号码------');
	console.log(phoneNumber + '--' + start + '--' + end);
//	phoneNumber = '18161910619';
	redis.getUserInfo(phoneNumber, start, end, function(vals){
//		console.log("Call back in Server...");
//		console.log(vals);
		res.send(vals);
	});
});

//综合已读和未读的MsgCodes查询MsgContent后返回
app.post('/getMsgContent', function(req, res){
	var msgCodes = req.body.msgCodes;
	console.log('----------------收到的msgCodes---------------');
	console.log(msgCodes);
	redis.queryMsgContents(msgCodes, function(results){
		if(results){
			//redis HMGET returns Array 
			res.send(results);
		}
	});
});


app.post('/batchMove', function(req, res){
    var action = req.body.action;
	var phoneNumber = req.body.phoneNumber;
	var scores = req.body.scores;
	var msgCodes = req.body.msgCodes;

	console.log('收到的action: ' + action + '--' + phoneNumber + '--' + scores + '--' + msgCodes);
   // return;  //Just 4 test
    redis.batchMove(action, phoneNumber, scores, msgCodes, function(results){
        res.send(results);    
    }); 
});


app.post('/advise', function(req, res){
    var phoneNumber = req.body.phoneNumber;
    var advise = req.body.advise;
//    res.send(phoneNumber + '的建议是:' + advise);    
    redis.saveAdvise(phoneNumber, advise, function(result){
        res.send(JSON.stringify(result));    
    });
});
