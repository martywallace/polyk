var gulp = require('gulp');
var min = require('gulp-minify');

gulp.task('minify', function() {
	gulp.src('./src/*.js')
		.pipe(min())
		.pipe(gulp.dest('dist'));
});