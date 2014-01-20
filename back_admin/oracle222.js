var oracle = require("oracle");


var connectStr="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=172.21.0.154)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=prtdb)(INSTANCE_NAME=prtdb4)))";
var connectData={ "tns": connectStr, "user": "USERLOG", "password": "abc" };

//var connectData = { "hostname": "172.21.0.158", "user": "USERLOG", "password": "abc", "database": "prtdb4" };


var checkBill=function(phonenumber,cb){
    oracle.connect(connectData, function(err, connection) {
        if(!err){ 
         		// selecting rows
        //connection.execute("select * FROM SNS_USER.Nav_Llorder_Log WHERE from_id in ('189_android', '189_ToolBar_V1', '189_ToolBar_V2', '189_toolbar', 'order_toolbar', 'wsc') AND status = '1' AND USERID=" + phonenumber, [], function(err, results) {
        //connection.execute("SELECT * FROM SNS_USER.Nav_Llorder_Log WHERE USERID = " + phonenumber + "AND from_id != 'rate_move' AND status = '1' ORDER BY UPDATE_TIME DESC", [], function(err, results) {
        connection.execute("SELECT * FROM SNS_USER.Nav_Llorder_Log WHERE USERID = " + phonenumber + "AND from_id != 'rate_move' ORDER BY UPDATE_TIME DESC", [], function(err, results) {                  //不指定status = '1'
            		if (err) {
              			console.log(err);
            		}else{
            			cb(results);
        //    			console.log(results);
        		    }
        
            		connection.close(); // call this when you are done with the connection
        		});//END of execute
        }else{
        		cb(null);
        		console.log(err);
        }
    });//END OF oracle.connect.....
};//END of checkBill....

exports.checkBill = checkBill;
checkBill('18006783900', function(result){ 
    console.log(result);
    for(r in result){
            console.log(result[r]['STATUS']);
    }

    console.log('数量: ' + result.length);
    });
