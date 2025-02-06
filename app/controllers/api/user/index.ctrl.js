'use strict';
let express = require('express'),
    user = require('./user.controller'),
    router = express.Router(),
    auth = require('../../auth/auth.service');

module.exports = function(app) {
    app.use('/api/user', router);
};

router.post('/create', auth.isHumanEnough(), user.create);
router.get('/confirm', user.confirm);
router.get('/me', auth.appendUser(), user.me);
router.put('/update', auth.isAuthenticated(), user.update);
router.post('/resetPassword', user.resetPassword);
router.put('/changeEmail', user.changeEmail);
router.post('/updateForgottenPassword', user.updateForgottenPassword);
router.post('/changePassword', user.changePassword);// the api requires basic auth for this operation. so we need to ignore authentication here and leave that to the identity API
router.get('/logout', user.logout);

router.get('/myDownloads', auth.isAuthenticated(), user.getDownloads);
router.get('/download', auth.isAuthenticated(), user.createSimpleDownload);
router.post('/download/predicate', auth.isAuthenticated(), user.createPredicateDownload);
router.post('/download/sql', auth.isAuthenticated(), user.createSqlDownload);
router.get('/cancelDownload/:key', auth.isAuthenticated(), user.cancelDownload);
