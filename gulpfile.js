// Dependencies
var gulp = require('gulp');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var dest = require('gulp-dest');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
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
    dist: {
        core: [
            'boot/env.js',
            'bower_components/requirejs/require.js',
            'boot/config.js',
            'boot/init.js'
        ],
        min: [
            'boot/env.min.js',
            'bower_components/requirejs/require.min.js',
            'boot/config.min.js',
            'boot/init.min.js'
        ],
        output: 'dist/boot.js'
    },
    mangle: {
        core: [
            'stratus.js',
            'normalizers/*.js',
            'models/*.js',
            'collections/*.js',
            'routers/*.js',
            'controllers/*.js',
            'services/*.js',
            'bower_components/requirejs/require.js',
            'bower_components/ng-sortable/angular-legacy-sortable.js'
        ],
        min: [
            'stratus.min.js',
            'normalizers/*.min.js',
            'models/*.min.js',
            'collections/*.min.js',
            'routers/*.min.js',
            'controllers/*.min.js',
            'services/*.min.js',
            'bower_components/requirejs/require.min.js',
            'bower_components/ng-sortable/angular-legacy-sortable.min.js'
        ]
    },
    preserve: {
        core: [
            'boot/*.js',
            'components/*.js',
            'directives/*.js',
            'filters/*.js'
        ],
        min: [
            'boot/*.min.js',
            'components/*.min.js',
            'directives/*.min.js',
            'filters/*.min.js'
        ]
    },
    less: {
        core: [
            'stratus.less',
            'components/*.less'
        ],
        compile: []
    },
    css: {
        core: [
            'stratus.css',
            'components/*.css'
        ],
        min: [
            'stratus.min.css',
            'components/*.min.css'
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

// Code Styling
gulp.task('jscs', function () {
    return gulp.src(_.union(location.mangle.core, location.preserve.core, nullify(location.mangle.min), nullify(location.preserve.min)))
        .pipe(debug({ title: 'Verify:' }))
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
});

// Blanket Functions
gulp.task('compile', ['compile:less']);
gulp.task('compress', ['compress:mangle', 'compress:preserve', 'compress:css', 'compress:template']);
gulp.task('clean', ['clean:mangle', 'clean:preserve', 'clean:less', 'clean:css', 'clean:template']);
gulp.task('dist', ['dist:compile', 'dist:compress']);

// Distribution Functions
gulp.task('dist:compile', function () {
    return gulp.src(_.union(location.dist.core, nullify(location.dist.min)), { base: '.' })
        .pipe(concat(location.dist.output))
        .pipe(gulp.dest('.'));
});
gulp.task('dist:compress', function () {
    return gulp.src([location.dist.output], { base: '.' })
        .pipe(debug({ title: 'Mangle:' }))
        .pipe(uglify({
            // preserveComments: 'license',
            mangle: true
        }))
        .pipe(dest('.', { ext: '.min.js' }))
        .pipe(gulp.dest('.'));
});

// Mangle Functions
gulp.task('clean:mangle', function () {
    return gulp.src(location.mangle.min, { base: '.', read: false })
        .pipe(debug({ title: 'Clean:' }))
        .pipe(vinylPaths(del));
});
gulp.task('compress:mangle', ['clean:mangle'], function () {
    return gulp.src(_.union(location.mangle.core, nullify(location.mangle.min)), { base: '.' })
        .pipe(debug({ title: 'Mangle:' }))
        .pipe(uglify({
            // preserveComments: 'license',
            mangle: true
        }))
        .pipe(dest('.', { ext: '.min.js' }))
        .pipe(gulp.dest('.'));
});

// Preserve Functions
gulp.task('clean:preserve', function () {
    return gulp.src(location.preserve.min, { base: '.', read: false })
        .pipe(debug({ title: 'Clean:' }))
        .pipe(vinylPaths(del));
});
gulp.task('compress:preserve', ['clean:preserve'], function () {
    return gulp.src(_.union(location.preserve.core, nullify(location.preserve.min)), { base: '.' })
        .pipe(debug({ title: 'Compress:' }))
        .pipe(uglify({
            // preserveComments: 'license',
            mangle: false
        }))
        .pipe(dest('.', { ext: '.min.js' }))
        .pipe(gulp.dest('.'));
});

// LESS Functions
gulp.task('clean:less', function () {
    return gulp.src(location.less.compile, { base: '.', read: false })
        .pipe(debug({ title: 'Clean:' }))
        .pipe(vinylPaths(del));
});
gulp.task('compile:less', ['clean:less'], function () {
    return gulp.src(_.union(location.less.core, nullify(location.less.compile)), { base: '.' })
        .pipe(debug({ title: 'LESS:' }))
        .pipe(less({}))
        .pipe(dest('.', { ext: '.css' }))
        .pipe(gulp.dest('.'));
});

// CSS Functions
gulp.task('clean:css', function () {
    return gulp.src(location.css.min, { base: '.', read: false })
        .pipe(debug({ title: 'Clean:' }))
        .pipe(vinylPaths(del));
});
gulp.task('compress:css', ['clean:css'], function () {
    return gulp.src(_.union(location.css.core, nullify(location.css.min)), { base: '.' })
        .pipe(debug({ title: 'CSS:' }))
        .pipe(cleanCSS({
            compatibility: '*'
        }))
        .pipe(dest('.', { ext: '.min.css' }))
        .pipe(gulp.dest('.'));
});

// Template Functions
gulp.task('clean:template', function () {
    return gulp.src(location.template.min, { base: '.', read: false })
        .pipe(debug({ title: 'Clean:' }))
        .pipe(vinylPaths(del));
});
gulp.task('compress:template', ['clean:template'], function () {
    return gulp.src(_.union(location.template.core, nullify(location.template.min)), { base: '.' })
        .pipe(debug({ title: 'Template:' }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyAttributes: true
        }))
        .pipe(dest('.', { ext: '.min.html' }))
        .pipe(gulp.dest('.'));
});
