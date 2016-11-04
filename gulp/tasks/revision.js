'use strict';

var gulp = require('gulp'),
    config = rootRequire('config/build'),
    fs = require('fs');

/**
 * Write unique build revision number to a json file
 */
gulp.task('revision', [], function () {
    var revision = (Math.random().toString(36)+'0000000000').slice(2, 8+2);
    fs.writeFileSync(config.rev.revisionFile, '{"revision":"'+revision+'"}');
});
