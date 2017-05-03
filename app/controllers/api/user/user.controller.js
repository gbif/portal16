'use strict';
var userModel = require('./user.model'),
    credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).directory,
    secret = credentials.secret,
    jwt = require('jsonwebtoken');

module.exports = {
    create: create
};
/**
 * Creates a new user
 */
function create(req, res) {
    console.log('body');
    console.log(req.body);
    userModel.create(req.body)
        .then(function(user){
            console.log(user);
            var token = jwt.sign({ _id: 5 }, secret, {
                expiresIn: 60 * 60 * 5
            });
            res.json({ token });
        })
        .catch(function(err){
            res.status(500);
            res.send('failed');
            console.log(err);
        });


    //var newUser = new User(req.body);
    //newUser.provider = 'local';
    //newUser.role = 'user';
    //newUser.save()
    //    .then(function(user) {
    //        var token = jwt.sign({ _id: user._id }, config.secrets.session, {
    //            expiresIn: 60 * 60 * 5
    //        });
    //        res.json({ token });
    //    })
    //    .catch(validationError(res));
}

//function validationError(res, statusCode) {
//    statusCode = statusCode || 422;
//    return function(err) {
//        return res.status(statusCode).json(err);
//    };
//}
//
//function handleError(res, statusCode) {
//    statusCode = statusCode || 500;
//    return function(err) {
//        return res.status(statusCode).send(err);
//    };
//}
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
