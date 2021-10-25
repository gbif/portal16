/**
 * Create our icon font from svg files.
 * This spares us from creating the icon font manually.
 * The alternative would be to use icomoon or similar and place the font in the assets folder.
 * The css needs to be generated and updated manually to reflect the icons if to be used as classes.
 *
 * TODO:    There is no hashvalue in the font file names.
 *          This should be changed so we do not have to be so carefull with caching
 */

'use strict';

let gulp = require('gulp'),
    config = rootRequire('config/build'),
    browserSync = require('browser-sync'),
    g = require('gulp-load-plugins')();


gulp.task('fonts-reload', function() {
    return buildFont()
        .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
    return buildFont();
});

function buildFont() {
    let runTimestamp = Math.round(Date.now() / 1000);
    return gulp.src(config.iconfont.paths)
        .pipe(g.iconfont({
            fontName: 'gbificons', // required
            prependUnicode: true, // recommended option - adds unicode to the filename
            formats: ['ttf', 'eot', 'woff'], // default, 'woff2' and 'svg' are available
            timestamp: runTimestamp, // recommended to get consistent builds when watching files
            normalize: true,
            fontHeight: 448, // matching IcoMoon's defaults for the font-awesome icons @ "14px grid"
            descent: 64
        }))
        .on('glyphs', function(glyphs, options) {
            g.nunjucksRender.nunjucks.configure(config.iconfont.templatePath, {watch: false});
            return gulp.src(config.iconfont.templatePath)
                .pipe(g.data({
                    glyphs: glyphs,
                    fontName: 'gbificons',
                    fontPath: '/iconfont/',
                    className: 'gb-icon',
                    timestamp: runTimestamp
                }))
                .pipe(g.nunjucksRender())
                .pipe(g.rename(function(path) {
                    path.basename = 'gb_iconfont';
                    path.extname = '.styl';
                }))
                .pipe(gulp.dest(config.iconfont.templateDest));
        })
        // .pipe(g.rename(function (path) {
        //     path.basename += runTimestamp;
        // }))
        .pipe(gulp.dest(config.iconfont.dest));
}
