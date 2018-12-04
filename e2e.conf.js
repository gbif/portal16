exports.config = {
   seleniumAddress: 'http://localhost:4444/wd/hub',
   baseUrl: 'http://www.gbif-dev.org/',
   allScriptsTimeout: 120000,
//    specs: ['e2e/occurrenceSearch.spec.js'],
   specs: ['e2e/*.spec.js'],
   jasmineNodeOpts: {
       defaultTimeoutInterval: 120000,
       showColors: true,
       isVerbose: true,
       includeStackTrace: true
   }
   //specs: ['e2e/occurrenceSearch.spec.js', 'e2e/*.spec.js']
};
