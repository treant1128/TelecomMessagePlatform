var fs = require('fs'); 
var lazy = require('lazy');

//lazy读取指定路径nrPkg的号码包, 号码数组返给给回调函数callback
var _readNumbersByPath = function(nrPkg, callback){
	if(nrPkg){ 
		var numbers = new Array();
		var stream = fs.createReadStream(nrPkg); 

		stream.on('end',function(){ 
			callback(numbers);		
		});
       
		stream.on('error', function(){ 
			callback(['abc', 'mnt']);		
		});
 	
		lazyRead(numbers, stream);	
   	}else{
    	  callback(['abc', 'mnt']);
  	}
}

function lazyRead(numbers, stream){
  new lazy(stream)
	  .lines
	  .forEach(function(line){
//		console.log(line.toString()+'******************');
		if(line.toString().charAt(0) != '#'){
        		numbers.push(line.toString().trim());
//		  	console.log('line = ' + line);
		}
	  });
}

exports.readNumbersByPath = _readNumbersByPath;
