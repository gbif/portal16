let Jasmine = require('jasmine'),
    jasmine = new Jasmine(),
    SpecReporter = require('jasmine-spec-reporter'),
    jasmineReporters = require('jasmine-reporters');

jasmine.loadConfigFile('spec/support/jasmine_server.json');

jasmine.onComplete(function(passed) {
    if (passed) {
        console.log('All specs have passed');
        process.exit(0);
    } else {
        console.log('At least one spec has failed');
        process.exit(1);
    }
});

jasmine.addReporter(new SpecReporter());
jasmine.addReporter(new jasmineReporters.JUnitXmlReporter({
    savePath: './reports/',
    filePrefix: 'server'
}));


jasmine.execute();
