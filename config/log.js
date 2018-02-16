/* eslint-disable no-console */
var bunyan = require('bunyan'),
    fs = require('fs'),
    yargs = require('yargs').argv,
    PrettyStream = require('bunyan-prettystream'),
    dir = './log',
    loglevel = yargs.loglevel || 'info';

var loglevels = Object.freeze({
    terminal: 0,
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5,
    fatal: 6
});

loglevel = typeof loglevels[loglevel] !== 'undefined' ? loglevel : 'info';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

var logStreams = [];

if (loglevels[loglevel] > loglevels.terminal) {
    logStreams.push(
        {
            level: loglevel,
            type: 'rotating-file',
            path: './log/portal.log',
            period: '1d',   // rotate per n type e.g. 1d = daily logs, https://github.com/trentm/node-bunyan#stream-type-rotating-file
            count: 7        // keep n back copies
        }
    );

    //always log to console as well - this is done because only console logs currently goes into Kibana
    logStreams.push(
        {
            level: loglevel,
            stream: process.stdout
        }
    );
}

if (loglevels[loglevel] == loglevels.terminal) {
    logStreams.push(
        {
            level: 'debug',
            type: 'raw',
            stream: prettyStdOut // process.stdout
        }
    );
}


var log = bunyan.createLogger({
    name: 'portal16',
    serializers: bunyan.stdSerializers,
    streams: logStreams
});

log.on('error', function (err) {
    console.log('Logging failed');
    console.log(err);
    console.trace(err);
});


log.info({state: 'initialising log'}, 'initialising log');

module.exports = log;
