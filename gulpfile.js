const gulp = require('gulp');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const nodemon = require('gulp-nodemon');
const Cache = require('gulp-file-cache');
const rename = require('gulp-rename');
const es = require('event-stream');

var cache = new Cache();

const CONFIG = {
  js: {
    files: [
      'app.js',
      'another.js'
    ],
    src: './public/assets/js/src/app.js',
    inputDir: './public/assets/js/src/',
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

/**
 * Bundle all javascript files
 * @return {[type]} [description]
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



gulp.task('start', ['bundleAll'], function(){
  nodemon({
    script: 'app.js',
    // OPTIMIZE: pull out changed files anf only re-bundle those
    tasks: ['bundleAll'],
    ignore: ['public/assets/js/dist/*']
  });
});
