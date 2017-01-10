let express = require('express'),
    router = express.Router(),
    TheGbifNetwork = rootRequire('app/models/gbifdata/theGbifNetwork/theGbifNetwork');
let DirectoryParticipants = require('../../models/gbifdata/directory/directoryParticipants');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/the-gbif-network', function (req, res, next) {
    // the landing page needs
    // 1) all country objects decorated by their membership status
    // 2) count of data publishers
    // 3) count of countries of authors
    // 4) count of authors
    // 5) count of total literature

    let jsonOutput = false;
    let countries;
    let context = {};

    TheGbifNetwork.get(res)
        /*
        .then(data => {
            context.intro = data;
            return DirectoryParticipants.groupBy();
        })
        */
        .then(data => {
            return TheGbifNetwork.counts('AFRICA');
        })
        .then(data => {
            res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', {
                data: context,
                hasTitle: true
            });
        })
        .catch(err => {
            next(err + 'at theGbifNetwork.ctrl line 22.')
        });
});