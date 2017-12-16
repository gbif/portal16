var bunyan = require('bunyan'),
    fs = require('fs'),
    yargs = require('yargs').argv,
    PrettyStream = require('bunyan-prettystream'),
    bunyantcp = require('bunyan-logstash-tcp'),
    dir = './log',
    loglevel = yargs.loglevel || 'info';

var loglevels = Object.freeze({
    terminal: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4
});

loglevel = typeof loglevels[loglevel] !== 'undefined' ? loglevels[loglevel] : loglevels.info;

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

function reqSerializer(req) {
    return {
        method: req.method,
        url: req.url,
        headers: req.headers
    }
}

var logStreams = [];

if (loglevel <= loglevels.terminal) {
    logStreams.push(
        {
            level: 'debug',
            type: 'raw',
            stream: prettyStdOut // process.stdout
        }
    );
}

if (loglevel <= loglevels.debug) {
    logStreams.push(
        {
            level: 'debug',
            path: './log/debug.log'
        }
    );
}

if (loglevel <= loglevels.info) {
    logStreams.push(
        {
            level: 'info',
            type: 'rotating-file',
            path: './log/info.log',
            period: '1d',   // rotate per n type e.g. 1d = daily logs, https://github.com/trentm/node-bunyan#stream-type-rotating-file
            count: 7        // keep n back copies
        }
    );
}

if (loglevel <= loglevels.warn) {
    logStreams.push(
        {
            level: 'warn',
            type: 'rotating-file',
            path: './log/warn.log',
            period: '1d',
            count: 7
        }
    );
}

if (loglevel <= loglevels.error) {
    logStreams.push(
        {
            level: 'error',
            type: 'rotating-file',
            path: './log/error.log',
            period: '1d',
            count: 7
        }
    );
}

var log = bunyan.createLogger({
    name: 'portal16',
    serializers: {req: reqSerializer},
    streams: logStreams
});

log.on('error', function (err, stream) {
    console.log('Logging failed');
    console.log(err);
    console.trace(err);
});


log.info({state: 'initialising log'}, 'initialising log');

module.exports = log;

