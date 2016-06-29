var fork = require('child_process').fork;
var server = null;

module.exports = function(gulp) {
	gulp.task('server:watch', ['sever:restart'], function (callback) {
		gulp.watch('./src/shared/**/*', ['sever:restart']);
		gulp.watch('./src/server/**/*', ['sever:restart']);

		callback();
	});

	gulp.task('sever:restart', function(callback){
		if(server)
			server.kill();

		server = fork('./src/server/app.js', {
			execArgv: ['--harmony']
		});
		console.warn('server reload');
		callback();
	});

	gulp.task('server', ['server:watch']);
};