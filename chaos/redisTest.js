var redis  = require("redis"),
    client = redis.createClient(6379, 'app02'),
    set_size = 20,
    multi = client.multi();

 client.HINCRBY('treantKey', 'treantField', 138, function(err, result){
 	client.HGETALL('treantKey', function(err, r){
		console.log(r);
		var o = r.treantField;
		console.log(o.constructor);
		console.log(o);
	});
 });

//    var v = false;
//    console.log(v?'是1成了':'是0不成');
////    client.HGETALL('zjdx_msg:hash_pool:key', function(err, result){
////		console.log(err ? err : result);
////    });
//    
//    client.sadd("bigset", "a member");
//    client.sadd("bigset", "another member");
//
//    while (set_size > 0) {
//        client.sadd("bigset", "member " + set_size);
//        set_size -= 1;
//    }
//
//    // multi chain with an individual callback
//    
//        multi.scard("bigset")
//        .smembers("bigset")
//        .keys("*", function (err, replies) {
//            // NOTE: code in this callback is NOT atomic
//            // this only happens after the the .exec call finishes.
//            client.mget(replies, redis.print);
//        })
//        .dbsize()
//        .exec(function (err, replies) {
//            console.log("MULTI got " + replies.length + " replies");
//            replies.forEach(function (reply, index) {
//                console.log("Reply " + index + ": " + reply.toString());
//            });
//        });
