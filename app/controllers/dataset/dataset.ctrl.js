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
        metadataElementsToFold: metadataElementsToFold(dataset.record),
        hasTitle: true
    });
}

function doiToUrl(doi) {
    if (doi) {
        var url = doi.replace('doi:', 'http://dx.doi.org/');
        return url;
    }
}

/**
 * Process available metadata elements for the template.
 * @todo Decide whether this should be in model or controller.
 */
function metadataElementsToFold(datasetDetails) {
    var metadataElementsToFold = [
        { title: "Taxonomic coverage", property: "taxonomicCoverages" },
        { title: "Project", property: "project" },
        { title: "Sampling description", property: "samplingDescription" },
        { title: "Data description", property: "dataDescriptions" },
        { title: "Curatorial units", property: "curatorialUnits" },
        { title: "Collections", property: "collections" },
        { title: "Keyword collections", property: "keywordCollections" },
        { title: "Bibliographic citations", property: "bibliographicCitations" },
        { title: "Contacts", property: "contacts" }
    ];
    var results = [];

    for (var i = 0; i < metadataElementsToFold.length ; i++) {
        if (typeof datasetDetails[metadataElementsToFold[i].property] !== 'undefined' && datasetDetails[metadataElementsToFold[i].property].length !== 0) {
            metadataElementsToFold[i].values = datasetDetails[metadataElementsToFold[i].property];

            // TODO Further process taxonomicCoverages for HTML output.
            if (metadataElementsToFold[i] == 'taxonomicCoverages') {
            }

            // TODO Process contacts according to refined role weights.

            results.push(metadataElementsToFold[i]);
        }
    }

    return results;
}