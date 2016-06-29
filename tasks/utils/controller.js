'use strict';

const EventEmitter = require('events');

class Controller extends EventEmitter {
	/*constructor() {
		super();

		this.preparation = {};
	}

	progress(event) {
		if(!this.preparation.hasOwnProperty(event)) {
			this.preparation[event] = new Set();
		}

		var self = this,
			handle = {};

		var promise = new Promise((resolve, reject)=> {
				handle.resolve = resolve;
				handle.reject = reject;
			})
			.then(del, del);

		this.preparation[event].add(promise);

		function del() {
			self.preparation[event].delete(promise);
		}

		return handle;
	}

	after(events) {
		var waiting = [];

		[].concat(events).forEach((event)=>{
			if(this.preparation[event] && this.preparation[event].size) {
				waiting.push(...Array.from(this.preparation[event]));
			}
		});

		return Promise.all(waiting);
	}*/
}

module.exports = new Controller();