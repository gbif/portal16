'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    iucn = rootRequire('config/credentials').IUCN,
    botDetector = require('isbot'),
    helper = rootRequire('app/models/util/util');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/redlist/:name', function(req, res) {
    const isBot = botDetector.isbot(req.get("user-agent"));
    if (isBot) return res.status(403).send('Thirdparty endpoints are not available for bots to avoid overloading external services.');

    let name = req.params.name;
    redlistSearch(name, iucn.token).then(function(data) {
        res.json(data);
    }, function(err) {
        res.status(_.get(err, 'errorResponse.statusCode', 500));
        res.json({
            body: _.get(err, 'errorResponse.body', err)
        });
    });
});

function redlistSearch(name, token) {
    'use strict';

    const isBot = isbot(req.get("user-agent"));
    if (isBot) return res.status(403).send('Thirdparty endpoints are not available for bots to avoid overloading external services.');

    let deferred = Q.defer();
    helper.getApiData('http://apiv3.iucnredlist.org/api/v3/species/' + name + '?token=' + token, function(err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        } else {
            deferred.reject(err);
        }
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}
