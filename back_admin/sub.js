var nrPkgReader = require('./nrPkgReader.js');
var redis = require('../redis.js');


process.on('message', function(msg){
   console.log('子进程收到的消息内容 : ' + msg);
   if(msg){
   	var arr = msg.split('|');
   	var nrPkg = arr[0];
	var msgCode= arr[1];

	nrPkgReader.readNumbersByPath(nrPkg, function(numbers){
		if(numbers[0] != 'abc'){     //读取过程没有 error
			redis.zaddMsgCodeToNumbers(numbers, msgCode, function(result){
				process.send(result);
				process.exit(0);
			});
		}else{ 
		   console.log('Comment: ' + r);
		   process.exit(0);
		}

	//process.exit(0); 
	});
   }else{
   	//如果收到消息为空, 直接终止子进程
   	process.exit(0);
   }
});
