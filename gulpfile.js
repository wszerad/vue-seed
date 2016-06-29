var gulp = require('gulp');

//TASKS
require('./tasks/server-task')(gulp);
require('./tasks/browser-task')(gulp);

gulp.task('default', ['server', 'browser']);