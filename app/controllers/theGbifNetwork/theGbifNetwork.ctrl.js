let express = require('express'),
    router = express.Router(),
    TheGbifNetwork = rootRequire('app/models/gbifdata/theGbifNetwork/theGbifNetwork');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/the-gbif-network', function (req, res, next) {
    let jsonOutput = false;
    let countries;
    let context = {};

    TheGbifNetwork.get(res)
        .then(data => {
            context.intro = data;
            return TheGbifNetwork.getCountries();
        })
        .then(data => {
            context.countries = data;
            res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', {
                data: context,
                hasTitle: true
            });
        })
        .catch(err => {
            next(err + 'at theGbifNetwork.ctrl line 22.')
        });
});