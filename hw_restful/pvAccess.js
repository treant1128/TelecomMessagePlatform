var redis = require('redis');
var client = redis.createClient(6379, 'db01');

var SUCCESS = 'RestfulAccessSuccess';
var FAILURE = 'RestfulAccessFailure';

var last =  0;
var now = 0;

setInterval(function(){
        calcAccess(function(r){
            for(var i=0; i<r.length; i++){
                now += parseInt(r[i] ? r[i] : 0, 10);    
            }

            console.log('%s: --> %d', getTime() +' PV: ', now - last);
            last = now;
            now = 0;
        });
    }, 1000);

function getTime(){
    var now = new Date();
    return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' 
            + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
};

function calcAccess(cb){
    client.MULTI()
    .GET(SUCCESS)
    .GET(FAILURE)
    .EXEC(function(err, replies){
        if(!err){
            console.log(replies);
            cb(replies); 
        }else{
            cb('ERROR');    
        }
    });
};
