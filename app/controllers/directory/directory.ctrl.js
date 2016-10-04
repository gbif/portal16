var express = require('express'),
    router = express.Router(),
    directory = require('../../models/gbifdata/directory/directory');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/directory/:requestedPath', function (req, res, next) {
    var originalUrl,
        requestedPath,
        jsonOutput = false;

    if (req.params.requestedPath.search(/\.debug/) != -1) {
        requestedPath = req.params.requestedPath.replace('.debug', '');
        originalUrl = req.originalUrl.replace('.debug', '');
        jsonOutput = true;
    }

    directory.getContacts()
        .then(function(data){
            if (data) {
                var pageContent = {
                    title: 'Contact Us',
                    sub: 'Directory of contacts'
                };
                if (jsonOutput == true) {
                    res.json(pageContent);
                }
                else {
                    res.render('pages/about/directory/contactUs', pageContent);
                }
            }
        })
        .catch(function(err){
            next(err);
        });

});
