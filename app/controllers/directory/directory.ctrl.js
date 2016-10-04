var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/directory/contact-us', function (req, res) {
    res.render('pages/about/directory/contactUs', {
        title: 'Contact Us'
    });
});
