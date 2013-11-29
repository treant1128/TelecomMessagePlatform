var async = require('async');

async.series([
		function(callback){
			setTimeout(function(){
				console.log("I 'm First setTimeout 2000ms");
//				callback('Ha, I\'m error here ~~', 'Panda');
				callback(null, 'Panda');
			}, 2000);		
		},
		function(callback){
			setTimeout(function(){
				console.log("Second setTimeout 1000 ms");
				callback('Error is treant heihei...', 'Treant');
			}, 1000);
		},
		function(callback){
				console.log("Right now!!!");
				callback(null, 'Akasa');
		},
], function(err, result){
	console.log('-------------------err&&result------------------');
	console.log(err);
	console.log(result);
});
