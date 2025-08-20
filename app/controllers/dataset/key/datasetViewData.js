'use strict';
let _ = require('lodash'),
    Dataset = require('../../../models/gbifdata/gbifdata').Dataset,
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    helper = require('../../../models/util/util'),
    contributors = require('./contributors/contributors'),
    bibliography = require('./bibliography/bibliography'),
    taxonomicCoverage = require('./taxonomicCoverage/taxonomicCoverage'),
    processIdentifiers = require('./identifiers/identifiers'),
    composeSubmenu = require('./submenu'),
    async = require('async');

function getDataset(datasetKey, cb) {
    async.parallel(
        {
            expanded: function(cb) {
                getExpanded(datasetKey, cb);
            },
            downloads: function(callback) {
                helper.getApiData(apiConfig.occurrenceDownloadDataset.url + datasetKey + '?limit=0', callback, {timeoutMilliSeconds: 30000});
            }
        }, function(err, data) {
            if (err || _.isEmpty(data.expanded)) {
                cb(err);
                return;
            } else {
                try {
                    data.expanded._downloads = data.downloads;
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
    return endpoints.find(function(e) {
        return e.type == 'DWC_ARCHIVE';
    });
}
function transformBaseResult(dataset) {
    let bibliographyCap = 10;
    dataset._computedValues = {};
    dataset._computedValues.contributors = contributors.getContributors(dataset.record.contacts);
    let processedBibliography = bibliography.getBibliography(dataset.record.bibliographicCitations);

    if (processedBibliography.length > bibliographyCap) {
        dataset._computedValues.bibliographyCapped = true;
        dataset._computedValues.processedBibliography = processedBibliography.slice(0, bibliographyCap);
        dataset.record.bibliographicCitations = (dataset.record.bibliographicCitations || []).slice(0, bibliographyCap);
    }

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
    let getOptions = {
        expand: ['publisher', 'images', 'process', 'installation']
    };
    Dataset.get(datasetKey, getOptions).then(function(dataset) {
        try {
            dataset = transformBaseResult(dataset);
            cb(null, dataset);
        } catch (err) {
            cb(err);
        }
    }, function(err) {
        cb(err);
    });
}

module.exports = {
    getDataset: getDataset
};
