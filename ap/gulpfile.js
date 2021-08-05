const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');

gulp.task('clean', () => {
    return del(['./public/js/**',
            './projects/HelpDesk/public/javascripts/**',
            './projects/TestProject/public/javascripts/**',
            '!.gitkeep']);
});

gulp.task('babel-main', () => {
    return gulp.src('./public/js-source/**')
            .pipe(babel())
            .pipe(gulp.dest('./public/js/'));
});
gulp.task('babel-HelpDesk', () => {
    return gulp.src('./projects/HelpDesk/public/javascripts-source/**')
            .pipe(babel())
            .pipe(gulp.dest('./projects/HelpDesk/public/javascripts/'));
});
gulp.task('babel-TestProject', () => {
    return gulp.src('./projects/TestProject/public/javascripts-source/**')
            .pipe(babel())
            .pipe(gulp.dest('./projects/TestProject/public/javascripts/'));
});

gulp.task('copy-main', () => {
    return gulp.src('./public/js-source/**').pipe(gulp.dest('./public/js/'));
});
gulp.task('copy-HelpDesk', () => {
    return gulp.src('./projects/HelpDesk/public/javascripts-source/**').pipe(gulp.dest('./projects/HelpDesk/public/javascripts/'));
});
gulp.task('copy-TestProject', () => {
    return gulp.src('./projects/TestProject/public/javascripts-source/**').pipe(gulp.dest('./projects/TestProject/public/javascripts/'));
});

// main
gulp.task('copy', gulp.series('copy-main', 'copy-HelpDesk', 'copy-TestProject'));

gulp.task('babel', gulp.series('babel-main', 'babel-HelpDesk', 'babel-TestProject'));

gulp.task('cleanAndCopy', gulp.series('clean', 'copy'));

gulp.task('build', gulp.series('clean', 'babel'));

