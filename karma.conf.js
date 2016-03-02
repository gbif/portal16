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
        './app/views/shared/layout/main/main.spec.js'
    ],


    // list of files to exclude
    exclude: [
        'src/**/*-e2e-spec.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'junit', 'coverage'],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        './app/views/shared/layout/main/main.spec.js': [ 'browserify' ],
        './app/views/**/test.js': ['coverage'] // source files, that you wanna generate coverage for. do not include tests or libraries. (these files will be instrumented by Istanbul)
    },

    junitReporter: {
        outputDir: 'reports/karma', // results will be saved as $outputDir/$browserName.xml
        suite: '' // suite will become the package name attribute in xml testsuite element
    },

    coverageReporter: {
      // specify a common output directory
      dir: 'coverage',
      reporters: [
        // reporters not supporting the `file` property
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' },
        // reporters supporting the `file` property, use `subdir` to directly
        // output them in the `dir` directory
        { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
        { type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' },
        { type: 'teamcity', subdir: '.', file: 'teamcity.txt' },
        { type: 'text', subdir: '.', file: 'text.txt' },
        { type: 'text-summary' },

        { type: 'clover', subdir: '.', file: 'test.xml' },
      ]
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
    //browsers: ['PhantomJS'],//Chrome PhantomJS
    browsers: ['Chrome'],//Chrome PhantomJS


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
