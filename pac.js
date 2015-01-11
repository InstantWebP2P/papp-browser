var http = require('http');
var fs = require('fs');


// check arguments
if (process.argv.length < 5)
	throw new Error('Invalud pac cli');

var pacPort  = process.argv[2];
var prxyPort = process.argv[3];
var scksPort = process.argv[4];

// 3.
// start pac server

// pac server
var rawstr = fs.readFileSync(__dirname+'/auto.pac').toString('utf-8');
// fill http proxy server
var pacstr = rawstr.replace(/proxy_port/gi, ''+prxyPort);
pacstr = pacstr.replace(/socks_port/gi, ''+scksPort);
///console.log('pacstr: '+pacstr);
var pacsrv = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'application/x-ns-proxy-autoconfig'});
	res.end(pacstr);
});

pacsrv.listen(pacPort);
console.log('pac server listening on '+pacPort);