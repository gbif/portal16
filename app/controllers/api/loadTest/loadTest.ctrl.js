/* eslint-disable object-curly-spacing */
'use strict';

const querystring = require('querystring');
const log = require('../../../../config/log');
const authService = require('../../auth/auth.service');
const { datasetKeyLoad } = require('./datasetLoad');
const { speciesKeyLoad } = require('./speciesLoad');
const { occurrenceSearchLoad } = require('./occurrenceSearchLoad');
const { occurrenceKeyLoad } = require('./occurrenceLoad');
const { isLoadTestEnabled, setLoadTestEnabled } = require('./load');
let express = require('express'),
    router = express.Router(),
    request = rootRequire('app/helpers/request');

module.exports = function (app) {
    app.use('/api', router);
};

/**
 * Route patterns for expensive pages that need custom GraphQL loaders
 */
const ROUTE_PATTERNS = {
    dataset: {
        pattern: /^\/dataset\/([0-9a-fA-F-]{36})(\/.*)?$/,
        loader: (match, query) => datasetKeyLoad(match[1])
    },
    species: {
        pattern: /^\/species\/(\d+)(\/.*)?$/,
        loader: (match, query) => speciesKeyLoad(match[1])
    },
    occurrenceSearch: {
        pattern: /^\/occurrence\/search/,
        loader: (match, query) => occurrenceSearchLoad(query)
    },
    occurrence: {
        pattern: /^\/occurrence\/(\d+)(\/.*)?$/,
        loader: (match, query) => occurrenceKeyLoad(match[1])
    }
};

/**
 * Check if URL matches a pattern that requires custom loading
 * @param {string} url - The cleaned URL path
 * @param {object} query - Query parameters from the request
 */
function triggerCustomLoaders(url, query) {
    for (const [name, config] of Object.entries(ROUTE_PATTERNS)) {
        const match = url.match(config.pattern);
        if (match) {
            try {
                config.loader(match, query);
                log.info(`Load test: triggered ${name} loader for ${url}`);
            } catch (err) {
                log.error(`Load test: ${name} loader failed for ${url}: ${err.message}`);
            }
            break; // Only trigger one loader per request
        }
    }
}

/**
 * Check if current time is within office hours (9 AM - 4 PM UTC)
 */
function isOfficeHours() {
    const currentHour = new Date().getUTCHours();
    // only monday to friday 9-16 UTC
    const currentDay = new Date().getUTCDay();
    if (currentDay === 0 || currentDay === 6) {
        return false;
    }
    return currentHour >= 9 && currentHour <= 18;
}

/**
 * Clean URL by removing domain part
 */
function cleanUrl(url) {
    const domainPattern = /^https?:\/\/[^/]+/i;
    return url.replace(domainPattern, '');
}

// Mirror traffic to load test demo site
router.get('/load-test/mirror', function (req, res) {
    authService.setNoCache(res);
    
    // Return early if not in office hours
    if (!isOfficeHours()) {
        res.json({ status: 'ok' });
        return;
    }

    // Return early if load testing is disabled
    if (!isLoadTestEnabled()) {
        res.json({ status: 'ok' });
        return;
    }

    res.json({ status: 'enabled' });

    const url = req.query.url;
    if (!url) {
        log.warn('Load test: No URL provided');
        return;
    }

    const cleanedUrl = cleanUrl(url);
    const newSiteUrl = `http://demo.gbif.org${cleanedUrl}`;

    // get params as string¨
    const queryString = newSiteUrl.split('?')[1] || '';
    // parse 
    const query = querystring.parse(queryString);

    // Trigger custom loaders for expensive pages
    triggerCustomLoaders(cleanedUrl, query);

    // Fire and forget - standard GET request to new site
    const options = {
        url: newSiteUrl,
        method: 'GET',
        fullResponse: true,
        json: true,
    };

    request(options).catch((err) => {
        log.error(`Load test request to ${newSiteUrl} failed: ${err.message}`);
    });
});

// Enable load testing (authenticated GBIF users only)
router.get('/load-test/enable', authService.isAuthenticated(), function (req, res, next) {
    authService.setNoCache(res);
    
    if (!req.user.email.endsWith('@gbif.org')) {
        return next();
    }
    
    setLoadTestEnabled(true);
    res.json({ status: 'load test enabled' });
});

// Disable load testing (authenticated GBIF users only)
router.get('/load-test/disable', authService.isAuthenticated(), function (req, res, next) {
    authService.setNoCache(res);
    
    if (!req.user.email.endsWith('@gbif.org')) {
        return next();
    }
    
    setLoadTestEnabled(false);
    res.json({ status: 'load test disabled' });
});