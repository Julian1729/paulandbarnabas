const gulp = require('gulp');
const path = require('path');
const pump = require('pump');
const csso = require('gulp-csso');
const sass = require('gulp-sass');
const es = require('event-stream');
const rename = require('gulp-rename');
const nodemon = require('gulp-nodemon');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const autoprefixer = require('gulp-autoprefixer');

/**
 * Constant configuarations and file paths
 * @type {Object}
 */
const CONFIG = {
  js: {
    files: [
      'landing',
      'register-user',
      'register-congregation',
      'ap-createterritory',
      'ap-createfragment',
      'ap-managepublishers',
      'territory-householdercontacted',
      'territory-unitoverview',
      'territory-blockoverview',
      'localize-constants'
    ],
    dir: './public/js/src/**/*.js',
    src: './public/js/src/app.js',
    inputDir: './public/js/src/pages/',
    outputDir: './public/js/dist/',
    outputFile: 'bundle.js'
  },
  css: {
    sass: './public/css/src/**/*.sass',
    outputDir: './public/css/dist',
    compiled: './public/css/dist/*.css',
    minifiedDir: './public/css/dist/min'
  },
  html: {
    pug: './views/**/*.pug',
  },
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

/**
 * Compile SASS into CSS
 */
gulp.task('compile-sass', function(){
  return gulp.src(CONFIG.css.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(CONFIG.css.outputDir));
});

/**
 * Bundle all javascript files
 */
gulp.task('bundle-all', function(){

  let tasks = CONFIG.js.files.map(function(entry){
    let srcPath = CONFIG.js.inputDir + entry;
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
 * Minify css
 */
gulp.task('minify-css', function () {
    return gulp.src(CONFIG.css.compiled)
      .pipe(csso())
      .pipe(gulp.dest(CONFIG.css.minifiedDir));
});

/**
 * Autoprefix css
 * this must be done after compilation and before minify-css it
 * only reads the compiled files, and outputs to same dir
 */
gulp.task('autoprefix-css', function(){
  return gulp.src(CONFIG.css.compiled)
    .pipe(autoprefixer())
    .pipe(gulp.dest(CONFIG.css.outputDir));
});

/**
 * Handle all stylesheet build processes (compile sass, and autoprefix)
 */
gulp.task('build-css-development', function(){
  return gulp.src(CONFIG.css.sass)
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer())
  .pipe(gulp.dest(CONFIG.css.outputDir));
});

/**
 * Set test env var
 */
gulp.task('set-development-env-var', function(){
  return process.env.NODE_ENV = 'development';
});

/**
 * Set timezone env var
 */
gulp.task('set-timezone-env-var', function(){
  return process.env.TZ = 'America/New_York';
});

gulp.task('watch-public', function(){

  gulp.watch(CONFIG.css.sass, ['build-css-development']);
  gulp.watch(CONFIG.js.dir, ['bundle-all']);

});

/**
 * Run necessary build tasks, then watch for changes with nodemon
 */
gulp.task('start', ['set-development-env-var', 'set-timezone-env-var', 'bundle-all', 'build-css-development', 'watch-public'], function(){
  nodemon({
    script: 'app.js',
    ext: 'js',
    ignore: ['public/**'],
  });
});
