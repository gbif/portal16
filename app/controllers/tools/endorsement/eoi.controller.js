'use strict';
let auth = require('../../auth/auth.service'),
    log = require('../../../../config/log'),
    spamHelper = require('../../../models/verification/spam/spam'),
    Node = rootRequire('app/models/node/node'),
    eoi = require('./eoi.model');

module.exports = {
    create: create
};

function isSpam(req, formData) {
    let message = {
        req: req,
        text: formData.description || '',
        title: formData.title
    };
    if (spamHelper.isSpam(message)) {
        return true;
    }
    return false;
}

/**
 * Creates a new organization
 */
function create(req, res) {
    let flaggedAsSpam = isSpam(req, {title: req.body.title, description: JSON.stringify(req.body)});
    let node;
    if (flaggedAsSpam) {
        req.body.suggestedNodeKey = 'other'; // redirect to the GBIF secretariat
        log.warn('Endorsement request for ' + req.body.title + ' was flagged as possible spam and redirected to the secretariat.');
        // No need to get a node from registry
        node = Promise.resolve();
    } else if (req.body.suggestedNodeKey === 'other') {
        node = Promise.resolve();
    } else {
        node = Node.get(req.body.suggestedNodeKey);
    }
    node.then(function(n) {
        // The selected country is not a voting member, send request to the secretariat
        if (n && n.participationStatus === 'OBSERVER') {
            req.body.suggestedNodeKey = 'other';
        }
        return eoi.create(req.body);
    }).then(function(result) {
        res.status(201);
        auth.setNoCache(res);
        if (flaggedAsSpam) {
            res.send();
        } else {
            res.json(result);
        }
    })
        .catch(handleError(res, 422, req.body));
}


function handleError(res, statusCode, data) {
    statusCode = statusCode || 500;
    return function(err) {
        // throw err;
        res.status(err.statusCode || statusCode);
        log.error('Become a publisher form submission failure: ' + err.message);
        log.error('Become a publisher form failed to handle data: ' + JSON.stringify(data));
        res.send(); // should be safe to send, could just be user exists ? We dont use the err in the frontend currently, no reason to send it
    };
}
