'use strict';

let gulp = require('gulp');
let path = require('path');
let config = rootRequire('config/build');
let browserSync = require('browser-sync');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');
let browserify = require('browserify');
let rename = require('gulp-rename');
let gulpif = require('gulp-if');
let g = require('gulp-load-plugins')();

gulp.task('scripts-reload', function() {
    return buildScripts()
        .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
    return buildScripts();
});

/*
gulp.task('vendor-scripts', function() {
    let vendor = 'js/vendor';
    return gulp.src(config.bower.jsFiles, {
            base: './'
        })
        .pipe(g.plumber())
        .pipe(gulpif(!config.isProd, g.sourcemaps.init()))
        .pipe(g.concat('vendor.js'))
        .pipe(g.if(config.isProd, g.uglify(), g.util.noop()))
        .pipe(gulpif(!config.isProd, g.sourcemaps.write('./')))
        .pipe(gulp.dest(path.join(config.paths.dist, vendor)));
}); */

function buildScripts() {
    return build(config.js.browserify.main.path, config.js.browserify.main.dest);
}

// update byild so that all files names entry will be build automatically.
gulp.task('dataRepo', function() {
    return build('./app/views/pages/tools/dataRepository/dataRepository.entry.js', 'pages/dataRepository.js');
});
gulp.task('speciesLookup', function() {
    return build('./app/views/pages/tools/speciesLookup/speciesLookup.entry.js', 'pages/speciesLookup.js');
});

gulp.task('nameParser', function() {
    return build('./app/views/pages/tools/nameParser/nameParser.entry.js', 'pages/nameParser.js');
});

gulp.task('sequenceMatching', function() {
    return build('./app/views/pages/tools/sequenceMatching/sequenceMatching.entry.js', 'pages/sequenceMatching.js');
});
// gulp.task('dataValidator', function () {
//     return build('./app/views/pages/tools/dataValidator/dataValidator.entry.js', 'pages/dataValidator.js');
// });
gulp.task('observationTrends', function() {
    return build('./app/views/pages/tools/observationTrends/observationTrends.entry.js', 'pages/observationTrends.js');
});
gulp.task('ipt', function() {
    return build('./app/views/pages/custom/ipt/ipt.entry.js', 'pages/ipt.js');
});
gulp.task('home', function() {
    return build('./app/views/pages/home/home.entry.js', 'pages/home.js');
});

const vendors = ['angular', 'lodash', 'openlayers', 'angular-cookies', 'ngstorage', 'angular-messages', 'angular-ui-router', 'angular-translate', 'angular-hotkeys', 'angular-resource', 'angular-aria', 'angular-ui-bootstrap', 'angular-sanitize', 'nouislider-angular', 'angular-animate'];
const noParseVendors = ['angular',
    'lodash',
    'angular-ui-router',
    'angular-translate',
    'angular-leaflet-directive',
    'angular-hotkeys',
    'angular-resource',
    'angular-aria',
    'angular-ui-bootstrap',
    'ng-infinite-scroll',
    'angular-scroll',
    'angular-sanitize',
    'nouislider-angular',
    'chartist',
    'angular-chartist.js',
    'chartist-plugin-axistitle',
    'ngstorage',
    'angular-cookies',
    'angular-messages',
    'angular-toastr',
    'angular-animate',
    'angular-material',
    'ng-file-upload',
    'chartjs',
    'angular-chart.js',
    'checklist-model',
    'angular-svg-round-progressbar'];

let watchify = require('watchify');
let assign = require('lodash').assign;

function build(entry, name) {
    let dest = 'js/base';
    let browserifyOptions = {
        entries: entry,
        debug: true,
        noParse: noParseVendors
    };
    let opts = assign({}, watchify.args, browserifyOptions);

    // if not a prod build then use watchify to watch the bundle files
    let b;
    if (config.isProd) {
        b = browserify(opts);
    } else {
        b = watchify(browserify(opts));
    }

    return b
        .external(vendors)
        .bundle()
        .on('error', config.errorHandler('Browserify'))
        .pipe(source(name))
        .pipe(buffer())
        .pipe(gulpif(!config.isProd, g.sourcemaps.init({
            loadMaps: true
        })))
        // Add transformation tasks to the pipeline here.
        .pipe(g.ngAnnotate()) // To not break angular injection when minified
        .pipe(g.if(config.isProd, g.uglify(), g.util.noop()))
        .on('error', config.errorHandler('uglify'))
        .pipe(gulpif(!config.isProd, g.sourcemaps.write('./')))
        .pipe(gulp.dest(path.join(config.paths.dist, dest)))
        .pipe(rename(function(path) {
            path.dirname = '/' + dest + (path.dirname == '.' ? '' : '/' + path.dirname);
        }));
}

gulp.task('build:vendor', () => {
    const b = browserify({
        debug: true,
        noParse: vendors
    });

    // require all libs specified in vendors array
    vendors.forEach((lib) => {
        b.require(lib);
    });

    b.bundle()
        .pipe(source('vendor.js'))
        .pipe(buffer())
        .pipe(g.sourcemaps.init({loadMaps: true}))
        .pipe(g.if(config.isProd, g.uglify(), g.util.noop()))
        .on('error', config.errorHandler('uglify'))
        .pipe(g.sourcemaps.write('./maps'))
        .pipe(gulp.dest('./public/js/base/'))
    ;
});
