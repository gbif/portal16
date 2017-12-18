exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: 'https://www.gbif.org/',
    allScriptsTimeout: 120000,
    specs: ['e2e/occurrenceSearch.spec.js'],
    jasmineNodeOpts: {
        defaultTimeoutInterval: 120000
    }
    //specs: ['e2e/occurrenceSearch.spec.js', 'e2e/*.spec.js']
};


// conf.js
// var HTTPSProxyAgent = require('https-proxy-agent');
// var sauceRestAgent = new HTTPSProxyAgent("http://<proxy>:<port>")

//exports.config = {
//    seleniumAddress: `http://gbif:192e1bee-4487-4bc3-8d36-fb7a1a79bf00@ondemand.saucelabs.com:80/wd/hub`,
//    baseUrl: 'https://www.gbif.org/',
//    allScriptsTimeout: 120000,
//    jasmineNodeOpts: {
//        defaultTimeoutInterval: 120000
//    },
//    // sauceAgent: sauceRestAgent,
//
//    // webDriverProxy: 'http://<proxy>:<port>',
//
//    //seleniumAddress: 'http://ondemand.saucelabs.com:80/wd/hub',
//    specs: ['e2e/occurrenceSearch.spec.js'],
//
//    // restartBrowserBetweenTests: true,
//
//    onPrepare: function () {
//        var caps = browser.getCapabilities()
//    },
//
//    multiCapabilities: [
//    //{
//    //    browserName: 'firefox',
//    //    version: 'latest',
//    //    platform: 'OS X 10.10',
//    //    name: "firefox-tests",
//    //    shardTestFiles: true,
//    //    maxInstances: 25
//    //},
//    {
//        browserName: 'chrome',
//        version: '41',
//        platform: 'Windows 7',
//        name: "chrome-tests",
//        shardTestFiles: true,
//        maxInstances: 25
//    }],
//
//    onComplete: function () {
//
//        var printSessionId = function (jobName) {
//            browser.getSession().then(function (session) {
//                console.log('SauceOnDemandSessionID=' + session.getId() + ' job-name=' + jobName);
//            });
//        };
//        printSessionId("Insert Job Name Here");
//    }
//};
