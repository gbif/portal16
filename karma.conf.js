// Karma configuration
// Generated on Thu May 14 2015 21:33:59 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'browserify'],

    browserify: {
      debug: true
    },

    // list of files / patterns to load in the browser
    files: [
        './app/views/**/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
        'src/**/*-e2e-spec.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'junit', 'notify'],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        './app/views/**/*.spec.js': [ 'browserify' ]
    },

    junitReporter: {
        outputDir: 'reports/karma', // results will be saved as $outputDir/$browserName.xml
        suite: '' // suite will become the package name attribute in xml testsuite element
    },

    notifyReporter: {
      reportEachFailure: false, // Default: false, Will notify on every failed sepc
      reportSuccess: false // Default: true, Will notify when a suite was successful
    },


    // web server port
    port: 9877,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],//Chrome PhantomJS
    //browsers: ['Chrome'],//Chrome PhantomJS


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
