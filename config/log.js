var bunyan = require('bunyan'),
    fs = require('fs'),
    PrettyStream = require('bunyan-prettystream'),
    dir = './log';

if (!fs.existsSync(dir)){
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

var log = bunyan.createLogger({
    name: 'Portal',
    serializers: {req: reqSerializer},
    streams: [
        {
            level: 'debug',
            type: 'raw',
            stream: prettyStdOut//process.stdout
        },
        {
            //type: 'rotating-file',
            path: './log/portal_info.log',
            //period: '1h',   // rotate per n type e.g. 1d = daily logs, https://github.com/trentm/node-bunyan#stream-type-rotating-file
            //count: 7,        // keep n back copies
            level: 'info'
        }
        //,{
        //    type: 'rotating-file',
        //    path: './log/portal_error.log',
        //    period: '3h',
        //    count: 1,
        //    level: 'error'
        //}
    ]
});

//log.warn({randomAtt: 'is test', nested: [{hej: 5, med: 3, dig: 1}]}, 'My messagr grom the home controller');

module.exports = log;

