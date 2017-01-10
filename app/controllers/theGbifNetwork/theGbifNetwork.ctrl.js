let express = require('express'),
    router = express.Router(),
    TheGbifNetwork = rootRequire('app/models/gbifdata/theGbifNetwork/theGbifNetwork');
let DirectoryParticipants = require('../../models/gbifdata/directory/directoryParticipants');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/the-gbif-network', function (req, res, next) {

    let context = {},
        gbifRegion = 'GLOBAL',
        validRegions = ['AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'];

    if (req.query.hasOwnProperty('gbifRegion') && req.query.gbifRegion !== 'undefined' && validRegions.indexOf(req.query.gbifRegion) !== -1) {
        gbifRegion = req.query.gbifRegion;
    }

    TheGbifNetwork.get(res)
        .then(data => {
            context.intro = data[0];
            return TheGbifNetwork.counts(gbifRegion);
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