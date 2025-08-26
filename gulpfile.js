const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');

gulp.task('css:build', function () {
    return gulp.src('./public/include/scss/build.scss') // Path to your SASS files
        .pipe(sourcemaps.init())
        .pipe(sass({
            style: 'compressed',
            precision: 3,
            silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
            quietDeps: true,
            includePaths: ['node_modules/']
        }).on('error', console.error))
        .pipe(rename('compiled.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/include/css')); // Output directory for CSS files
});
gulp.task('css', gulp.series('css:build'));

gulp.task('css:dev', function () {
    gulp.watch('./public/include/scss/**/*.scss', gulp.series('css:build'));
});
