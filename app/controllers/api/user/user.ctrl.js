"use strict";

//TODO All development of user validation has been cancelled as the api interface hasn't been completed and changed specs
var express = require('express'),
    request = require('request'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    user = require('./user'),
    router = express.Router();
    //verification = rootRequire('app/models/verification/verification'); //this folder needs to be configured to work. Once the authentication is ready we could consider this home made verifaction.

module.exports = function (app) {
    app.use('/api/user', router);
};

router.get('/usersDownloads', function (req, res) {
    res.status(401);//TODO All development of user validation has been cancelled as the api interface hasn't been completed and changed specs
    res.send('NOT IMPLEMENTED');
    //var cookie = req.cookies[apiConfig.cookieNames.userSession];
    //if (cookie) {
    //    res.setHeader('Cache-Control', 'no-cache');
    //
    //    user.getDownloads(cookie, req.query).then(
    //        function (downloads) {
    //            res.json(downloads);
    //        },
    //        function (err) {
    //            console.log(err);
    //            res.status(401);//TODO depdends on the error
    //            res.send('Download failed. please try again later.');
    //        }
    //    );
    //} else {
    //    res.status(401);
    //    res.json('You need to sign in before downloading');
    //}
});

router.get('/download', function (req, res) {
    res.status(401);//TODO All development of user validation has been cancelled as the api interface hasn't been completed and changed specs
    res.send('NOT IMPLEMENTED');
    //var cookie = req.cookies[apiConfig.cookieNames.userSession];
    //if (cookie) {
    //    res.setHeader('Cache-Control', 'no-cache');
    //
    //    user.simpleDownload(cookie, req.query).then(
    //        function (download) {
    //            res.send(download);
    //        },
    //        function (err) {
    //            console.log(err);
    //            res.status(401);//TODO depdends on the error
    //            res.send('Download failed. please try again later.');
    //        }
    //    );
    //} else {
    //    res.status(401);
    //    res.send('You need to sign in before downloading');
    //}
});


//MOCKS TODO DELETE
//var responseDelay = 1000;
//var mockUser = {
//    "userName": "some Nme",
//    "firstName": "John",
//    "lastName": "Doe",
//    "email": "doe@mail.hat",
//    "roles": ["REGISTRY_ADMIN", "ADMIN", "EDITOR", "USER"],
//    "settings": {"country": "DK"},
//    "admin": true
//};


router.post('/create', function (req, res) {
    res.status(401);//TODO All development of user validation has been cancelled as the api interface hasn't been completed and changed specs
    res.send('NOT IMPLEMENTED');
    //var body = req.body;
    //verification.verify(body.challenge.id, body.challenge.answer, function (isHumanEnough) {
    //    if (isHumanEnough) {
    //        //test if valid form input
    //        //if so return created. (backend should validate adn send mail)
    //        console.log('==========', ' SEND USER A MAIL : /user/userid/confirm/secretkey ', '===========');
    //        setTimeout(function () {
    //            res.json({status: 204});
    //        }, responseDelay);
    //    } else {
    //        res.status(401);
    //        setTimeout(function () {
    //            res.send('HUMAN_VERIFICATION_FAILED');
    //        }, responseDelay);
    //    }
    //});
});

//mocks
router.get('/', function (req, res) {
    res.status(401);
    res.send('NOT IMPLEMENTED');
    //var cookie = req.cookies.userSession;
    //if (cookie) {
    //    res.setHeader('Cache-Control', 'no-cache');
    //    setTimeout(function () {
    //        res.json(mockUser);
    //    }, responseDelay);
    //} else {
    //    res.status(401);
    //    setTimeout(function () {
    //        res.json('you are not logged in');
    //    }, responseDelay);
    //}
});

router.get('/login', function (req, res) {
    res.status(401);
    res.send('NOT IMPLEMENTED');
    //var randomNumber = Math.random().toString();
    //randomNumber = randomNumber.substring(2, randomNumber.length);
    //res.cookie('userSession', randomNumber, {maxAge: 3600000});
    //res.setHeader('Cache-Control', 'no-cache');
    //
    //setTimeout(function () {
    //    res.json(mockUser);
    //}, responseDelay);
});

router.get('/reset', function (req, res) {
    res.status(401);
    res.send('NOT IMPLEMENTED');
    //res.status(204);
    //setTimeout(function () {
    //    res.json('we will send you a mail. when clikcing the link you will be logged out on all devices and select a new password');
    //}, responseDelay);
});

router.post('/:userKey/updatePassword', function (req, res) {
    res.status(401);
    res.send('NOT IMPLEMENTED');
    //res.status(204);
    //setTimeout(function () {
    //    res.json('you password has been updated');
    //}, responseDelay);
});

router.get('/logout', function (req, res) {
    res.status(401);
    res.send('NOT IMPLEMENTED');
    //res.status(204);
    //res.cookie('userSession', '', {maxAge: 1});
    //setTimeout(function () {
    //    res.json('you are logged out. cookie is no longer usable');
    //}, responseDelay);
});
