exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: 'https://demo.gbif-dev.org',
    allScriptsTimeout: 80000,
    specs: [
        //'e2e/omnisearchCmsFeatured.spec.js',
        'e2e/test2.spec.js'
        ]
};