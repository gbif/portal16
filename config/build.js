/**
 *  This file contains the variables used in other gulp files
 *  which defines tasks
 *  By design, we only put there very generic config values
 *  which are used in several places to keep good readability
 *  of the tasks
 */
'use strict';

var path = require('path'),
    wiredep,
    gutil = require('gulp-util'),
    rootPath = path.normalize(__dirname + '/..'),
    env = 'development';

if (gutil.env.prod) {
    env = 'production'
} else if (gutil.env.test) {
    env = 'test';
} else if (gutil.env.tdd) {
    env = 'test-drive-development';
} else {
    env = 'development';
}

function loc(p) {
    return path.join(rootPath, p);
}

/**
 *  The configuration object describing paths for the build and test
 */
var config = {
    buildType: env,
    isProd: env == 'production'
};

/**
 *  The main paths of our project handle these with care
 */
config.paths = {
    root: rootPath,
    src: 'app/views', 
    dist: 'public'
    // e2e: 'e2e'
};

/**
 *  Wiredep is the lib which inject bower dependencies in your project
 *  Mainly used to inject script tags in the index.html but also used
 *  to inject css preprocessor deps and js files in karma
 */
config.wiredep = {
    exclude: [],
    //exclude: [/\/bootstrap\.js$/, /\/bootstrap\.css/],
    directory: './bower_components'
};
wiredep = require('wiredep')(config.wiredep);


var bowerCss = !wiredep.css ? [] : wiredep.css.map(function(e) {
    return path.relative('.', e);
});

var bowerJs = !wiredep.js ? [] : wiredep.js.map(function(e) {
    return path.relative('.', e);
});

config.bower = {
    cssFiles: bowerCss,
    jsFiles: bowerJs
};


/**
 *  Browser sync is used during develpoment
 */
config.browsersync = {
    autoOpenBrowsers: false,
    port: 7000
};


/**
 *  The entry point for building the css from stylus. Bower stylus dependencies will be injected into this file.
 */
config.stylus = {
    root: loc('app/views/shared/style/index.styl')
};


/**
 *  Javascript main files
 *  Only one browserify file is supported so far. Later on we might want to expand it if we need multiple bundles (e.g. large file only used on one page)
 */
config.js = {
    server: {
        paths: [loc('app.js'), loc('config/**/*.js'), '!' + loc('app/views/**/*.js'), '!public/**', '!node_modules/**', '!bower_components/**', '!' + loc('app/**/*.spec.js')],
        testPaths: [loc('app.spec.js'), loc('app/**/*.spec.js'), '!' + loc('app/views/**/*.spec.js'), '!public/**', '!node_modules/**', '!bower_components/**']
    },
    client: {
        paths: [loc('app/views/**/*.js'), '!' + loc('app/views/**/*.spec.js')],
        testPaths: [loc('app/views/**/*.spec.js')]
    },
    gulp: {
        paths: [loc('gulpfile.js'), loc('gulp/tasks/**/*.js')]
    },
    browserify: {
        path: loc('app/views/shared/layout/main/main.js')
    }
};


/**
 * Static assets that are to be copied as is. Fonts, favicons, logos etc.
 */
config.assets = {
    paths: [loc('app/assets/**/*.*')],
    dest: config.paths.dist
};

/**
 * svg icons to be build to an icon font
 */
config.iconfont = {
    paths: [loc('app/assets/icons/used/**/*.svg')],
    dest: loc('app/assets/iconfont'),
    templatePath: [loc('app/assets/icons/fonttemplate.nunjucks.styl')],
    templateDest: path.join(config.paths.src, '/shared/style/fonts/')//path.join(config.paths.dist, 'iconfont')
};


 /**
 *  The main paths of your project handle these with care
 */
config.clean = {
    all: config.paths.dist
};


/**
 *  Common implementation for an error handler of a Gulp plugin
 */
config.errorHandler = function(title) {
    return function(err) {
        gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
};


module.exports = Object.freeze(config);