'use strict';
var userModel = require('./user.model'),
    credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).directory,
    auth = require('../../auth/auth.service');

module.exports = {
    create: create,
    confirm: confirm,
    me: me
};

/**
 * Creates a new user
 */
function create(req, res) {
    userModel.create(req.body)
        .then(function(){
            res.status(201);
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
            user = sanitizeUser(user);
            res.json({ token, user });
        })
        .catch(handleError(res));
}

/**
 * Gets the user associated with my token
 */
function me(req, res) {
    res.send(sanitizeUser(req.user));
// console.log('USER FROM TOKEN');
// console.log(req.user);
//     userModel.findById(userId)
//         .then(function(user){
//             console.log('GOT USER');
//             console.log(user);
//             res.json({ user });
//         })
//         .catch(handleError(res));
}

function sanitizeUser(user){
    //sanitize user somehow? i guess there isn't anything in the response that cannot goe out at this point. later perhaps some configurations that are for internal only
    return user;
}
function handleError(res, statusCode) {
   statusCode = statusCode || 500;
   return function(err) {
        console.log(err);
       return res.status(res.statusCode || statusCode).json(err.body);
   };
}
//
///**
// * Get list of users
// * restriction: 'admin'
// */
//export function index(req, res) {
//    return User.find({}, '-salt -password').exec()
//        .then(users => {
//            res.status(200).json(users);
//        })
//        .catch(handleError(res));
//}
//
//
///**
// * Get a single user
// */
//export function show(req, res, next) {
//    var userId = req.params.id;
//
//    return User.findById(userId).exec()
//        .then(user => {
//            if(!user) {
//                return res.status(404).end();
//            }
//            res.json(user.profile);
//        })
//        .catch(err => next(err));
//}
//
///**
// * Deletes a user
// * restriction: 'admin'
// */
//export function destroy(req, res) {
//    return User.findByIdAndRemove(req.params.id).exec()
//        .then(function() {
//            res.status(204).end();
//        })
//        .catch(handleError(res));
//}
//
///**
// * Change a users password
// */
//export function changePassword(req, res) {
//    var userId = req.user._id;
//    var oldPass = String(req.body.oldPassword);
//    var newPass = String(req.body.newPassword);
//
//    return User.findById(userId).exec()
//        .then(user => {
//            if(user.authenticate(oldPass)) {
//                user.password = newPass;
//                return user.save()
//                    .then(() => {
//                        res.status(204).end();
//                    })
//                    .catch(validationError(res));
//            } else {
//                return res.status(403).end();
//            }
//        });
//}
//
///**
// * Get my info
// */
//export function me(req, res, next) {
//    var userId = req.user._id;
//
//    return User.findOne({ _id: userId }, '-salt -password').exec()
//        .then(user => { // don't ever give out the password or salt
//            if(!user) {
//                return res.status(401).end();
//            }
//            res.json(user);
//        })
//        .catch(err => next(err));
//}
//
///**
// * Authentication callback
// */
//export function authCallback(req, res) {
//    res.redirect('/');
//}
