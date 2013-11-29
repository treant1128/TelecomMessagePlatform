var soap = require('soap');

var url ='http://115.239.134.77/flow/services/FlowInterfaceAdapter?wsdl';

soap.createClient(url, function(err, client){
	if(!err){		
	console.log(client.discribe());
	}else{
	console.log(err);
	}	
});
