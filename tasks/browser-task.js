var L10n = require('csv-l10nify');
var fpipe = require('gulp-fncallback');
var browserify = require('browserify');
var watchify = require('watchify');
var hmr = require('browserify-hmr');
var vueify = require('vueify');
var babelify = require('babelify');
var iconFont = require('gulp-iconfont');
var iconFontCss = require('gulp-iconfont-css');
var path = require('path');

var controller = require('./utils/controller');
var server = require('./utils/webserver');
var babelCompiler = require('./utils/vue-babel-replacer');

var app;

vueify.compiler.applyConfig({
	customCompilers: {
		'babel': babelCompiler(controller)
	}
});

controller.on('script', ()=> {
	controller.once('bundle', ()=> {
		app.sendReload();
	});

	console.log('script reload');
});

controller.on('bundle', ()=> {
	console.log('bundle reload');
});

controller.on('lang', ()=> {
	console.log('lang reload');
});

controller.on('iconfont', ()=> {
	app.sendReload();
	console.log('iconfont reload');
});

controller.on('error', (err)=> {
	console.error(err);
});

module.exports = function(gulp) {
	var l10n = L10n('src/lang/lang.csv');

	gulp.task('lang:watch', function(callback) {
		gulp.watch('src/lang/lang.csv', ['lang']);
		callback();
	});

	gulp.task('lang', function(callback) {
		l10n.reloadSync();
		controller.emit('lang');
		callback();
	});

	gulp.task('iconfont:watch', function(callback){
		gulp.watch('src/client/assets/svg/*.svg', ['iconfont']);
	});

	gulp.task('iconfont', function(){
		var fontName = 'icons';

		return gulp.src('src/client/assets/svg/*.svg')
			.pipe(iconFontCss({
				fontName: fontName,
				path: 'scss',
				targetPath: './icons.scss',
				fontPath: '/common/icons/'
			}))
			.pipe(iconFont({
				fontName: fontName, // required
				//prependUnicode: true, // recommended option
				formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'], // default, 'woff2' and 'svg' are available
				//timestamp: runTimestamp, // recommended to get consistent builds when watching files
			}))
			.pipe(gulp.dest('src/client/common/icons'))
			.pipe(fpipe(function(file, enc, cb) {
				controller.emit('iconfont');
				cb();
			}))
	});

	gulp.task('webserver', function(callback) {
		app = server({
			port: 8000,
			path: path.join(__dirname, '../src/client'),
			autoreload: true,
			resources: ['vendor', 'common']
		});

		app
			.start()
			.then(()=>{
				controller.emit('server');
				callback(null);
			}, callback);
	});

	gulp.task('builder', function () {
		var b = browserify({
			entries: ['src/client/main.js'],
			cache: {},
			packageCache: {},
			plugin: [watchify, hmr],
			transform: [l10n.transform, vueify, babelify],
			//debug: true
		});

		b.on('update', bundle);
		bundle();

		function bundle() {
			b.bundle((err, buff)=> {
				if(err) {
					return controller.emit('error', err);
				}

				app.script = buff;
				controller.emit('bundle');
			});
		}
	});

	gulp.task('browser', ['webserver', 'lang', 'lang:watch', 'iconfont:watch', 'iconfont', 'builder']);
};
