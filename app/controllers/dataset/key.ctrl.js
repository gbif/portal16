var express = require('express'),
    Dataset = require('../../models/gbifdata/gbifdata').Dataset,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset/:key', function (req, res) {
    var datasetKey = req.params.key;

    var getOptions = {
        expand: ['publisher', 'installation']
    };
    Dataset.get(datasetKey, getOptions).then(function(dataset) {
        renderPage(res, dataset);
    }, function(err){
        console.log('error from expand: ' + err); //TODO
        renderPage(res, err);
    });
});

function renderPage(res, dataset) {
    res.render('pages/dataset/key/datasetKey', {
        dataset: dataset
    });
}