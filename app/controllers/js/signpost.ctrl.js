'use strict';
let express = require('express'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/js/base/shared/signpost.js', function(req, res) {
    res.set('Content-Type', 'application/javascript');
    res.render('shared/signpost', {});
});

