var gulp   = require( 'gulp' );
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var karma = require( 'gulp-karma' );

var libFiles  = './lib/*.js';
var testFiles = [ libFiles , './tests/*.js' ];

//JShint
gulp.task( 'lint' , function( ) {
    return  gulp.src( libFiles )
                .pipe( jshint( ) )
                .pipe( jshint.reporter( 'default' ) )
                .pipe( jshint.reporter('fail') );
});


//default
gulp.task( 'test' , function( ) {
    return  gulp.src( testFiles )
                .pipe( karma({
                    configFile : 'karma.conf.js' ,
                    action     : 'run'
                }) )
                .on( 'error' , function( err ) {
                  throw err;
                });
});

gulp.task( 'default' , [ 'lint' , 'test' ] , function( ) {
    gulp.src( libFiles )
        .pipe( concat( 'Reanime.js' ) )
        .pipe( gulp.dest( './dist/' ) )
        .pipe( uglify( ) )
        .pipe( rename({ suffix : '.min' }) )
        .pipe( gulp.dest( './dist/' ) );
});


//WATCH
gulp.task( 'karma' , function( ) {
    gulp.src( testFiles )
        .pipe( karma({
            configFile : 'karma.conf.js' ,
            action     : 'watch'
        }) );
});