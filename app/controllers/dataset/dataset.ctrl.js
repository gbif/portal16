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
    dataset.record.doiUrl = doiToUrl(dataset.record.doi);
    res.render('pages/dataset/datasetDetails', {
        datasetDetails: dataset.record,
        publisher: dataset.publisher,
        installation: dataset.installation,
        hasTitle: true
    });
}

function doiToUrl(doi) {
    if (doi) {
        var url = doi.replace('doi:', 'http://dx.doi.org/');
        return url;
    }
}