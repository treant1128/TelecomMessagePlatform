var express = require('express');
var redis = require('redis');
var _ = require('underscore');

//给华为的服务常常会占用内存暴增  OOM  把这个服务也并到../redis.js中试一下
//var redisOuter = require('../redis.js');

var app = express();
//var client = redis.createClient(6379, 'db01', {detect_buffers: true});
var client = redis.createClient(6379, 'db01', null);
client.select(0);
//Note that error is a special event type in node. If there are no listeners for an error event, node will exit
client.on('error', function(err){
    console.log('Error Happens: ' + err);    
});

client.on('end', function(end){
    console.log('Node is Ending...');    
});

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

//为了减轻Redis压力  只给返回Unreaded的信息  其余属性强制指定为0   返回值格式不变
//{
//  "Result": {
//    "Unreaded": 3,
//    "Readed": 82,
//    "Deleted": 4,
//    "AccessSuccess": 140513938,
//    "AccessFailure": "17802"
//  }
//}
app.post('/', function(req, res){
    var phoneNumber = req.body.phoneNumber;
    console.log('Modify: ' + phoneNumber);

    if(phoneNumber != null && phoneNumber.constructor === String){
        var obj = new Object();
        phoneNumber = verify(phoneNumber);
        
        if(phoneNumber){
            client.ZCARD(phoneNumber + 'U', function(e, r){
                obj['Result'] = new Object();

                obj['Result'].UnReaded = r;
                obj['Result'].Readed = 0;
                obj['Result'].Deleted = 0;
                obj['Result'].AccessSuccess = 0;
                obj['Result'].AccessFailure = 0;

                res.send(obj);
            });
        }else{
            obj['Result'] = null;
            res.send(obj);
        }
    }
});
//
//app.post('/', function(req, res){
//    var phoneNumber = req.body.phoneNumber;
//    console.log('Here: ' + phoneNumber);
//
////    redisOuter.hwRestful(phoneNumber, function(oo){
////        res.send(oo);    
////    });
//
//    if(phoneNumber != null && phoneNumber.constructor === String){
//        var o = new Object();
//        phoneNumber = verify(phoneNumber);
////        console.log('解析的手机号码:' + phoneNumber);
//        if(phoneNumber){
//            client.multi()
//            .ZCARD(phoneNumber + 'U')       //Unreaded
//            .ZCARD(phoneNumber + 'R')       //Readed
//            .ZCARD(phoneNumber + 'D')       //Delete
//            .INCRBY(SUCCESS, 1)
//            .GET(FAILURE)
//            .exec(function(err, replies){
//                if(err){
//                    client.INCRBY(FAILURE, 1);
//                    o['Result'] = null;
//                    res.send(o);
//                }else{
////                    console.log(replies);
//                    replies = _.map(replies, function(item){
//                            return item ? item : 0;
//                        });
//                    o['Result'] = _.object(['Unreaded', 'Readed', 'Deleted', 'AccessSuccess', 'AccessFailure'], replies);
////                    console.log(o);
//                    res.send(o);
//                    
////                    client.end();
//                }
//            });
//        }else{
//            client.INCRBY(FAILURE, 1);
//            o['Result'] = null;
//            res.send(o);
//        } 
//    }
//});
//

app.get('/', function(req, res){
//	console.log(req);
//	var p = req.params.phoneNumber;
//	console.log(req.route.params);
//	console.log( p);
	res.send('请用Post请求携带手机号码访问!!');
});

