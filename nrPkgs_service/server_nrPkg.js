var exec=require('child_process').exec, child;
var async = require('async');
var fs=require('fs');
var express=require('express');
var app=express();
var server=require('http').createServer(app);

//存放号码包的主文件夹全路径  无论是否以'/'结尾
var rootPath = '/home/node/zjdx_msg/nrPkgs_service/forgedNumbers/';
//var rootPath = '/home/node/zjdx_msg/nrPkgs_service/forgedNumbers';

app.use(express.bodyParser({}));
var port = 8084;
server.listen(port);
console.log('展示号码包文件服务 Listening: ' + port);

app.all('/', function(req, res, next){
//res.send('ddg abc mnt 123');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
//    next();
    });

app.get('/getDirs', function(req, res){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested_with");
	
    async.waterfall([
         function(cb){
        	fs.readdir(rootPath, function(err, files){
        		cb(err, files);
        	});
         },
    	
         function(files, cb){
            if(files.constructor === Array){
		    console.log('根目录下所有子文件夹: ' + files);
		var objs = new Array();
    		for(f in files){
			console.log('根目录下第%d个子文件夹路径: %s', f,  composePath(rootPath, files[f]));
			listChildrenCount(composePath(rootPath, files[f]), function(path, err, children){
				var obj = new Object();
				obj.name = path.substr(path.lastIndexOf('/') + 1);
				obj.count = children.length;
				objs.push(obj);
				if(objs.length === files.length){
					cb(err, objs);	
				}
			});			
		}        
            }
         }
         ], function(err, result){
    		res.send(result);
         }
    );

});

//获取某一文件夹下文件(文件夹)的个数
var listChildrenCount  = function(dirPath, cb){
	if(dirPath.constructor === String){
		fs.readdir(dirPath, function(err, files){
			console.log('第二层下'+dirPath+'的Children:------' + files);
			cb(dirPath, err, files);
		});
	}
};

var count = 0;
app.post('/subDirDetails', function(req, res){
	console.log('-----RequestGetDir------');
    count++;
    console.log('Receive Request: %d', count);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var subDir = req.body.subDirName;
    console.log('subDir: ' + subDir);
    var subDirAbsPath = composePath(rootPath, subDir);
    console.log('SubDirAbsPath: %s', subDirAbsPath);
    
    async.waterfall([
	    	function(cb){
			fs.readdir(subDirAbsPath, function(err, files){
				cb(err, files);
			});
		},
		function(files, cb){
			if(files.constructor === Array){
				var objs = new Array;
				
				for(n in files){
					statFile(subDirAbsPath, files[n], function(name, path, stdout){
						var obj = new Object();
						obj.name = name.indexOf('.') === -1 ? name : name.substring(0, name.indexOf('.'));
						obj.path = path;
						obj.lines = parseInt(stdout);
						objs.push(obj);
						if(objs.length === files.length){
							cb(null, objs);
						}
					});
				}
			}
		}
	    	], 
	    
	    	function(err, result){
			console.log(result);
			res.send(result);    
    		}
	    );
});

//列出某一文件中有效数据(不含'#')行数
var statFile = function(parentDir, fileName, callback){
	var absPath = composePath(parentDir, fileName);
	exec('cat ' + absPath + ' | grep -v \'#\' -c', function(error, stdout, stderr){
		if(!error){
			callback(fileName, absPath, stdout);
		}else{
			callback(fileName, absPath, null);
		}
	});
};

//组合绝对路径  针对文件夹路径是否以'/'结尾
var composePath = function(parentPath, child){
	return parentPath + (parentPath.charAt(parentPath.length - 1) == '/' ? '' : '/') + child;
};


