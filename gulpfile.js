// Dependencies
var gulp = require('gulp');
var debug = require('gulp-debug');
var dest = require('gulp-dest');
var jscs = require('gulp-jscs');
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
var coreList = [

    // Stratus
    'stratus.js',
    'normalizers/*.js',

    // Backbone
    'models/*.js',
    'collections/*.js',
    'routers/*.js',
    'views/**/*.js',

    // Angular
    'controllers/*.js',
    'directives/*.js',
    'filters/*.js',
    'services/*.js'
];
var minList = [

    // Stratus
    'stratus.min.js',
    'normalizers/*.min.js',

    // Backbone
    'models/*.min.js',
    'collections/*.min.js',
    'routers/*.min.js',
    'views/**/*.min.js',

    // Angular
    'controllers/*.min.js',
    'directives/*.min.js',
    'filters/*.min.js',
    'services/*.min.js'
];

// Generate Exclusions
var core = _.union(coreList, nullify(minList));
var min = _.union(minList, nullify(coreList));

// Functions
gulp.task('clean', function () {
    return gulp.src(min, { base: '.', read: false })
        .pipe(debug({ title: 'Clean:' }))
        .pipe(vinylPaths(del));
});
gulp.task('jscs', function () {
    return gulp.src(core)
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
});
gulp.task('compress', ['clean'], function () {
    return gulp.src(core, { base: '.' })
        .pipe(debug({ title: 'Compress:' }))
        .pipe(uglify({
            preserveComments: 'license'
        }))
        .pipe(dest('.', { ext: '.min.js' }))
        .pipe(gulp.dest('.'));
});
