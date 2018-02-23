/* eslint-disable no-console */
let bunyan = require('bunyan');
let bunyanLogstash = require('bunyan-logstash');
let env = process.env.NODE_ENV || 'local';
let fs = require('fs');
let yargs = require('yargs').argv;
let PrettyStream = require('bunyan-prettystream');
let dir = './log';
let host = 'private-logstash.gbif.org';
let port = 1065;
let loglevel = yargs.loglevel || 'info';
let loglevels = Object.freeze({
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

let prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

let logStreams = [];

if (loglevels[loglevel] > loglevels.terminal) {
    logStreams.push(
        {
            level: loglevel,
            type: 'rotating-file',
            path: './log/portal.log',
            period: '1d', // rotate per n type e.g. 1d = daily logs, https://github.com/trentm/node-bunyan#stream-type-rotating-file
            count: 7 // keep n back copies
        }
    );

    // always log to console as well - this is done because only console logs currently goes into Kibana
    logStreams.push(
        {
            type: 'raw',
            stream: bunyanLogstash.createStream({
                host: host,
                port: port
            })
        }
    );
}

if (loglevels[loglevel] == loglevels.terminal) {
    logStreams.push(
        {
            level: 'warn',
            type: 'raw',
            stream: prettyStdOut // process.stdout
        }
    );
}


let log = bunyan.createLogger({
    name: 'portal',
    serializers: bunyan.stdSerializers,
    streams: logStreams
});

log.on('error', function(err) {
    console.log('Logging failed');
    console.trace(err);
});

function DecoratedLog(options) {
    this.log = options.log.child({
        'environment': env,
        'class': 'web',
        'service': 'portal'
    });
}

let portalLog = new DecoratedLog({log: log});
portalLog.log.info({message: 'initialising log'}, 'initialising log');

module.exports = portalLog.log;
