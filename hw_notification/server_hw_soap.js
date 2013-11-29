var soap = requier('soap');

var myService = {
	MyService : {
		MyPort : {
			MyFunction : function(args){
				return {
					name : args.name
			     	};
		     	}

			MyAsyncFunction : function(args, callback){
				  //do some work
				callback({
					name	: args.name
				})
			}
		}
	}
};

var xml = require('fs').readFileSync('myService.wsdl', 'utf8'),
    server = http.createServer(function(request, response){
		  response.end("404: Not Found: " + request.url)
		    });

server.listen(8082);

soap.listen(server, '/wsdl', myService, xml);
