// iWebPP.io vURL will go through proxy

// both vHost and vPath
var regex_vboth = /((([0-9]|[a-f]){32}-)*([0-9]|[a-f]){32}\.vurl\.)|(\/vurl\/([0-9]|[a-f]){32}(-([0-9]|[a-f]){32})*)/;

function FindProxyForURL(url, host) {
	// skip none vURL sites
	if (!url.match(regex_vboth)) {
		return "DIRECT";
	} else {
		// ftp site prefer socks5 proxy
		if (url.match("ftp:")) {
			return "SOCKS5 127.0.0.1:socks_port;";
		}

		// http/ws site prefer socks5 proxy
		if (url.match("http:") || url.match("ws:")) {
			return "SOCKS5 127.0.0.1:socks_port;PROXY 127.0.0.1:proxy_port;";
		}

		// https/wss site prefer http proxy
		if (url.match("https:") || url.match("wss:")) {
			return "PROXY 127.0.0.1:proxy_port;SOCKS5 127.0.0.1:socks_port;";
		}
	}
}
