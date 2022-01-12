/**
 * Compile all stylus files in src.
 * Files are automatically added so no need to import them explictly in the stylus files
 *
 */

'use strict';

let gulp = require('gulp'),
    path = require('path'),
    config = rootRequire('config/build'),
    gulpif = require('gulp-if'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync'),
    lost = require('lost'),
    axis = require('axis'),
    runSequence = require('run-sequence'),
    g = require('gulp-load-plugins')();


gulp.task('bootstrap-style', function() {
  return gulp.src(config.bootstrap.root)
      .pipe(g.less())
      .pipe(gulp.dest(config.bootstrap.dest));
});

gulp.task('stylus-reload', gulp.series('bootstrap-style', function() {
    return buildStylus()
        .pipe(browserSync.stream());
}));

gulp.task('stylus', gulp.series('bootstrap-style', function() {
    return buildStylus();
}));

gulp.task('vendor-styles', function() {
    let vendor = 'css/vendor';
    return gulp.src(config.vendorCss, {
        base: vendor
    })
        .pipe(g.plumber())
        .pipe(g.cleanCss({
            debug: true,
            sourceMap: false,
            sourceMapInlineSources: false
        }))
        .pipe(gulpif(!config.isProd, g.sourcemaps.init()))
        .pipe(g.concat('vendor.css'))
        .pipe(gulpif(!config.isProd, g.sourcemaps.write('./')))
        .pipe(gulp.dest(path.join(config.paths.dist, vendor), {
        }));
});


function buildStylus() {
    /**
     *  automatically import all stylus files in the main index.styl file
     *  Order is not guaranteed. This should be okay as there shouldn't be overlap between files.
     *  In case there is a need to have something imported before something else there is the option to name myname.first.styl
     */
    let injectFiles = gulp.src([
        path.join(config.paths.src, '/**/*.first.styl'),
        path.join(config.paths.src, '/**/*.second.styl'),
        path.join(config.paths.src, '/**/*.third.styl'),
        path.join(config.paths.src, '/**/*.styl'),
        path.join('!' + config.paths.src, '/**/*.entry.styl'),
        path.join('!' + config.paths.src, '/**/_*.styl')
    ], {
        read: false
    });

    let injectOptions = {
        transform: function(filePath) {
            filePath = filePath.replace(config.paths.src + '/', '');
            return '@import "' + path.join('../..', filePath) + '";';
        },
        starttag: '// injector',
        endtag: '// endinjector',
        addRootSlash: false
    };

    let processors = [
        lost()
    ];

    let dest = 'css/base';
    return gulp.src([
            path.join(config.paths.src, '/**/*.entry.styl')
        ])
        // .pipe(g.plumber())
        .pipe(g.inject(injectFiles, injectOptions))
        .pipe(gulpif(!config.isProd, g.sourcemaps.init()))
        .pipe(g.stylus({
            use: [axis()]
        })).on('error', config.errorHandler('Stylus'))
        .pipe(g.autoprefixer()).on('error', config.errorHandler('Autoprefixer'))
        .pipe(g.postcss(processors))
        .pipe(g.cleanCss())
        .pipe(rename(function(path) {
            path.basename = path.basename.replace('.entry', '');
        }))
        .pipe(gulpif(!config.isProd, g.sourcemaps.write('./')))
        .pipe(gulp.dest(path.join(config.paths.dist, dest)));
}

gulp.task('ieStyle', function() {
    let ieProcessors = [
        require('postcss-unmq')({
            type: 'screen',
            width: 300,
            height: 300,
            resolution: '1dppx'
        })
    ];

    return gulp.src(path.join(config.paths.dist, 'css/base/*.css'))
        .pipe(g.postcss(ieProcessors))
        .pipe(gulp.dest(path.join(config.paths.dist, 'css/base/ie')));
});