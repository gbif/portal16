let express = require('express'),
    router = express.Router(),
    TheGbifNetwork = rootRequire('app/models/gbifdata/theGbifNetwork/theGbifNetwork');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/the-gbif-network', function (req, res, next) {

    let context = {},
        query = {},
        gbifRegion = 'GLOBAL',
        validRegions = ['AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'];

    if (req.query.hasOwnProperty('gbifRegion') && req.query.gbifRegion !== 'undefined' && validRegions.indexOf(req.query.gbifRegion) !== -1) {
        query.gbifRegion = req.query.gbifRegion;
    }

    TheGbifNetwork.get(res)
        .then(data => {
            context.intro = data[0];
            return TheGbifNetwork.counts(query);
        })
        .then(count => {
            context.count = count;
            res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', {
                data: context,
                hasTitle: true
            });
        })
        .catch(err => {
            next(err + 'at theGbifNetwork.ctrl line 22.')
        });
});