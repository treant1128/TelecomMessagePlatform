var express = require('express');
var async = require('async');
var app = express();

var AES = require('../AES.js');
var redis = require('../redis.js');
var checkBill = require('./oracle.js').checkBill;


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
    var phone_cookies = req.cookies.zjsns_mobile;
        phoneNumber = phone_cookies;
  	console.log("Cookies phone: %s", phone_cookies);
  }  

	console.log('得到的手机号: ' + phoneNumber);

  //获取不到手机号
  if(phoneNumber == null || phoneNumber == ""){  //获取不到wap手机号
     phoneNumber = "";
    var mo = req.query.mo;   //获取get请求的mo, 解密出手机号
    if(mo != null){
  	if(mo == 'debug'){
	  phoneNumber = "18106502925";
	}else{
	  phoneNumber = AES.Decrypt(mo);
	}
    } //End of mo
  }  //End of phoneNumber == null

	//  phoneNumber = 'Test123';
	phoneNumber = '18161910619';
	phoneNumber = '18444444444';
  	
	phoneNumber = '15356455511';

	var dnode = require('dnode');
	var d = dnode.connect(8082 * 2);
	d.on('remote', function(remote){
		remote.retrieveOracle(phoneNumber, 'N', function(result){
			console.log('userMail手打的打了的'+result.constructor);
//			res.send(result);
			res.send(JSON.stringify(result));
			d.end();
		});
	});



	return;
	///////////////////////////////
	redis.isNebie(phoneNumber, function(result){
		if(result){ 			//nebie
		
		}else{ 				//veteran
			res.render('./indexWhat.html', {'phoneNumber' : phoneNumber});
		}
	
	});
 });


function retrieveOraceUpdateRedis(phoneNumber){
	async.waterfall([
		function(cb){
			checkBill(phoneNumber, function(result){
				cb(null, result);
			});
		},
		function(userBills, cb){
			//	参照back_admin中的app.post('/insertSingleTask'
		//	打丁狗打丁狗		
		},
	], function(err, result){
			
	}); //End of async.waterfall
};

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

app.post('/markReaded', function(req, res){
	var phoneNumber = req.body.phoneNumber;
	var score = req.body.score;
	console.log(phoneNumber.constructor);
	var msgCode = req.body.msgCode;

	console.log('收到变未读为已读: ' + phoneNumber + '--' + score + '--' + msgCode);
	redis.markReaded(phoneNumber, score, msgCode, function(results){
		res.send(results);	
	});
//	res.send('你发送的是: ' + phoneNumber + '--' + score + '--' + msgCode);
});
