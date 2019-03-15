'use strict';
let express = require('express'),
    router = express.Router(),
    format = rootRequire('app/helpers/format'),
    taxonomicCoverage = require('./taxonomicCoverage'),
    bibliography = require('./bibliography'),
    _ = require('lodash'),
    datasetAuth = require('./datasetAuth'),
    utils = rootRequire('app/helpers/utils'),
    contributors = rootRequire('app/controllers/dataset/key/contributors/contributors'),
    auth = require('../../../auth/auth.service'),
    Dataset = require('../../../../models/gbifdata/gbifdata').Dataset;

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/dataset/:key/permissions', auth.isAuthenticated(), function(req, res, next) {
    let datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    }
    datasetAuth.permissions(req.user, datasetKey)
        .then(function(permissionState) {
            res.json(permissionState);
        })
        .catch(function(err) {
            console.log(err);
            res.status(500);
            res.send('Unable to get dataset crawling permissions due to a server error');
        });
});

router.get('/dataset/:key/crawl', auth.isAuthenticated(), datasetAuth.isTrustedContact(), function(req, res, next) {
    res.send('you are in');
});

router.get('/dataset/:key.:ext?', function(req, res, next) {
    let datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    }
    getDataset(datasetKey)
        .then(function(dataset) {
            res.json(dataset);
        })
        .catch(function(err) {
            res.status(err.statusCode || 500);
            res.send();
        });
});

async function getDataset(key) {
   let response = await Dataset.get(key, {expand: ['network']});

   let dataset = response.record;
    dataset.network = response.network;
    dataset._computedValues = {};
    dataset._computedValues.contributors = contributors.getContributors(dataset.contacts);

    clean(dataset);

    let projectContacts = _.get(dataset, 'project.contacts', false);
    if (projectContacts) {
        dataset._computedValues.projectContacts = contributors.getContributors(projectContacts);
    }

    let taxonomicCoverages = _.get(dataset, 'taxonomicCoverages', false);
    if (taxonomicCoverages) {
        dataset._computedValues.taxonomicCoverages = taxonomicCoverage.extendTaxonomicCoverages(taxonomicCoverages);
    }

    dataset._computedValues.bibliography = bibliography.getBibliography(dataset.bibliographicCitations);

    // TODO treatment specific hack until API catch up
    if (dataset.publishingOrganizationKey === '7ce8aef0-9e92-11dc-8738-b8a03c50a862') {
        dataset.subtype = 'TREATMENT_ARTICLE';
    }
    return dataset;
}

function clean(obj) {
    cleanField(obj, 'description');
    cleanField(obj, 'purpose');
    cleanField(obj, 'samplingDescription.studyExtent');
    cleanField(obj, 'samplingDescription.sampling');
    cleanField(obj, 'samplingDescription.qualityControl');
    cleanField(obj, 'additionalInfo');

    cleanArray(obj, 'samplingDescription.methodSteps');

    _.get(obj, 'geographicCoverages', []).forEach(function(e) {
        cleanField(e, 'description');
    });
    _.get(obj, 'taxonomicCoverages', []).forEach(function(e) {
        cleanField(e, 'description');
    });
}

function cleanField(o, field) {
    if (_.has(o, field)) {
        _.set(o, field, format.sanitize(format.linkify(format.decodeHtml(_.get(o, field)))));
    }
}

function cleanArray(o, field) {
    let values = _.get(o, field);
    if (values) {
        _.set(o, field, values.map(function(e) {
            return format.sanitize(format.linkify(format.decodeHtml(e)));
        }));
    }
}
