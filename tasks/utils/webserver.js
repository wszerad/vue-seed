'use strict';
var express = require('express');
var app = express();
var path = require('path').posix;

class Server {
	constructor(opt) {
		this.opt = {
			port: opt.port || 8000,
			path: opt.path,
			autoreload: opt.autoreload,
			resources: opt.resources || []
		};

		this.script = '';
		this.events = new Map();
		this.events_ids = 0;
	}

	route() {
		if (this.opt.autoreload) {
			app.get('/reload.stream', (req, res)=> {
				var id = this.events_ids++;
				this.events.set(id, res);
				req.setTimeout(2147483647);

				res.writeHead(200, {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive'
				});
				res.write('\n');

				req.on("close", ()=> {
					this.events.delete(id);
				});
			});
		}
		
		app.get('/', nocache, (req, res)=> {
			var options = {
				root: path.join(this.opt.path),
				dotfiles: 'deny'
			};

			res.sendFile('index.html', options, (err)=> {
				if (err) {
					console.error(err);
					res.status(err.status).end();
				}
			});
		});
		
		app.get('/main.js', nocache, (req, res)=> {
			res.send(this.opt.autoreload ? injection + this.script : this.script);
		});

		this.opt.resources.forEach((name)=> {
			app.use(express.static(path.join(this.opt.path, name)));
		});
	}

	start() {
		return new Promise((resolve)=> {
			this.route();
			app.listen(this.opt.port, resolve);
			resolve();
		}).then(()=> {
			console.log('Listen for files localhost:' + this.opt.port);
		});
	}

	sendReload() {
		this.events.forEach((res)=> {
			res.write('event: reload\n');
			res.write("data: " + Date.now() + '\n\n');
		});
	}
}

var injection = `;(function(){
	var evtSource = new EventSource("reload.stream"),
		start = Date.now();

	evtSource.addEventListener('reload', function(e) {
		if(parseInt(e.data)>start) {
			console.log('Get reload event from server');
			window.location.reload();
		}
	}, false);
})();`;

function nocache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}

module.exports = function (opt) {
	return new Server(opt);
};