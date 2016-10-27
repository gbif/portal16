var express = require('express'),
    router = express.Router(),
    Participation = rootRequire('app/models/gbifdata/theGbifNetwork/theGbifNetwork');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/the-gbif-network', function (req, res, next) {
    var jsonOutput = false;

    Participation.get(res)
        .then(function(data){
            var context = {'content': data};
            res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', {
                data: context,
                hasTitle: true
            });
        })
        .catch(function(err){
            next(err + 'at theGbifNetwork.ctrl line 22.')
        });
});