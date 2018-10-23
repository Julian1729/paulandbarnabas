const gulp = require('gulp');
const sass = require('gulp-sass');
const es = require('event-stream');
const rename = require('gulp-rename');
const nodemon = require('gulp-nodemon');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

/**
 * Constant configuarations and file paths
 * @type {Object}
 */
const CONFIG = {
  js: {
    files: [
      'app.js',
    ],
    src: './public/assets/js/src/app.js',
    inputDir: './public/assets/js/src/',
    outputDir: './public/assets/js/dist/',
    outputFile: 'bundle.js'
  },
  css: {
    src: './public/assets/css/src/**/*.sass',
    outputDir: './public/assets/css/dist'
  }
};

/**
 * Use browserify to bundle javascript files
 */
gulp.task('bundle', function(){
  return browserify(CONFIG.js.src)
    .bundle()
    .pipe(source(CONFIG.js.outputFile))
    .pipe(gulp.dest(CONFIG.js.outputDir));
});

gulp.task('styles', function(){
  gulp.src(CONFIG.css.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(CONFIG.css.outputDir));
});

/**
 * Bundle all javascript files
 */
gulp.task('bundleAll', function(){

  var tasks = CONFIG.js.files.map(function(entry){
    var srcPath = CONFIG.js.inputDir + entry;
    return browserify({entries: [srcPath]})
      .bundle()
      .pipe(source(entry))
      .pipe(rename({
        extname: '.bundle.js'
      }))
      .pipe(gulp.dest(CONFIG.js.outputDir));
  });

  // create a merged stream
  return es.merge.apply(null, tasks);

});

/**
 * Run necessary build tasks, then watch for changes with nodemon
 */
gulp.task('start', ['bundleAll'], function(){
  nodemon({
    script: 'app.js',
    // OPTIMIZE: pull out changed files anf only re-bundle those
    tasks: ['bundleAll', 'styles'],
    ext: 'js pug sass',
    ignore: ['public/assets/js/dist/*']
  });
});
