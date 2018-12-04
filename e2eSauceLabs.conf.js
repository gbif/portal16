let config = require('/etc/portal16/credentials');

exports.config = {
  seleniumAddress: `http://${config.sauceLabs.userName}:${config.sauceLabs.secret}@ondemand.saucelabs.com:80/wd/hub`,
  baseUrl: 'https://www.gbif.org/',
  allScriptsTimeout: 120000,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120000,
    showColors: true,
    isVerbose: true,
    includeStackTrace: true
  },
  // sauceAgent: sauceRestAgent,

  // webDriverProxy: 'http://<proxy>:<port>',

  // seleniumAddress: 'http://ondemand.saucelabs.com:80/wd/hub',
  specs: ['e2e/occurrenceSearch.spec.js'],

  // restartBrowserBetweenTests: true,

  onPrepare: function() {
    let caps = browser.getCapabilities();
  },

  multiCapabilities: [
    // {
    //    browserName: 'firefox',
    //    version: 'latest',
    //    platform: 'OS X 10.10',
    //    name: "firefox-tests",
    //    shardTestFiles: true,
    //    maxInstances: 25
    // },
    {
      browserName: 'chrome',
      version: '41',
      platform: 'Windows 7',
      name: "chrome-tests",
      shardTestFiles: true,
      maxInstances: 25
    }],

  onComplete: function() {
    let printSessionId = function(jobName) {
      browser.getSession().then(function(session) {
        console.log('SauceOnDemandSessionID=' + session.getId() + ' job-name=' + jobName);
      });
    };
    printSessionId('Insert Job Name Here');
  }
};
