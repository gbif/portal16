var express = require('express'),
    Dataset = require('../../models/gbifdata/gbifdata').Dataset,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset/:key\.:ext?', function (req, res, next) {
    var datasetKey = req.params.key;

    var getOptions = {
        expand: ['publisher', 'installation']
    };
    Dataset.get(datasetKey, getOptions).then(function(dataset) {
        renderPage(req, res, dataset);
    }, function(err){
        next();
    });
});

function renderPage(req, res, dataset) {
    var datasetContent = {
        datasetDetails: dataset.record,
        publisher: dataset.publisher,
        installation: dataset.installation,
        metadataElementsToFold: metadataElementsToFold(dataset.record),
        hasTitle: true
    };

    if (req.params.ext == 'json') {
        res.json(datasetContent);
    } else {
        dataset.record.doiUrl = doiToUrl(dataset.record.doi);
        res.render('pages/dataset/datasetDetails', datasetContent);
    }
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

    metadataElementsToFold.forEach(function (elementToFold) {
        if (typeof datasetDetails[elementToFold.property] !== 'undefined' && datasetDetails[elementToFold.property].length !== 0) {

            // TODO Process contacts according to refined role weights.
            switch (elementToFold.property) {
                case 'taxonomicCoverages':
                    // TODO Introduce lodash to simplify and enhance the readability of the code.
                    var originalCoverages = datasetDetails[elementToFold.property];
                    var taxonomicCoveragesProcessed = [];
                    // See source list at https://github.com/gbif/gbif-api/blob/master/src/main/java/org/gbif/api/vocabulary/Rank.java#L41
                    var ranks = ['DOMAIN', 'KINGDOM', 'SUBKINGDOM', 'SUPERPHYLUM', 'PHYLUM', 'SUBPHYLUM', 'SUPERCLASS', 'CLASS', 'SUBCLASS', 'SUPERORDER', 'ORDER', 'SUBORDER', 'INFRAORDER', 'SUPERFAMILY', 'FAMILY', 'SUBFAMILY', 'TRIBE', 'SUBTRIBE', 'SUPRAGENERIC_NAME', 'GENUS', 'SUBGENUS', 'SECTION', 'SUBSECTION', 'SERIES', 'SUBSERIES', 'INFRAGENERIC_NAME', 'SPECIES', 'INFRASPECIFIC_NAME', 'SUBSPECIES', 'INFRASUBSPECIFIC_NAME', 'VARIETY', 'FORM', 'SUBFORM', 'RANK_NOT_SPECIFIED'];
                    var ranksToItalicize = ['SUPRAGENERIC_NAME', 'GENUS', 'SUBGENUS', 'SECTION', 'SUBSECTION', 'SERIES', 'SUBSERIES', 'INFRAGENERIC_NAME', 'SPECIES', 'INFRASPECIFIC_NAME', 'SUBSPECIES', 'INFRASUBSPECIFIC_NAME', 'VARIETY', 'FORM', 'SUBFORM'];

                    originalCoverages.forEach(function (originalCoverage) {
                        if (typeof originalCoverage === 'object') {
                            var taxonomicCoverage = {};
                            taxonomicCoverage.description = originalCoverage.description;
                            taxonomicCoverage.coverages = [];

                            // First find available ranks
                            var availableRanks = [];
                            originalCoverage.coverages.forEach(function (coverage) {
                                if (typeof coverage === 'object') {
                                    if (coverage.rank) {
                                        if (availableRanks.indexOf(coverage.rank.interpreted) == -1) {
                                            availableRanks.push(coverage.rank.interpreted);
                                        }
                                    }
                                    else {
                                        availableRanks.push('RANK_NOT_SPECIFIED');
                                    }
                                }
                            });
                            // Sort ranks with arbitrary order
                            var sortedRanks = [];
                            ranks.forEach(function(value) {
                                var found = false;
                                availableRanks = availableRanks.filter(function(rank) {
                                    if(!found && rank == value) {
                                        sortedRanks.push(rank);
                                        found = true;
                                        return false;
                                    } else
                                        return true;
                                })
                            });

                            // Fill in taxa to accompany the rank
                            sortedRanks.forEach(function (sortedRank) {
                                var newCoverage = {rank: sortedRank, taxa: []};

                                originalCoverage.coverages.forEach(function(coverage) {
                                    var taxon = {};
                                    var searchUrl = function(name) {
                                        var url = '/species/search?=';
                                        url = url + name.replace(' ', '+');
                                        return url;
                                    };

                                    if (coverage.rank) {
                                        if (sortedRank == coverage.rank.interpreted) {
                                            if (coverage.scientificName) {
                                                taxon.scientificName = coverage.scientificName;
                                                taxon.searchUrl = searchUrl(coverage.scientificName) + '&rank=' + coverage.rank.interpreted;
                                            }
                                            if (coverage.commonName) {
                                                taxon.commonName = coverage.commonName;
                                            }

                                            // Preliminary calculation for italicizing latin names.
                                            if (ranksToItalicize.indexOf(coverage.rank.interpreted) != -1) {
                                                taxon.italicized = true;
                                            } else {
                                                taxon.italicized = false;
                                            }

                                            newCoverage.taxa.push(taxon);
                                        }
                                    }
                                    else if (sortedRank == 'RANK_NOT_SPECIFIED') {
                                        if (coverage.scientificName) {
                                            taxon.scientificName = coverage.scientificName;
                                            taxon.searchUrl = searchUrl(coverage.scientificName);
                                        }
                                        if (coverage.commonName) {
                                            taxon.commonName = coverage.commonName;
                                        }
                                        newCoverage.taxa.push(taxon);
                                    }

                                });
                                taxonomicCoverage.coverages.push(newCoverage);
                            });
                        }
                        taxonomicCoveragesProcessed.push(taxonomicCoverage);
                    });
                    elementToFold.values = taxonomicCoveragesProcessed;
                    break;
                default:
                    elementToFold.values = datasetDetails[elementToFold.property];
                    break;
            }

            results.push(elementToFold);
        }
    });

    return results;
}