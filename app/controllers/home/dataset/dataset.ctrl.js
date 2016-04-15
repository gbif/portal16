var express = require('express'),
    datasetModel = require('../../../models/dataset/datasetKey'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset/:key', function(req, res) {
    var datasetKey = req.params.key;

    datasetModel.get(datasetKey, function(result) {
        res.render('pages/dataset/datasetDetails', {
            datasetDetails: result.datasetDetails,
            publisher: result.publisher,
            installation: result.installation,
            hasTitle: true
        });
    });
});

