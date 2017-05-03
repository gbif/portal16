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
    router = express.Router();

module.exports = function (app) {
    app.use('/api/user', router);
};

router.post('/', user.create);
//router.post('/login', user.create);
//router.get('/me', user.create);
