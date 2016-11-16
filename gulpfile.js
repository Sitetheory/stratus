// Dependencies
var gulp = require('gulp');
var clean = require('gulp-clean');
var dest = require('gulp-dest');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');
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
var coreList = [
    'stratus.js',
    'collections/*.js',
    'directives/*.js',
    'filters/*.js',
    'models/*.js',
    'normalizers/*.js',
    'routers/*.js',
    'controllers/*.js',
    'views/**/*.js'
];
var minList = [
    'stratus.min.js',
    'collections/*.min.js',
    'directives/*.min.js',
    'filters/*.min.js',
    'models/*.min.js',
    'normalizers/*.min.js',
    'routers/*.min.js',
    'controllers/*.min.js',
    'views/**/*.min.js'
];

// Generate Exclusions
var core = _.union(coreList, nullify(minList));
var min = _.union(minList, nullify(coreList));

// Functions
gulp.task('clean', function () {
    return gulp.src(min, { read: false })
        .pipe(clean());
});
gulp.task('jscs', function () {
    return gulp.src(core)
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
});
gulp.task('compress', ['clean'], function () {
    return gulp.src(core, { base: '.' })
        .pipe(uglify({
            preserveComments: 'license'
        }))
        .pipe(dest('.', { ext: '.min.js' }))
        .pipe(gulp.dest('.'));
});
