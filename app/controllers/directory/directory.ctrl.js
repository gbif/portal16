var express = require('express'),
    router = express.Router(),
    Directory = require('../../models/gbifdata/directory/directory');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/directory/:requestedPath', function (req, res, next) {
    var jsonOutput = false;

    if (req.params.requestedPath.search(/\.debug/) != -1) {
        // requestedPath = req.params.requestedPath.replace('.debug', '');
        // originalUrl = req.originalUrl.replace('.debug', '');
        jsonOutput = true;
    }

    Directory.getContacts(res.__)
        .then(function(data){
            if (data) {
                // insert countryName if missing
                data.peopleByParticipants.forEach(function(p){
                    p.people.forEach(function(person){
                        if (!person.hasOwnProperty('countryName')) person.countryName = res.__('country.' + person.participantCountry);
                    });
                });

                var pageContent = {
                    category: 'Contact Us',
                    title: 'Directory of contacts',
                    contacts: data
                };

                if (jsonOutput == true) {
                    res.json(pageContent);
                }
                else {
                    res.render('pages/about/directory/directoryOfContacts', pageContent);
                }
            }
        })
        .catch(function(err){
            next(err);
        });
});
