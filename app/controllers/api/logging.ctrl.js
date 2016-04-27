var express = require('express'),
    // StackFrame = require('stackframe'),
    // StackTraceGPS = require('stacktrace-gps'),
    sourceMap = require('source-map'),
    fs = require('fs'),
    Path = require('path'),
    log = rootRequire('config/log'),
    router = express.Router();

module.exports = function(app) {
    app.use('/api/log', router);
};

router.post('/error', function(req, res) {
    log.error({body: req.body}, 'Client error');
    res.end('');
});


/**
TODO Needs heave celan up. For now just an idea to log in client include stack trace, line number etc.
And then parse data on the server so we can log original file (not uglified and concat line number).
Should do so for the entire stacktrace and format it nicely for the logger.
Should be moved into a model.
The _findFunctionName is taken from StackTrace-gps.
Unfortunatly the package doesn't seem to work on the server.

Source maps: https://www.npmjs.com/package/source-map#consuming-a-source-map
this might also be interesting https://www.npmjs.com/package/source-map-resolve
stacktrace-js looks noce, but documentation seems rudimentary and there seem to be no reason we should do this on the client.
https://github.com/stacktracejs/stacktrace.js/
*/
//router.post('/error', function(req, res) {
//    log.error({body: req.body}, 'Client error');
//    //res.end('');
//    if (req.body.file.startsWith('http')) {
//        return;
//    }
//    //TODO needs error handling and caching. Be aware that public files can change without server knowing it as it stands
//    // var fileName = Path.resolve('./public/' + req.body.file.substring(req.body.file.lastIndexOf('/')) + '.map');
//    var fileName = Path.resolve('./public/' + req.body.file.replace(/^[^:]*:\/\/[^\/]*\//, '') + '.map');
//
//    fs.readFile(fileName, 'utf8', function(err, data) {
//        // if (err) throw err;// TODO how to handle errors. Wail till logging framework and error handling is in place
//        // console.log(req.body);
//        var rawSourceMap = JSON.parse(data);
//        var smc = new sourceMap.SourceMapConsumer(rawSourceMap);
//
//        var line = parseInt(req.body.line);
//        var col = parseInt(req.body.col);
//        var position = smc.originalPositionFor({
//            line: line,
//            column: col
//        });
//        var orgFile = Path.resolve(position.source.replace(/^\/source\//, ''));
//        var originalFile = fs.readFileSync(orgFile, 'utf8');
//        var funcName = _findFunctionName(originalFile, position.line, position.column);
//        position.functionName = funcName;
//        // console.error('ERROR on client');
//        // console.error(position);
//        log.warn({position: position}, 'Client error - estimated location');
//    });
//});
//
//
//function _findFunctionName(source, lineNumber) { //source, lineNumber, columnNumber
//    // function {name}({args}) m[1]=name m[2]=args
//    var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
//    // {name} = function ({args}) TODO args capture
//    var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
//    // {name} = eval()
//    var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
//    var lines = source.split('\n');
//
//    // Walk backwards in the source lines until we find the line which matches one of the patterns above
//    var code = '',
//        line, maxLines = Math.min(lineNumber, 20),
//        m, commentPos;
//    for (var i = 0; i < maxLines; ++i) {
//        // lineNo is 1-based, source[] is 0-based
//        line = lines[lineNumber - i - 1];
//        commentPos = line.indexOf('//');
//        if (commentPos >= 0) {
//            line = line.substr(0, commentPos);
//        }
//
//        if (line) {
//            code = line + code;
//            m = reFunctionExpression.exec(code);
//            if (m && m[1]) {
//                return m[1];
//            }
//            m = reFunctionDeclaration.exec(code);
//            if (m && m[1]) {
//                return m[1];
//            }
//            m = reFunctionEvaluation.exec(code);
//            if (m && m[1]) {
//                return m[1];
//            }
//        }
//    }
//    return undefined;
//}