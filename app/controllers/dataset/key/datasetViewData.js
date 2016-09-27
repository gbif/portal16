"use strict";
var _ = require('lodash'),
    Dataset = require('../../../models/gbifdata/gbifdata').Dataset,
    baseConfig = require('../../../../config/config'),
    helper = require('../../../models/util/util'),
    contributors = require('./contributors/contributors'),
    bibliography = require('./bibliography/bibliography'),
    async = require('async');

function getDataset(datasetKey, cb) {
    async.parallel(
        {
            expanded: function (cb) {
                getExpanded(datasetKey, cb);
            },
            speciesTaxonCount: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'species/search?limit=0&facet=rank&dataset_key=' + datasetKey, function (err, data) {
                    if (err) {
                        cb(err);
                    } else {
                        var mapped = {};
                        data.facets[0].counts.forEach(function(e) {
                            mapped[e.name] = e.count;
                        });
                        callback(null, mapped);
                    }
                });
            },
            occurrenceCount: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=0&dataset_key=' + datasetKey, callback);
            },
            occurrenceGeoreferencedCount: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=0&has_coordinate=true&has_geospatial_issue=false&dataset_key=' + datasetKey, callback);
            },
            occurrenceDatedCount: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=0&year=*,3000&dataset_key=' + datasetKey, callback);
            }
        }, function (err, data) {
            data.expanded._speciesTaxonCount = data.speciesTaxonCount;
            data.expanded._occurrenceCount = data.occurrenceCount;
            data.expanded._occurrenceGeoreferencedCount = data.occurrenceGeoreferencedCount;
            data.expanded._occurrenceDatedCount = data.occurrenceDatedCount;
            cb(err, data.expanded);
        }
    );
}

function getExpanded(datasetKey, cb) {
    var getOptions = {
        expand: ['publisher', 'images']
    };
    Dataset.get(datasetKey, getOptions).then(function (dataset) {
        try {
            dataset._computedValues = {};
            dataset._computedValues.contributors = contributors.getContributors(dataset.record.contacts);
            dataset._computedValues.bibliography = bibliography.getBibliography(dataset.record.bibliographicCitations);

            cb(null, dataset);
        } catch (err) {
            cb(err);
        }
    }, function (err) {
        cb(err);
    });
}


module.exports = {
    getDataset: getDataset
};

