var babelCompiler = require('vueify/lib/compilers/babel');
var cache = require('./cache');

module.exports = function(controller) {
	return function (raw, cb, compiler, filePath) {
		var script = raw.trim(),
			key = 'script:' + filePath,
			newChecksum = cache.check(key, script);

		if(!newChecksum) {
			cb(null, cache.get(key).data);
		} else {
			babelCompiler(raw, function (err, code) {
				if(err)
					return cb(err);
				
				cache.set(key, newChecksum, code);
				cb(null, code);
				controller.emit('script');
			});
		}
	}
};
	