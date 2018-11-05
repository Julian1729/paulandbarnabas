const gulp = require('gulp');
var path = require('path');
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
      'signup'
    ],
    src: './public/assets/js/src/app.js',
    inputDir: './public/assets/js/src/pages/',
    outputDir: './public/assets/js/dist/',
    outputFile: 'bundle.js'
  },
  css: {
    sass: './public/assets/css/src/**/*.sass',
    outputDir: './public/assets/css/dist',
    compiled: './public/assets/css/dist/*.css',
    minifiedDir: './public/assets/css/dist/min'
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
  .pipe(gulp.dest(CONFIG.css.outputDir))//;
});

/**
 * Run necessary build tasks, then watch for changes with nodemon
 */
gulp.task('start', ['bundleAll', 'build-css-development'], function(){
  nodemon({
    script: 'app.js',
    tasks: function(changedFiles){
      // OPTIMIZE: do not rebundle file is a server side .js was modified
      var tasks = [];
      if(!changedFiles) return tasks;
      changedFiles.forEach(function(file){
        if(path.extname(file) === '.js' && (changedFiles.indexOf('bundleAll') === -1) ) tasks.push('bundleAll');
        if(path.extname(file) === '.sass' && (changedFiles.indexOf('build-css-development') === -1) ) tasks.push('build-css-development');
        if(path.extname(file) === '.pug' && (changedFiles.indexOf('build-css-development') === -1) ) tasks.push('build-css-development');
    });
      return tasks
    },
    ext: 'js pug sass',
    ignore: ['public/assets/js/dist/*']
  });
});
