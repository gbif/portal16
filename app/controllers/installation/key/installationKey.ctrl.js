let express = require('express'),
    resourceItem = rootRequire('app/helpers/resourceItem'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/installation/:key.:ext?', function(req, res, next) {
    let key = req.params.key;

    try {
        let a = resourceItem.get(apiConfig.installation.url + key, {
            expand: [
                {
                    urlTemplate: apiConfig.publisher.url + '{$ organizationKey $}',
                    expect: ['organizationKey'],
                    toField: 'endorsingPublisher'
                }
            ]
        });
        a.then(function(installation) {
            renderPage(req, res, next, installation);
        }).catch(function(err) {
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

function renderPage(req, res, next, installation) {
    helper.renderPage(req, res, next, {
        installation: installation,
        _meta: {
            title: installation.record.title,
            description: installation.record.description
        }
    }, 'pages/installation/key/installationKey');
}
