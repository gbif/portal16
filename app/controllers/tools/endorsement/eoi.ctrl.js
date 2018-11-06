'use strict';
let express = require('express'),
    eoi = require('./eoi.controller'),
    page = require('./page.controller'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

// rendered pages
router.get('/become-a-publisher', page.eoiPage);

// api endpoints
router.post('/api/eoi/create', eoi.create);
