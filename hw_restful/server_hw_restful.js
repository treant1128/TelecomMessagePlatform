var express = require('express');
var redis = require('redis');
var _ = require('underscore');

var app = express();
var client = redis.createClient(6379, 'db01', null);
client.select(0);

 //var server  = require('http').createServer(app);

app.use(express.bodyParser({}));
app.listen(8085);
console.log('监听Restful接口 Port: 8085');

var SUCCESS = 'RestfulAccessSuccess';
var FAILURE = 'RestfulAccessFailure';
var verify = function(p){
    if(p.length === 11 && p.charAt(0) === '1'){
        return p;    
    }else if(p.length === 13 && p.substr(0, 2) === '86'){
        return p.substr(2);    
    }else{
        return null;
    }
};

app.post('/', function(req, res){
    var phoneNumber = req.body.phoneNumber;
    console.log('收到号码: ' + phoneNumber);

    if(phoneNumber != null && phoneNumber.constructor === String){
        var o = new Object();
        phoneNumber = verify(phoneNumber);
        console.log('解析的手机号码:' + phoneNumber);
        if(phoneNumber){
            client.multi()
            .ZCARD(phoneNumber + 'U')       //Unreaded
            .ZCARD(phoneNumber + 'R')       //Readed
            .ZCARD(phoneNumber + 'D')       //Delete
            .INCRBY(SUCCESS, 1)
            .GET(FAILURE)
            .exec(function(err, replies){
                if(err){
                    client.INCRBY(FAILURE, 1);
                    o['Result'] = null;
                    res.send(o);
                }else{
                    console.log(replies);
                    replies = _.map(replies, function(item){
                            return item ? item : 0;
                        });
                    o['Result'] = _.object(['Unreaded', 'Readed', 'Deleted', 'AccessSuccess', 'AccessFailure'], replies);
                    console.log(o);
                    res.send(o);
                }
            });
        }else{
            client.INCRBY(FAILURE, 1);
            o['Result'] = null;
            res.send(o);
        } 
    }
});


//app.get('/:phoneNumber', function(req, res){
//	console.log(req);
//	var p = req.params.phoneNumber;
//	console.log(req.route.params);
//	console.log( p);
//	res.send('输入的号码为: ' + p);
//});
//
