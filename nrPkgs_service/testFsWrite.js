var fs = require('fs');

var o = new Object();
o.pro1 = 'treant';
o['pro2'] = 'panda';

fs.appendFile('a.out', '\n'+JSON.stringify(o), function(err){
	if(err) throw err;
	console.log("FileSystem Append Complete ...");
});


var a = 'abcdefg';
console.log(a.replace(/de/, 'mnt123'));
