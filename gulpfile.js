const gulp = require('gulp');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const nodemon = require('gulp-nodemon');
const Cache = require('gulp-file-cache');

var cache = new Cache();

const CONFIG = {
  js: {
    src: './public/assets/js/src/app.js',
    outputDir: './public/assets/js/dist/',
    outputFile: 'bundle.js'
  }
};

gulp.task('bundle', function(){
  return browserify(CONFIG.js.src)
    .bundle()
    .pipe(source(CONFIG.js.outputFile))
    .pipe(gulp.dest(CONFIG.js.outputDir));
});



gulp.task('start', ['bundle'], function(){
  nodemon({
    script: 'app.js',
    tasks: ['bundle'],
    ignore: ['public/assets/js/dist/*']
  });
});
