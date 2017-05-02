'use strict';

var gulp = require('gulp'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    pref = require('gulp-autoprefixer'),
    csscomb = require('gulp-csscomb'),
    serv = require('browser-sync'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    imagemin = require('gulp-imagemin'),
    watcher = require('gulp-watch'),
    spritesmith = require('gulp.spritesmith'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-csso'),
    htmlmin = require('gulp-htmlmin'),
    jsmin = require('gulp-uglify'),
    rename = require('gulp-rename');


gulp.task('pug', function() {
    gulp.src('./app/templates/pages/*.pug')
        .pipe(plumber({errorHandler: notify.onError(function(err) {
            return {
                title: 'Pug',
                message: err.message
            }
        })}))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./dest/'))
        .pipe(serv.reload({stream: true}));
});

gulp.task('sass', function() {
    gulp.src(['./app/styles/app.scss', './app/styles/ie.scss'])
        .pipe(plumber({errorHandler: notify.onError(function(err) {
            return {
                title: 'Sass',
                message: err.message
            }
        })}))
        .pipe(sass({
            outputStyle: 'nested',
        }))
        .pipe(pref({
            browsers: [
                'Android 2.3',
                'Android >= 4',
                'Chrome >= 20',
                'Firefox >= 24',
                'Explorer >= 8',
                'iOS >= 6',
                'Opera >= 12',
                'Safari >= 6'
            ]
        }))
        .pipe(csscomb())
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(gulp.dest('./dest/css/'))
        .pipe(serv.stream());
});

gulp.task('js', function() {
    gulp.src(['./app/scripts/**/*.js', '!./app/scripts/assets/**/*.js'])
        .pipe(gulp.dest('./dest/js/'))
        .pipe(serv.stream());
});

gulp.task('fonts', function() {
    gulp.src('./app/fonts/*')
        .pipe(gulp.dest('./dest/fonts/'));
});

gulp.task('images', function() {
    gulp.src('./app/images/**/*')
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 7,
            plugins: [imagemin.jpegtran(), imagemin.optipng()]
        }))
        .pipe(gulp.dest('./dest/img/'));
});

gulp.task('sprite', function() {
  var spriteData =
    gulp.src('./app/images/icons/**/*')
      .pipe(sprite({
        imgName: 'sprite.png',
        cssName: 'sprite.css',
      }));

  spriteData.img.pipe(gulp.dest('./dest/img/'));
  spriteData.css.pipe(gulp.dest('./dest/css/'));
});


gulp.task('watcher', function() {

    watcher('./app/templates/**/*', function() {
        gulp.start('pug');
    });

    watcher(['./app/styles/**/*', '!./app/styles/vendors/**/*'], function() {
        gulp.start('sass');
    });

    watcher('./app/fonts/**/*', function() {
        gulp.start('fonts');
    });

    watcher(['./app/images/**/*', '!./app/images/icons/**/*'], function() {
        gulp.start('images');
    });

    watcher('./app/images/icons/**/*', function() {
        gulp.start('sprite');
    });

    watcher('./app/scripts/**/*', function() {
        gulp.start('js');
    });
});

gulp.task('serv', ['watcher'], function() {
    serv.init({
        server: './dest/',
    });
});

// MINIFY

gulp.task('htmlmin', function() {
    gulp.src('./dest/*.html')
        .pipe(htmlmin({
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            quoteCharacter: '"',
            removeComments: true
        }))
        .pipe(gulp.dest('./production/'));
});

gulp.task('cssmin', function() {
    gulp.src('./dest/css/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest('./production/css/'));
});

gulp.task('jsmin', function() {
    gulp.src('./dest/js/*.js')
        .pipe(jsmin())
        .pipe(gulp.dest('./production/js/'));
});