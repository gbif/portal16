/**
 *   Rather than manage one giant configuration file responsible
 *   for creating multiple tasks, each task has been broken out into
 *   its own file in gulp/tasks. Any files in that directory get
 *   automatically required below.
 *   To add a new task, simply add a new task file in the tasks directory.
 */
'use strict';

var gulp = require('gulp'),
    path = require('path'),
    config = require('./config/build'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    requireDir = require('require-dir');

global.rootRequire = function(name) {
    return require(__dirname + '/' + name);
};

/**
 *  Require all tasks in gulp/tasks, including sub folders
 */
requireDir('./gulp/tasks', {
    recurse: true
});

/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
// gulp.task('default', ['clean'], function () {
//     gulp.start('build');
// });

gulp.task('prod', function(callback) {
    runSequence(
        ['clean-all'], ['env-constants'], ['stylus', 'vendor-styles', 'scripts', 'vendor-scripts', 'assets', 'templates'], ['ieStyle'],
        callback);
});

gulp.task('test-drive-development', [], function(callback){
    runSequence(
        ['test-server-continuously', 'test-client-continuously', 'dev'],
        callback);
});//TODO add development task

gulp.task('test', ['test-client', 'test-server']);

gulp.task('watch', ['browser-sync'], function() {
    gulp.watch([
        path.join(config.paths.src, '/**/*.styl'),
        path.join(config.paths.src, '/**/*.less'),
        path.join(config.paths.src, '/**/*.css')
    ], ['styles-reload']);

    // gulp.watch([config.js.server.paths], ['server-lint']); //should not be necessary. the files are linted at start up
    gulp.watch([config.js.client.watch], ['scripts-reload', 'client-lint']);

    gulp.watch(['app/views/**/*.html'], ['templates']).on('change', browserSync.reload);

    browserSync.watch('app/views/**/*.nunjucks').on('change', browserSync.reload);
});

gulp.task('dev', [], function(callback) {
    runSequence(
        ['clean-all'], ['env-constants'], ['stylus-reload', 'vendor-styles', 'scripts-reload', 'vendor-scripts', 'assets', 'templates'],
        ['ieStyle'],
        ['watch'],
        callback);
});

gulp.task('default', [config.buildType]);