var gulp = require('gulp');
var jscs = require('gulp-jscs');

gulp.task('jscs', function () {
    return gulp.src(['stratus.js', 'collections/*.js', 'models/*.js', 'routers/*.js', 'views/base.js', 'views/plugins/*.js', 'views/widgets/*.js'])
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
});
