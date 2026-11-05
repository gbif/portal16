'use strict';
let express = require('express'),
    user = require('./user.controller'),
    router = express.Router(),
    auth = require('../../auth/auth.service');

module.exports = function(app) {
    app.use('/api/user', router);
};

router.get('/me', auth.appendUser(), user.me);
router.get('/logout', user.logout);
