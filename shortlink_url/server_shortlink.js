var express = require('express');
var shortlink = require('shortlink');
var app = express();

var port = 8083;

app.listen(port);
console.log('短链接服务监听端口: ' + port);

app.get('/:number1/:number2/:number3', function(req, res){
	console.log('req.param.constructor:' + req.param.constructor);
	var num1 = req.param('number1');
	var num2 = req.param('number2');
	var num3 = req.param('number3');
	num1 = (shortlink.generate(Number(num1))); 
	num2 = (shortlink.generate(Number(num2))); 
	num3 = (shortlink.generate(Number(num3))); 

	console.log(num1.constructor);
	console.log('num1: %s, num2: %s, num3: %s', num1, num2, num3);
	res.send('第一个参数: ' + num1 + '<br/>第二个参数: ' + num2 + '<br/>第三个参数: ' + num3); 
});


// base52: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
// base58: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ' (default)
// base64: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
// 
// var shortlink = require('shortlink');
// 
// shortlink.generate(8);         // Random string of 8 characters, for example 'PJWn4T42'  
// shortlink.encode(8515010570);  // 'dYrDZ5'
// shortlink.decode('dYrDZ5');    // 8515010570

