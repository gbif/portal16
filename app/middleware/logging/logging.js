/**
 Express middleware
 Log incoming requests and add the logger to the res
 */

'use strict';

let bunyanMiddleware = require('bunyan-middleware'),
    log = require('../../../config/log'),
    excludeList = ['/api/resource/search?contentType=dataUse&cachebust', '/api/health/portal'];

function use(app) {
    app.use(bunyanMiddleware(
        {
            headerName: 'X-Request-Id',
            propertyName: 'reqId',
            logName: 'req_id',
            requestStart: true,
            excludeHeaders: ['Authorization', 'cookie'],
            additionalRequestFinishData: function(req, res) {
                return {req_url: req.originalUrl};
            },
            logger: log,
            level: 'info',
            filter: function(req, res) {
                for (let i = 0; i < excludeList.length; i++) {
                    if (req.originalUrl.startsWith(excludeList[i])) {
                        return true;
                    }
                }
                return false;
            }
        }
    ));
}

module.exports = {
    use: use
};

