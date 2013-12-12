var _ = require('underscore');
var redis = require('redis');
var client = redis.createClient(6379, '127.0.0.1');

var msgCodes = ['A1', 'B2', 'C3', 'D4', 'E5', 'F6', 'G7'];
var scores = [888, 888, 888, 888, 888, 888, 888];

var zip = _.zip(scores, msgCodes);
console.log('--------------zip---------------');
console.log(zip);
console.log('Is zip an array? ' + _.isArray(zip));
console.log(zip.constructor);
//console.log(zip.join());
//console.log(zip.join(' '));
//Memo is the initial state of the reduction, and each successive step of it should be returned by iterator. 
//The iterator is passed four arguments: the memo, then the value and index (or key) of the iteration, and finally a reference to the entire list.
var z = _.reduce(zip, function(memo, value, index, list){
        console.log(value);
        memo = memo.concat(value);
        console.log(memo);
        return memo;
    }, []);
console.log('***after reduce zip***********');
console.log(z);

var obj = _.object(msgCodes, scores);
console.log('---------------object----------------');
console.log(obj);
console.log(obj.constructor);

var r = _.reduce(obj, function(memo, value, key, list){
        memo.push(value);
        memo.push(key);
        return memo;
    }, []);

console.log('-----------after reduce obj-----------');
console.log(r);
r.unshift('mnt');
//client.ZADD(r, function(err, result){
//    console.log(result);
//}); 
msgCodes.unshift('mnt');
client.ZREM(msgCodes, function(err, result){
    console.log(result);
    });
