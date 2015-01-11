var exec = require('child_process').exec,
	fork = require('child_process').fork,
    child;
var http = require('http');
var fs = require('fs');
var socks = require('socks5');
var freeport = require('freeport');
var os = require('os'); 


var forwardProxy = require('forward-proxy');

// prompt user key
var readline = require('readline');

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
rl.on('line', function (usrkey) {
	///console.log('You just typed: '+usrkey);
	console.log('......');
	
	rl.close();

	var prxySrv = new forwardProxy({
		endpoints: [{ip: 'iwebpp.com', port: 51686}, {ip: 'iwebpp.com', port: 51868}],
		turn: [{ip: 'iwebpp.com', agent: 51866, proxy: 51688}],

		usrkey: usrkey, 
		secmode: 'acl', 
		sslmode: 'srv',
		access_local: false
	}, function(err, proxy){
		if (err || !proxy) {
			console.log(err+',create proxy failed');
			return 
		}

		// turn on export service query timer
		///prxySrv.turnQuerytimer(true);

		var importApp = proxy.importApp;

		// 1.
		// get free tcp port
		freeport(function(err, prxyPort) {
			if (err) throw new Error(err+', get proxy port failed');

			// 2.
			// start http proxy service
			var pxySrv = http.createServer();

			pxySrv.on('request', importApp.httpApp.proxy);
			pxySrv.on('connect', importApp.httpApp.tunnel);

			pxySrv.listen(prxyPort);
			console.log('Http forwar proxy server listen on port '+prxyPort);

			freeport(function(err, scksPort) {
				if (err) throw new Error(err+', get socks port failed');

				// 2.1
				// start socks proxy service
				var sockspxySrv = socks.createServer(importApp.socksApp);

				sockspxySrv.listen(scksPort);

				sockspxySrv.on('error', function (e) {
					console.error('SERVER ERROR: %j', e);
				});
				console.log('Socks forward proxy server listen on port '+scksPort);

				// 3.
				// start pac server
				freeport(function(err, pacPort) {
					if (err) throw new Error(err+', get pac port failed');

					
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

					/*var pac = fork('./pac.js', [pacPort, prxyPort, scksPort]);
					pac.on('exit', function(code){
						console.log('pac server exited '+code);
						// exit main program
						process.exit(code);
					});*/
					
					// 4.
					// launching chrome browser with pac settings
					var cli = '';

					// 4.1
					// check platform specific chromium binary path
					var plt = os.platform();
					var runtime;

					console.log('platform:'+plt);
					if (plt.match('win32')) {
						runtime = __dirname + '/front/windows/GoogleChromePortable/App/Chrome-bin/chrome.exe';
					} else if (plt.match('darwin')) {
						runtime = __dirname + '/front/mac/Chromium.app/Contents/MacOS/Chromium';
					} else if (plt.match('linux')) {
						runtime = __dirname + '/front/linux/ChromiumPortable/ChromiumPortable';
					} else {
						throw new Error('Not support platform');
					}

					cli  = '"' + runtime + '"';
					cli += ' --proxy-pac-url="http://localhost:'+pacPort+'/auto.pac"';
					cli += ' --user-data-dir="' + __dirname + '/user-data/' + '"';
					cli += ' --disable-translate';

					console.log("cli: "+cli);
					child = exec(cli);

					child.on('exit', function(code){
						console.log('child browser exited '+code);
						// exit main program
						process.exit(code);
					});
				});
			});
		});
	});
});
console.log('Please enter your user key:');
