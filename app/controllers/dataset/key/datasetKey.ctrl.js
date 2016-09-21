var express = require('express'),
    Dataset = require('../../../models/gbifdata/gbifdata').Dataset,
    authors = require('./authors/authors'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

function isGuid(stringToTest) {
    var regexGuid = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/gi;
    return regexGuid.test(stringToTest);
}

router.get('/dataset2/:key\.:ext?', function (req, res, next) {
    var datasetKey = req.params.key;
    if (!isGuid(datasetKey)) {
        next();
    } else {
        var getOptions = {
            expand: ['publisher', 'installation', 'occurrenceCount', 'occurrenceGeoRefCount', 'process', 'occurrenceDownloadEvents', 'datasetRefLookup']
        };
        Dataset.get(datasetKey, getOptions).then(function (dataset) {
            try {
                dataset._computedValues = {};
                dataset._computedValues.contributers = authors.getUniqueContacts(dataset.record.contacts);
                dataset._computedValues.citedContributers = authors.getCitationOrder(dataset.record.contacts);

                renderPage(req, res, next, dataset);
            } catch(err) {
                next(err);
            }
        }, function (err) {
            //TODO should this be logged here or in model/controller/api?
            //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
            console.log('error in ctrl ' + err);
            next();
        });
    }
});


function renderPage(req, res, next, dataset) {
    try {
        if (req.params.ext == 'debug') {
            res.json(dataset);
        } else {
            res.render('pages/dataset/key/datasetKey', {
                dataset: dataset,
                _meta: {
                    title: dataset.record.title
                }
            });
        }
    } catch(e) {
        next(e);
    }
}
