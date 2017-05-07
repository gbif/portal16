//'use strict';
//
//import {Router} from 'express';
//import * as controller from './user.controller';
//import * as auth from '../../auth/auth.service';
//
//var router = new Router();
//
//router.get('/', auth.hasRole('admin'), controller.index);
//router.delete('/:id', auth.hasRole('admin'), controller.destroy);
//router.get('/me', auth.isAuthenticated(), controller.me);
//router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
//router.get('/:id', auth.isAuthenticated(), controller.show);
//router.post('/', controller.create);
//
//module.exports = router;

"use strict";
var express = require('express'),
    user = require('./user.controller'),
    router = express.Router(),
    auth = require('../../auth/auth.service');

module.exports = function (app) {
    app.use('/api/user', router);
};

router.post('/create', auth.isHumanEnough(), user.create);
router.get('/confirm', user.confirm);
router.get('/me', auth.isAuthenticated(), user.me);
router.put('/update', auth.isAuthenticated(), user.update);
router.post('/resetPassword', user.resetPassword);
router.post('/updateForgottenPassword', user.updateForgottenPassword);
router.post('/changePassword', user.changePassword);//the api requires basic auth for this operation. so we need to ignore authentication here and leave that to the identity API
router.get('/logout', user.logout);


router.get('/myDownloads', auth.isAuthenticated(), user.getDownloads);
