'use strict';
let express = require('express'),
    router = express.Router(),
    auth = require('../../auth/auth.service'),
    authOperations = require('../../auth/gbifAuthRequest'),
    userModel = require('../user/user.model'),
 //   request = require('request-promise'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    log = require('../../../../config/log');


module.exports = function(app) {
    app.use('/api', router);
};

router.post('/validation/url', auth.appendUser(), async function(req, res) {
    try {
        const user = userModel.getClientUser(req.user);
        let options = {
            method: 'POST',
            json: false,
            userName: user.userName,
            body: req.body,
            url: apiConfig.validator.url + '/url',
            canonicalPath: apiConfig.validator.canonical + '/url'
        };
        let response = await authOperations.authenticatedRequest(options);
        if (response.statusCode !== 200) {
            throw response;
        }
        return res.status(200).json(response);
        // return response.body;
    } catch (err) {
        let status =
                err.message === 'not found'
                    ? 404
                    : err.statusCode
                    ? err.statusCode
                    : 500;
            if (status !== 404) {
                log.error(err);
            }
            res.sendStatus(status);
    }
});

router.post('/validation', auth.appendUser(), async function(req, res) {
    try {
        const user = userModel.getClientUser(req.user);
        let options = {
            method: 'POST',
            json: false,
            userName: user.userName,
            body: req.body,
            url: apiConfig.validator.url,
            canonicalPath: apiConfig.validator.canonical,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        let response = await authOperations.authenticatedRequest(options);
        if (response.statusCode !== 200) {
            throw response;
        }
        return res.status(200).json(response);
        // return response.body;
    } catch (err) {
        let status =
                err.message === 'not found'
                    ? 404
                    : err.statusCode
                    ? err.statusCode
                    : 500;
            if (status !== 404) {
                log.error(err);
            }
            res.sendStatus(status);
    }
});

