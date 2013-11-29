var sys = require( 'sys' ), 
    net = require( 'net' );

net.createServer( function( stream ) {
    stream.addListener( 'data', function( data ) {
        sys.puts( data );
    });
}).listen( 82, 'localhost' );
