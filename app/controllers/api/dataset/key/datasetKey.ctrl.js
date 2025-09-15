'use strict';
let express = require('express'),
    router = express.Router(),
    format = rootRequire('app/helpers/format'),
    taxonomicCoverage = require('./taxonomicCoverage'),
    bibliography = require('./bibliography'),
    _ = require('lodash'),
    datasetAuth = require('./datasetAuth'),
    utils = rootRequire('app/helpers/utils'),
    treatmentPublishers = rootRequire('config/config').publicConstantKeys.treatmentPublishers,
    contributors = rootRequire('app/controllers/dataset/key/contributors/contributors'),
    auth = require('../../../auth/auth.service'),
    md = require('markdown-it')({html: true, linkify: false, typographer: false, breaks: true}),
    Dataset = require('../../../../models/gbifdata/gbifdata').Dataset;

    let contactCap = 200;
    let bibCap = 500;

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
   if (response.network && response.network.length > 0) {
    dataset.network = response.network.filter(function(n) {
        return n.machineTags && n.machineTags.filter(function(m) {
            return m.name === 'visibleOnDatasetPage' && (m.value === 'true' || m.value === true);
        }).length > 0;
    });
   }
    dataset._computedValues = {};
    dataset._computedValues.contributors = contributors.getContributors(dataset.contacts);

    
    if (dataset.contacts.length > contactCap) {
        dataset._computedValues.contactsCapped = true;
        dataset._computedValues.contactsCount = dataset.contacts.length;
        dataset.contacts = dataset.contacts.slice(0, contactCap);
        dataset._computedValues.contributors.all = dataset._computedValues.contributors.all.slice(0, contactCap);
        dataset._computedValues.contributors.highlighted = dataset._computedValues.contributors.highlighted.slice(0, contactCap);
    }

    clean(dataset);

    let projectContacts = _.get(dataset, 'project.contacts', false);
    if (projectContacts) {
        dataset._computedValues.projectContacts = contributors.getContributors(projectContacts);
    }

    let taxonomicCoverages = _.get(dataset, 'taxonomicCoverages', false);
    if (taxonomicCoverages) {
        dataset._computedValues.taxonomicCoverages = taxonomicCoverage.extendTaxonomicCoverages(taxonomicCoverages);
    }

    bibliography.getBibliography(dataset.bibliographicCitations);
    if (dataset.bibliographicCitations.length > bibCap) {
        dataset._computedValues.bibliographyCapped = true;
        dataset._computedValues.bibliographyCount = dataset.bibliographicCitations.length;
        dataset.bibliographicCitations = dataset.bibliographicCitations.slice(0, bibCap);
    }


    // TODO treatment specific hack until API catch up
    if (treatmentPublishers.indexOf(dataset.publishingOrganizationKey) > -1) {
        dataset.subtype = 'TREATMENT_ARTICLE';
    }
    return dataset;
}

function clean(obj) {
    cleanMarkdownField(obj, 'description', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);
    cleanMarkdownField(obj, 'purpose', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);
    cleanMarkdownField(obj, 'samplingDescription.studyExtent', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);
    cleanMarkdownField(obj, 'samplingDescription.sampling', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);
    cleanMarkdownField(obj, 'samplingDescription.qualityControl', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);
    cleanMarkdownField(obj, 'additionalInfo', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);

    cleanArray(obj, 'samplingDescription.methodSteps');

    _.get(obj, 'geographicCoverages', []).forEach(function(e) {
        cleanMarkdownField(e, 'description');
    });
    _.get(obj, 'taxonomicCoverages', []).forEach(function(e) {
        cleanMarkdownField(e, 'description');
    });
    _.get(obj, 'bibliographicCitations', []).forEach(function(e) {
        cleanMarkdownField(e, 'text', ['i', 'a'], ['href']);
    });

    cleanMarkdownField(obj, 'project.title', [], []);
    cleanMarkdownField(obj, 'project.funding', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);
    cleanMarkdownField(obj, 'project.studyAreaDescription', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);
    cleanMarkdownField(obj, 'project.designDescription', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);
    cleanMarkdownField(obj, 'project.abstract', ['a', 'i', 'ul', 'ol', 'p', 'li'], ['href']);
}

// function cleanField(o, field) {
//     if (_.has(o, field)) {
//         _.set(o, field, format.sanitize(format.linkify(format.decodeHtml(_.get(o, field)))));
//     }
// }

function cleanMarkdownField(o, field, allowedTags, allowedAttributes) {
    const sanitize = allowedTags ? format.sanitizeCustom : format.sanitize;
    if (_.has(o, field)) {
        _.set(o, field, sanitize(format.linkify(format.decodeHtml(md.render(_.get(o, field)))), allowedTags, allowedAttributes)
            .replace(/(<p>)/g, '<p dir="auto">')
            .replace(/(<ul>)/g, '<ul dir="auto">')
            .replace(/(<ol>)/g, '<ol dir="auto">')
            );
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
