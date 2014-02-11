var redis = require('redis');
var async = require('async');
var client = redis.createClient(6379, 'db01', null);

var HASH_ALLDAYS        = 'Hash_AllDays';
var PV_HASH_ACCESS      = 'PV访问总';
var PV_HASH_N           = 'PV消息通知';
var PV_HASH_A           = 'PV活动推广';

var UV_SET_ACCESS       = 'UV访问总';
var UV_SET_N            = 'UV消息通知';
var UV_SET_A            = 'UV活动推广';

var getTodayDate = function(){
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()  < 9 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    var day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    return year + '-' + month + '-' + day;
};

function addToPV(fieldPrefix){
    if(fieldPrefix.constructor === String){
        client.HINCRBY(HASH_ALLDAYS, fieldPrefix + ':' + getTodayDate(), 1);
    }
};

//每日产生一个Set, 为了统计方便把SADD的结果HINCRBY给Hash  其实可以迭代HGETALL得到的fields去SCARD  Set
function addToUV(fieldPrefix, phoneNumber){
    if(fieldPrefix.constructor === String && phoneNumber.constructor === String){
        var today = getTodayDate();
        async.waterfall([
            function(cb){
                client.SADD(fieldPrefix + ':' + today, phoneNumber, function(err, result){
                    cb(err, result);  //return the number of elements that were added to the set, not including all the already present.
                });
            },

            function(incr, cb){
                client.HINCRBY(HASH_ALLDAYS, fieldPrefix + ':' + today, incr, function(err, result){
                    cb(err, result);
                });
            }
        ]);  //End of async.waterfall
    }
};

exports.accessPV = function(){
    addToPV(PV_HASH_ACCESS);
};
exports.N_PV = function(){
    addToPV(PV_HASH_N);
};
exports.A_PV = function(){
    addToPV(PV_HASH_A);
};

exports.accessUV = function(phoneNumber){
    addToUV(UV_SET_ACCESS, phoneNumber);
};
exports.N_UV = function(phoneNumber){
    addToUV(UV_SET_N, phoneNumber);
};
exports.A_UV = function(phoneNumber){
    addToUV(UV_SET_A, phoneNumber);
};

//所有信息都在Hash中
exports.getAllFromHash = function(callback){
    client.MULTI()
    .HGETALL(HASH_ALLDAYS)
    .EXEC(function(err, replies){
        callback(err ? err : replies);
    });
};
