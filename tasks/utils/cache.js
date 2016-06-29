'use strict';
var crypto = require('crypto');

class Cache {
	constructor() {
		this.cache = {};
	}

	check(key, source) {
		var cache = this.cache[key],
			checksum = hash(source);

		if(cache && cache.checksum === checksum) {
			return false
		}

		return checksum
	}

	get(key) {
		return this.cache[key]
	}

	set(key, checksum, data) {
		return this.cache[key] = {
			checksum: checksum,
			data: data
		}
	};
}

function hash(str) {
	var hash = crypto.createHash('md5');
	hash.update(str);
	return hash.digest('hex')
}

module.exports = new Cache();