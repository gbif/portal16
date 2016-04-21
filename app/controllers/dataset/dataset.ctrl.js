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
        emlElements: emlElements(dataset.record),
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
 * Process available EML elements for the template.
 * @todo Decide whether this should be in model or controller.
 */
function emlElements(datasetDetails) {
    var emlElements = [
        { title: "Taxonomic coverage", property: "taxonomicCoverages" },
        { title: "Project", property: "project" },
        { title: "Sampling description", property: "samplingDescription" },
        { title: "Data description", property: "dataDescriptions" },
        { title: "Curatorial units", property: "curatorialUnits" },
        { title: "Collections", property: "collections" },
        { title: "Keyword collections", property: "keywordCollections" },
        { title: "Bibliographic citations", property: "bibliographicCitations" },
        { title: "Citation", property: "citation" },
        { title: "Rights", property: "rights" },
        { title: "Contacts", property: "contacts" }
    ];
    var results = [];

    for (var i = 0; i < emlElements.length ; i++) {
        if (typeof datasetDetails[emlElements[i].property] !== 'undefined' && datasetDetails[emlElements[i].property].length !== 0) {
            emlElements[i].values = datasetDetails[emlElements[i].property];
            results.push(emlElements[i]);
        }
    }

    return results;
}