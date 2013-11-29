var express = require('express');

var app = express();
 //var server  = require('http').createServer(app);

//app.use(express.bodyParser({}));
app.listen(8081);

//app.get('/:phoneNumber', function(req, res){
//	console.log(req);
//	var p = req.params.phoneNumber;
//	console.log(req.route.params);
//	console.log( p);
//	res.send('输入的号码为: ' + p);
//});


app.get('/', function(req, res){
	console.log(req);
	var p = req.query.phoneNumber;
//	console.log(req.route.params);
	console.log( p);
	res.send('输入的号码为: ' + p);
});

