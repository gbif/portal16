var Jasmine = require('jasmine');
var jasmine = new Jasmine();

jasmine.loadConfigFile('spec/support/jasmine.json');

jasmine.onComplete(function(passed) {
    if(passed) {
        console.log('All specs have passed');
    }
    else {
        console.log('At least one spec has failed');
    }
});


var jasmineReporters = require('jasmine-reporters');
jasmine.addReporter(new jasmineReporters.TapReporter());
jasmine.addReporter(new jasmineReporters.JUnitXmlReporter( {
    savePath: './reports/'
}));


jasmine.execute();