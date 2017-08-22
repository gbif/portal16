'use strict';
var userModel = require('./user.model'),
    auth = require('../../auth/auth.service');

module.exports = {
    create: create,
    confirm: confirm,
    me: me,
    update: update,
    resetPassword: resetPassword,
    updateForgottenPassword: updateForgottenPassword,
    logout: logout,
    getDownloads: getDownloads,
    createSimpleDownload: createSimpleDownload,
    changePassword: changePassword,
    cancelDownload: cancelDownload,
    isRecentDownload: isRecentDownload
};

/**
 * Creates a new user
 */
function create(req, res) {
    userModel.create(req.body.user)
        .then(function(){
            res.status(201);
            auth.setNoCache(res);
            res.json({type:'CONFIRM_MAIL'});
        })
        .catch(handleError(res, 422));
}

/**
 * Confirm user creation from mail link
 */
function confirm(req, res) {
    let challengeCode = req.query.code,
        userName = req.query.username;

    userModel.confirm(challengeCode, userName)
        .then(function(user){
            let token = auth.signToken(user);
            user = userModel.getClientUser(user);
            auth.setTokenCookie(res, token);
            res.json({ user });
        })
        .catch(handleError(res));
}

/**
 * Gets the user associated with my token
 */
function me(req, res) {
    res.send(userModel.getClientUser(req.user));
}

/**
 * Updates the user after sanitizing body
 */
function update(req, res) {
    let user = userModel.getClientUser(req.body);
    user.userName = req.user.userName;
    userModel.update(req.user.userName, user)
        .then(function(resp){
            res.json(resp);
        })
        .catch(handleError(res, 422));
}

/**
 * ASk for a new password to be sent to the user associated with the username or email
 */
function resetPassword(req, res) {
    userModel.resetPassword(req.body.userNameOrEmail)
        .then(function(){
            res.json({message: 'MAIL_CONFIRMATION'});
        })
        .catch(handleError(res, 422));
}

/**
 * Updates the password given a short lived token sent to the users email
 */
function updateForgottenPassword(req, res) {
    userModel.updateForgottenPassword(req.body)
        .then(function(user){
            let token = auth.signToken(user);
            user = userModel.getClientUser(user);
            auth.setTokenCookie(res, token);
            res.json({ user });
        })
        .catch(handleError(res, 422));
}

/**
 * Change my password using the existing as authentication
 */
function changePassword(req, res) {
    userModel.changePassword(req.get("authorization"), req.body.password)
        .then(function(){
            res.status(204);
            res.json({type:'PASSWORD_CHANGED'});
        })
        .catch(handleError(res, 422));
}

/**
 * Get my downloads
 */
function getDownloads(req, res) {
    userModel.getDownloads(req.user.userName, req.query)
        .then(function(downloads){
            res.setHeader('Cache-Control', 'private, max-age=' + 10); //10 seconds - allow the user to store the list of downloads locally
            res.json(downloads);
        })
        .catch(handleError(res, 422));
}

/**
 * Initiate a simple download based on query parameters
 */
function createSimpleDownload(req, res) {
    userModel.createSimpleDownload(req.user, req.query)
        .then(function(download){
            res.json(download);
        })
        .catch(handleError(res, 422));
}

/**
 * Cancel a download the user has initiated
 */
function cancelDownload(req, res) {
    userModel.cancelDownload(req.user, req.params.key)
        .then(function(){
            res.status(204);
            res.send();
        })
        .catch(handleError(res, 422));
}

/**
 * Check if a given download key is initiated by the user
 */
function isRecentDownload(req, res) {
    userModel.isRecentDownload(req.user, req.params.key)
        .then(function(value){
            res.send(value);
        })
        .catch(handleError(res, 422));
}

/**
 * Logout the user - simply remove the token cookie
 */
function logout(req, res) {
    auth.removeTokenCookie(res);
    res.send('Logged out');
}

function handleError(res, statusCode) {
   statusCode = statusCode || 500;
   return function(err) {
       res.status(err.statusCode || statusCode);
       res.json(err.body);
   };
}