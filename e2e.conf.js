exports.config = {
   seleniumAddress: 'http://localhost:4444/wd/hub',
   baseUrl: 'http://localhost:3000/',
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
