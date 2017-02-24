var express = require('express'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router();

//TODO All development of user validation has been cancelled as the api interface hasn't been completed and changed specs
module.exports = function (app) {
    app.use('/user', router);
};

router.get('/', function (req, res) {
    res.redirect(307, './user/profile');
});

router.get('/profile', function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    helper.renderPage(req, res, next, {}, 'pages/user/user');
});
router.get('/download', function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    helper.renderPage(req, res, next, {}, 'pages/user/user');
});

router.get('/:userKey/confirm/:challenge', function (req, res, next) {
    next();//TODO All development of user validation has been cancelled as the api interface hasn't been completed and changed specs
    ////ask user service if this user and challenge is valid. If so then sets the token returned and shows success page. If no, then show failed validation page.
    //var randomNumber = Math.random().toString();
    //randomNumber = randomNumber.substring(2, randomNumber.length);
    //res.cookie('userSession', randomNumber, {maxAge: 900000});
    //res.setHeader('Cache-Control', 'no-cache');
    //helper.renderPage(req, res, next, {}, 'pages/user/confirmUser/confirmUser');
});

router.get('/:userKey/update-password/:challenge', function (req, res, next) {
    next();//TODO All development of user validation has been cancelled as the api interface hasn't been completed and changed specs
    //ask if valid reset token. if so show form that posts to update password service with token and new password. if not valid then inform user.
    //let context = {
    //    token: req.params.challenge,
    //    userKey: req.params.userKey
    //};
    //helper.renderPage(req, res, next, context, 'pages/user/updatePassword/updatePassword');
});
