// Dependencies
var gulp = require('gulp');
var pump = require('pump');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var dest = require('gulp-dest');
var uglify = require('gulp-uglify');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var _ = require('underscore');

// Helper Functions
var nullify = function (proto) {
  proto = proto || [];
  var clone = _.clone(proto);
  if (_.size(proto)) {
    _.each(clone, function (value, key, list) {
      list[key] = '!' + value;
    });
  }
  return clone;
};

// Locations
var location = {
  boot: {
    source: [
      'boot/env.js',
      'boot/config.js',
      'boot/init.js'
    ],
    output: 'dist/boot.js'
  },
  stratus: {
    source: [
      'umd/header.js',
      'source/prototype.js',
      'source/external.js',
      'source/selector.js',
      'source/event.js',
      'source/prototypes.js',
      'source/internals.js',
      'loaders/backbone.bind.js',
      'loaders/angular.bind.js',
      'source/core.js',
      'umd/footer.js'
    ],
    output: 'dist/stratus.js'
  },
  mangle: {
    core: [

      // 'stratus.js',
      'normalizers/*.js',
      'models/*.js',
      'collections/*.js',
      'routers/*.js',
      'services/*.js',
      'bower_components/requirejs/require.js'

      // 'bower_components/ng-sortable/angular-legacy-sortable.js'
    ],
    min: [

      // 'stratus.min.js',
      'normalizers/*.min.js',
      'models/*.min.js',
      'routers/*.min.js',
      'controllers/*.min.js',
      'services/*.min.js',
      'bower_components/requirejs/require.min.js'

      // 'bower_components/ng-sortable/angular-legacy-sortable.min.js'
    ]
  },
  preserve: {
    core: [
      'boot/*.js',
      'components/*.js',
      'controllers/*.js',
      'directives/*.js',
      'filters/*.js'
    ],
    min: [
      'boot/*.min.js',
      'components/*.min.js',
      'collections/*.min.js',
      'directives/*.min.js',
      'filters/*.min.js'
    ]
  },
  less: {
    core: [
      //'stratus.less',
      'components/*.less'
    ],
    compile: []
  },
  css: {
    core: [
      //'stratus.css',
      'components/*.css',
      'directives/*.css'
    ],
    min: [
      //'stratus.min.css',
      'components/*.min.css',
      'directives/*.min.css'
    ]
  },
  template: {
    core: [
      'components/*.html'
    ],
    min: [
      'components/*.min.html'
    ]
  }
};

// Test
gulp.task('build', function (callback) {
  pump([
      gulp.src('./lib/*.js'),
      concat('all.js'),
      gulp.dest('./dist/')
    ],
    callback
  );
});

// Code Linters
gulp.task('lint:js', function (callback) {
  const jscs = require('gulp-jscs');

  pump([
      gulp.src(_.union(location.mangle.core, location.preserve.core, nullify(location.mangle.min), nullify(location.preserve.min), 'source/*.js')),
      debug({
        title: 'Verify:'
      }),
      jscs({
        //fix: true
      }),
      jscs.reporter(),
      jscs.reporter('fail')
    ],
    callback
  );
});

gulp.task('lint:css', function lintCssTask() {
  const gulpStylelint = require('gulp-stylelint');

  return gulp
    .src(_.union(location.css.core, nullify(location.css.min)))
    .pipe(gulpStylelint({
      //fix: true,
      reporters: [
        {
          formatter: 'string',
          console: true
        }
      ]
    }));
});


// Blanket Functions
gulp.task('compile', [
  'compile:less'
]);
gulp.task('compress', [
  'compress:mangle',
  'compress:preserve',
  'compress:css',
  'compress:template'
]);
gulp.task('clean', [
  'clean:mangle',
  'clean:preserve',
  'clean:less',
  'clean:css',
  'clean:template'
]);
gulp.task('dist', [
  'dist:boot',
  'dist:stratus',
  'dist:compress'
]);
gulp.task('lint', [
  'lint:js'
  //'lint:css'
]);

// Distribution Functions
gulp.task('dist:boot', function (callback) {
  pump([
      gulp.src(location.boot.source, {
        base: '.'
      }),
      concat(location.boot.output),
      gulp.dest('.')
    ],
    callback
  );
});
gulp.task('dist:stratus', function (callback) {
  pump([
      gulp.src(location.stratus.source, {
        base: '.'
      }),
      concat(location.stratus.output),
      gulp.dest('.')
    ],
    callback
  );
});
gulp.task('dist:compress', function (callback) {
  pump([
      gulp.src([location.boot.output, location.stratus.output], {
        base: '.'
      }),
      debug({
        title: 'Mangle:'
      }),
      uglify({
        // preserveComments: 'license',
        mangle: true
      }),
      dest('.', {
        ext: '.min.js'
      }),
      gulp.dest('.')
    ],
    callback
  );
});

// Mangle Functions
gulp.task('clean:mangle', function () {
  return gulp.src(location.mangle.min, { base: '.', read: false })
    .pipe(debug({ title: 'Clean:' }))
    .pipe(vinylPaths(del));
});
gulp.task('compress:mangle', ['clean:mangle'], function (callback) {
  pump([
      gulp.src(_.union(location.mangle.core, nullify(location.mangle.min)), {
        base: '.'
      }),
      debug({
        title: 'Mangle:'
      }),
      uglify({
        // preserveComments: 'license',
        mangle: true
      }),
      dest('.', {
        ext: '.min.js'
      }),
      gulp.dest('.')
    ],
    callback
  );
});

// Preserve Functions
gulp.task('clean:preserve', function () {
  return gulp.src(location.preserve.min, { base: '.', read: false })
    .pipe(debug({ title: 'Clean:' }))
    .pipe(vinylPaths(del));
});
gulp.task('compress:preserve', ['clean:preserve'], function (callback) {
  pump([
      gulp.src(_.union(location.preserve.core, nullify(location.preserve.min)), {
        base: '.'
      }),
      debug({
        title: 'Compress:'
      }),
      uglify({
        // preserveComments: 'license',
        mangle: false
      }),
      dest('.', {
        ext: '.min.js'
      }),
      gulp.dest('.')
    ],
    callback
  );
});

// LESS Functions
gulp.task('clean:less', function () {
  return gulp.src(location.less.compile, { base: '.', read: false })
    .pipe(debug({ title: 'Clean:' }))
    .pipe(vinylPaths(del));
});
gulp.task('compile:less', ['clean:less'], function (callback) {
  const less = require('gulp-less');
  pump([
      gulp.src(_.union(location.less.core, nullify(location.less.compile)), {
        base: '.'
      }),
      debug({
        title: 'LESS:'
      }),
      less({}),
      dest('.', {
        ext: '.css'
      }),
      gulp.dest('.')
    ],
    callback
  );
});

// CSS Functions
gulp.task('clean:css', function () {
  return gulp.src(location.css.min, { base: '.', read: false })
    .pipe(debug({ title: 'Clean:' }))
    .pipe(vinylPaths(del));
});
gulp.task('compress:css', ['clean:css'], function (callback) {
  const cleanCSS = require('gulp-clean-css');
  pump([
      gulp.src(_.union(location.css.core, nullify(location.css.min)), {
        base: '.'
      }),
      debug({
        title: 'CSS:'
      }),
      cleanCSS({
        compatibility: '*',
        inline: ['none'],
        rebaseTo: 'none' // FIXME: This is a temporary hack I created by breaking some code in CleanCSS to get back relative urls
      }),
      dest('.', {
        ext: '.min.css'
      }),
      gulp.dest('.')
    ],
    callback
  );
});

// Template Functions
gulp.task('clean:template', function () {
  return gulp.src(location.template.min, { base: '.', read: false })
    .pipe(debug({ title: 'Clean:' }))
    .pipe(vinylPaths(del));
});
gulp.task('compress:template', ['clean:template'], function (callback) {
  const htmlmin = require('gulp-htmlmin');
  pump([
      gulp.src(_.union(location.template.core, nullify(location.template.min)), {
        base: '.'
      }),
      debug({
        title: 'Template:'
      }),
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true
      }),
      dest('.', {
        ext: '.min.html'
      }),
      gulp.dest('.')
    ],
    callback
  );
});
