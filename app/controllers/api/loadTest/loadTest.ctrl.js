'use strict';

const log = require('../../../../config/log');
const authService = require('../../auth/auth.service');
const { isLoadTestEnabled, setLoadTestEnabled } = require('./load');
let express = require('express'),
    router = express.Router(),
    request = rootRequire('app/helpers/request');

module.exports = function (app) {
    app.use('/api', router);
};

// mirror trafic to load test demo site
router.get('/load-test/mirror', function (req, res) {
    // return immediately if not around peak office hours UTC
    const currentHour = new Date().getUTCHours();
    if (currentHour < 9 || currentHour > 16) {
        res.json({ status: 'ok' });
        return;
    }

    if (isLoadTestEnabled() !== true) {
        res.json({ status: 'ok' });
        return;
    }
    res.json({ status: 'enabled' });
    const url = req.query.url;
    // remove the domain part if present
    const domainPattern = /^https?:\/\/[^/]+/i;
    const cleanedUrl = url.replace(domainPattern, '');

    // Fire and forget - don't wait for response
    const newSiteUrl = `https://demo.gbif.org${cleanedUrl}`;

    let options = {
        url: newSiteUrl,
        method: 'GET',
        fullResponse: true,
        json: true,
    };
    request(options).catch((err) => {
        log.error('Load test request to ' + newSiteUrl + ' failed: ' + err.message);
    });
});

router.get('/load-test/enable', authService.isAuthenticated(), function (req, res, next) {
    if (!req.user.email.endsWith('@gbif.org')) {
        next();
    } else {
        setLoadTestEnabled(true);
        res.json({ status: 'load test enabled' });
    }
});
router.get('/load-test/disable', authService.isAuthenticated(), function (req, res, next) {
    if (!req.user.email.endsWith('@gbif.org')) {
        next();
    } else {
        setLoadTestEnabled(false);
        res.json({ status: 'load test disabled' });
    }
});