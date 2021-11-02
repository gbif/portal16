'use strict';
let express = require('express'),
    router = express.Router(),
    auth = require('../../auth/auth.service'),
    authOperations = require('../../auth/gbifAuthRequest'),
    userModel = require('../user/user.model'),
 //   request = require('request-promise'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    log = require('../../../../config/log');
   // credentials = rootRequire('config/credentials').jwt; // we dont need that when we get it from the API
   // let secret = credentials.secret;


module.exports = function(app) {
    app.use('/api', router);
};

router.get('/token', auth.appendUser(), async function(req, res) {
   // return res.json({token: signToken(req.user)}); // works, but let us rather take it from the API
   try {
    const user = userModel.getClientUser(req.user);
    let options = {
        method: 'GET',
        url: apiConfig.user.url + '/' + user.userName + '/token',
        canonicalPath: apiConfig.user.canonical + '/' + user.userName + '/token'
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return res.status(200).json({token: response.body});
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

