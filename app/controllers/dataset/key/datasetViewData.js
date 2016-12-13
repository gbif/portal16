"use strict";
var _ = require('lodash'),
    Dataset = require('../../../models/gbifdata/gbifdata').Dataset,
    baseConfig = require('../../../../config/config'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    helper = require('../../../models/util/util'),
    contributors = require('./contributors/contributors'),
    bibliography = require('./bibliography/bibliography'),
    taxonomicCoverage = require('./taxonomicCoverage/taxonomicCoverage'),
    processIdentifiers = require('./identifiers/identifiers'),
    composeSubmenu = require('./submenu'),
    translationsHelper = rootRequire('app/helpers/translations'),
    async = require('async'),
    markdownFiles = {
        noDescription: 'dataset/key/noDescription/'
    },
    translations = {};

function formatAsPercentage(part, total) {
    var percentage = part * 100 / total,
        formatedPercentage = 0;
    if (percentage == 100) {
        formatedPercentage = 100;
    } else if (percentage >= 99.9) {
        formatedPercentage = 99.9;
    } else if (percentage > 99) {
        formatedPercentage = percentage.toFixed(1);
    } else if (percentage >= 1) {
        formatedPercentage = percentage.toFixed();
    } else if (percentage >= 0.01) {
        formatedPercentage = percentage.toFixed(2);
    } else if (percentage < 0.01 && percentage != 0) {
        formatedPercentage = 0.01;
    }
    return formatedPercentage;
}

function getDataset(datasetKey, cb, locale) {
    async.parallel(
        {
            expanded: function (cb) {
                getExpanded(datasetKey, cb);
            },
            speciesTaxonCount: function (callback) {
                helper.getApiData(apiConfig.taxonSearch.url + '?limit=0&facet=rank&dataset_key=' + datasetKey, function (err, data) {
                    if (err) {
                        cb(err);
                    } else {
                        var mapped = {},
                            counts = _.get(data, 'facets[0].counts', []);
                        counts.forEach(function (e) {
                            mapped[e.name] = e.count;
                        });
                        callback(null, {
                            count: data.count,
                            facets: mapped
                        });
                    }
                });
            },
            occurrenceCount: function (callback) {
                helper.getApiData(apiConfig.occurrenceSearch.url + '?limit=0&dataset_key=' + datasetKey, callback);
            },
            occurrenceGeoreferencedCount: function (callback) {
                helper.getApiData(apiConfig.occurrenceSearch.url + '?limit=0&has_coordinate=true&has_geospatial_issue=false&dataset_key=' + datasetKey, callback);
            },
            occurrenceDatedCount: function (callback) {
                helper.getApiData(apiConfig.occurrenceSearch.url + '?limit=0&year=*,3000&dataset_key=' + datasetKey, callback);
            },
            occurrenceNoTaxonCount: function (callback) {
                helper.getApiData(apiConfig.occurrenceSearch.url + '?limit=0&issue=TAXON_MATCH_NONE&dataset_key=' + datasetKey, callback);
            },
            downloads: function (callback) {
                helper.getApiData(apiConfig.occurrenceDownloadDataset.url + datasetKey + '?limit=0', callback);
            },
            translations: function (callback) {
                if (typeof translations[locale] === 'undefined') {
                    translations[locale] = translationsHelper.getTranslationPromise(markdownFiles, locale);
                }
                translations[locale].then(
                    function (data) {
                        callback(null, data);
                    },
                    callback
                );
            }
        }, function (err, data) {
            if (err || _.isEmpty(data.expanded)) {
                cb(err);
                return;
            } else {
                try {
                    data.expanded._downloads = data.downloads;
                    data.expanded._speciesTaxonCount = data.speciesTaxonCount;
                    data.expanded._occurrenceCount = data.occurrenceCount;

                    data.occurrenceGeoreferencedCount.percentage = formatAsPercentage(data.occurrenceGeoreferencedCount.count, data.occurrenceCount.count);
                    data.expanded._occurrenceGeoreferencedCount = data.occurrenceGeoreferencedCount;

                    data.occurrenceDatedCount.percentage = formatAsPercentage(data.occurrenceDatedCount.count, data.occurrenceCount.count);
                    data.expanded._occurrenceDatedCount = data.occurrenceDatedCount;

                    data.occurrenceNoTaxonCount.percentage = formatAsPercentage(data.occurrenceCount.count - data.occurrenceNoTaxonCount.count, data.occurrenceCount.count);
                    data.expanded._occurrenceNoTaxonCount = data.occurrenceNoTaxonCount;

                    data.expanded.images._percentage = formatAsPercentage(data.expanded.images.count, data.occurrenceCount.count);

                    data.expanded.translations = data.translations;

                    data.expanded = composeSubmenu(data.expanded);
                    cb(null, data.expanded);
                } catch (error) {
                    cb(error);
                }
            }
        }
    );
}

function getOriginalDarwinCoreArchive(endpoints) {
    endpoints = endpoints || [];
    return endpoints.find(function (e) {
        return e.type == 'DWC_ARCHIVE';
    });
}
function transformBaseResult(dataset) {
    dataset._computedValues = {};
    dataset._computedValues.contributors = contributors.getContributors(dataset.record.contacts);
    dataset._computedValues.bibliography = bibliography.getBibliography(dataset.record.bibliographicCitations);

    let projectContacts = _.get(dataset, 'record.project.contacts', false);
    if (projectContacts) {
        dataset._computedValues.projectContacts = contributors.getContributors(projectContacts);
    }

    let taxonomicCoverages = _.get(dataset, 'record.taxonomicCoverages', false);
    if (taxonomicCoverages) {
        dataset._computedValues.taxonomicCoverages = taxonomicCoverage.extendTaxonomicCoverages(taxonomicCoverages);
    }

    dataset._computedValues.identifiers = processIdentifiers(dataset.record.identifiers);
    dataset._computedValues.originalArchive = getOriginalDarwinCoreArchive(dataset.record.endpoints);

    return dataset;
}

function getExpanded(datasetKey, cb) {
    var getOptions = {
        expand: ['publisher', 'images', 'process', 'installation']
    };
    Dataset.get(datasetKey, getOptions).then(function (dataset) {
        try {
            dataset = transformBaseResult(dataset);
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

