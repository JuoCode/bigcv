var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var less = require('gulp-less');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var coffee = require('gulp-coffee');
var yaml2json = require('yaml-to-json');
var webserver = require('gulp-webserver');
var handlebars = require('gulp-compile-handlebars');

var config = {};

gulp.task('clean', function() {
  return gulp.src('dist', {
      read: false
    })
    .pipe(clean());
});

gulp.task('setup', function() {
  config = {
    dist: "./dist",
    page: "./index.hbs",
    style: "./style.less",
    script: "./main.coffee"
  };

  var yml = fs.readFileSync('resume.example.yml');
  var meta = yaml2json(yml);
  meta.themeInfo = require("./theme.json");
  config.meta = meta;
});

gulp.task('less', function() {
  gulp.src(config.style)
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(gulp.dest(config.dist));
});

gulp.task('coffee', function() {
  gulp.src(config.script)
    .pipe(coffee({
      bare: true
    }).on('error', gutil.log))
    .pipe(gulp.dest(config.dist));
});

gulp.task('handlebars', function() {
  var resumeData = config.meta;
  var options = {};

  return gulp.src(config.page)
    .pipe(handlebars(resumeData, options))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(config.dist));
});

gulp.task('server', function() {
  gulp.src(config.dist)
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

gulp.task('default', ['clean'], function() {
  gulp.start('setup', 'less', 'coffee', 'handlebars');
});
