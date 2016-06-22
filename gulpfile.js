var gulp = require('gulp'),
		run = require('run-sequence'),
		plugins = require('gulp-load-plugins')();

var options = {
	
	default: {
		tasks: function (callback) {
			return run('build', callback);
		}
	},
	
	build: {
		tasks: function (callback) {
			return run(['clean', 'scripts'], callback);
		}
	},
	
	js: {
		source: 'src/js/jquery.instaslide.js',
		dest: "./dist/js"
	},
	
	clean: {
		source: function() {
			return gulp.src('./dist/*.js', {read: false})
			.pipe(plugins.clean({force: true}))
		}
	}
	
};

//Default
gulp.task('default', options.default.tasks);

// Build
gulp.task('build', options.build.tasks);

// Scripts
gulp.task('scripts', function() {
	return gulp.src(options.js.source)
	.pipe(gulp.dest(options.js.dest))
	.pipe(plugins.rename({ suffix: '.min' }))
	.pipe(plugins.uglify())
	.pipe(gulp.dest(options.js.dest));
});

// Clean
gulp.task('clean', options.clean.source);