'use strict';
let express = require('express'),
    router = express.Router(),
    resource = rootRequire('app/controllers/resource/key/resourceKey'),
    helper = rootRequire('app/models/util/util');

module.exports = function(app) {
    app.use('/', router);
};

router.get('/ipt.:ext?', function(req, res, next) {
    let iptPage = resource.getByAlias('/ipt', 2, false, res.locals.gb.locales.current);
    iptPage.then(
        function(data) {
            helper.renderPage(req, res, next, {
                prose: data,
                _meta: {
                    title: 'IPT',
                    description: req.__('tools.ipt.description')
                }
            }, 'pages/custom/ipt/ipt');
        },
        function(err) {
            next(err);
        }
    );
});
