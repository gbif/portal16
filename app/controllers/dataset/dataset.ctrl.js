var express = require('express'),
    Dataset = require('../../models/gbifdata/gbifdata').Dataset,
    router = express.Router();

var emlElements = [
    { title: "Taxonomic coverage", key: "taxonomicCoverages" },
    { title: "Project", key: "project" },
    { title: "Sampling description", key: "samplingDescription" },
    { title: "Data description", key: "dataDescriptions" },
    { title: "Curatorial units", key: "curatorialUnits" },
    { title: "Collections", key: "collections" },
    { title: "Keyword collections", key: "keywordCollections" },
    { title: "Bibliographic citations", key: "bibliographicCitations" },
    { title: "Citation", key: "citation" },
    { title: "Rights", key: "rights" },
    { title: "Contacts", key: "contacts" }
];

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
        emlElements: emlElements,
        hasTitle: true
    });
}

function doiToUrl(doi) {
    if (doi) {
        var url = doi.replace('doi:', 'http://dx.doi.org/');
        return url;
    }
}