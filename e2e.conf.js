exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: 'http://demo.gbif-dev.org',
    allScriptsTimeout: 80000,
    specs: ['e2e/*.spec.js']
};
