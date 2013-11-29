var oracle = require("oracle");


var connectStr="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=172.21.0.154)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=prtdb)(INSTANCE_NAME=prtdb4)))";
var connectData={ "tns": connectStr, "user": "USERLOG", "password": "abc" };

//var connectData = { "hostname": "172.21.0.158", "user": "USERLOG", "password": "abc", "database": "prtdb4" };


var checkBill=function(phonenumber,cb){
oracle.connect(connectData, function(err, connection) {
if(!err){ 
 		// selecting rows
//connection.execute("select * FROM SNS_USER.Nav_Llorder_Log WHERE from_id = 'wsc' AND status = '1' AND USERID="+phonenumber, [], function(err, results) {
//connection.execute("select * FROM SNS_USER.Nav_Llorder_Log WHERE from_id = 'wsc' AND USERID="+phonenumber, [], function(err, results) {
connection.execute("select * FROM SNS_USER.Nav_Llorder_Log  where USERID="+phonenumber, [], function(err, results) {
    		if ( err ) {
      			console.log(err);
			connection.close();
    		} else {
			cb(results);
      		//	console.log(results);
    		        connection.close(); // call this when you are done with the connection
		}
		});//END of execute


}else{
		console.log('-----------Connection Error------------');
		cb(results);
		console.log(err);
}

});//END OF oracle.connect.....
};//END of checkBill....

exports.checkBill=checkBill;

oracle.connect(connectData, function(err, connection) {
	connection.execute("select CREATE_TIME from SNS_USER.Nav_Llorder_Log where USERID='15356455511'", [], function(err, results){
		console.log('执行select CREATE_TIME from SNS_USER.Nav_Llorder_Log where USERID=\'15356455511\'的结果------------------');
		console.log(results);
	});
});

oracle.connect(connectData, function(err, connection) {
//	connection.execute("select count(*) from SNS_USER.Nav_Llorder_Log", [], function(err, results){
	connection.execute("select max(CREATE_TIME) from  SNS_USER.Nav_Llorder_Log", [], function(err, results){
		console.log('执行select select(*) from SNS_USER.Nav_Llorder_Log========================');
		console.log(results);
	});
});


oracle.connect(connectData, function(err, connection) {
if(!err){
connection.execute("select * FROM SNS_USER.Nav_Llorder_Log WHERE from_id in ('189_android', '189_ToolBar_V1', '189_ToolBar_V2', '189_toolbar', 'order_toolbar', 'wsc')AND status = '1' AND USERID=" + "15356455511", [], function(err, results) {
                if ( err ) {
                        console.log(err);
                        connection.close();
                } else {
			console.log('-----$$$$$$$$$$$$$$$$--------------');
                        console.log(results);
                        connection.close(); // call this when you are done with the connection
                }
                });//END of execute


}else{
                console.log(err);
}

});//END OF oracle.connect.....
