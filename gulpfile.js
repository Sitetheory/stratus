// Dependencies
var gulp = require('gulp');
var debug = require('gulp-debug');
var dest = require('gulp-dest');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
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
    mangle: {
        core: [
            'stratus.js',
            'normalizers/*.js',
            'models/*.js',
            'collections/*.js',
            'routers/*.js',
            'views/**/*.js',
            'bower_components/requirejs/require.js'
        ],
        min: [
            'stratus.min.js',
            'normalizers/*.min.js',
            'models/*.min.js',
            'collections/*.min.js',
            'routers/*.min.js',
            'views/**/*.min.js',
            'bower_components/requirejs/require.min.js'
        ]
    },
    preserve: {
        core: [
            'controllers/*.js',
            'components/*.js',
            'directives/*.js',
            'filters/*.js',
            'services/*.js'
        ],
        min: [
            'controllers/*.min.js',
            'components/*.min.js',
            'directives/*.min.js',
            'filters/*.min.js',
            'services/*.min.js'
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

// Functions
gulp.task('jscs', function () {
    return gulp.src(_.union(location.mangle.core, location.preserve.core, nullify(location.mangle.min), nullify(location.preserve.min)))
        .pipe(debug({ title: 'Verify:' }))
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
});
gulp.task('compress', ['compress:mangle', 'compress:preserve', 'compress:template']);
gulp.task('clean:mangle', function () {
    return gulp.src(location.mangle.min, { base: '.', read: false })
        .pipe(debug({ title: 'Clean:' }))
        .pipe(vinylPaths(del));
});
gulp.task('compress:mangle', ['clean:mangle'], function () {
    return gulp.src(_.union(location.mangle.core, nullify(location.mangle.min)), { base: '.' })
        .pipe(debug({ title: 'Mangle:' }))
        .pipe(uglify({
            preserveComments: 'license',
            mangle: true
        }))
        .pipe(dest('.', { ext: '.min.js' }))
        .pipe(gulp.dest('.'));
});
gulp.task('clean:preserve', function () {
    return gulp.src(location.preserve.min, { base: '.', read: false })
        .pipe(debug({ title: 'Clean:' }))
        .pipe(vinylPaths(del));
});
gulp.task('compress:preserve', ['clean:preserve'], function () {
    return gulp.src(_.union(location.preserve.core, nullify(location.preserve.min)), { base: '.' })
        .pipe(debug({ title: 'Compress:' }))
        .pipe(uglify({
            preserveComments: 'license',
            mangle: false
        }))
        .pipe(dest('.', { ext: '.min.js' }))
        .pipe(gulp.dest('.'));
});
gulp.task('clean:template', function () {
    return gulp.src(location.template.min, { base: '.', read: false })
        .pipe(debug({ title: 'Clean:' }))
        .pipe(vinylPaths(del));
});
gulp.task('compress:template', ['clean:template'], function () {
    return gulp.src(_.union(location.template.core, nullify(location.template.min)), { base: '.' })
        .pipe(debug({ title: 'Template:' }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest('.', { ext: '.min.html' }))
        .pipe(gulp.dest('.'));
});