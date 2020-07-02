'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    request = require('request-promise'),
    log = require('../../../../config/log');

function getLocalizedEndpoint(locale, name) {
    return `https://${locale}.wikipedia.org/api/rest_v1/page/summary/${name}`;
}

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/wikipedia/page/:name/summary', function(req, res) {
      return getWikipediaSummary(req, res)
        .then((response) => {
            return res.status(200).json(response);
        })
        .catch(function(err) {
            log.error(err);
            let status =
                err.message === 'not found'
                    ? 404
                    : err.statusCode
                    ? err.statusCode
                    : 500;
            res.sendStatus(status);
        });
});

const getWikipediaSummary = async (req, res) => {
    const locale = _.get(req, 'query.locale');
    try {
        const response = await request({
            url: getLocalizedEndpoint(locale, req.params.name),
            json: true
        });

        return {
            [locale]: _.merge(_.pick(response, ['extract', 'extract_html', 'thumbnail', 'title', 'displaytitle']), {link: `https://${locale}.wikipedia.org/wiki/${req.params.name}`})
        };
    } catch (err) {
        if (err.statusCode === 404 && locale !== 'en') {
            const response = await request({
                url: getLocalizedEndpoint('en', req.params.name),
                json: true
            });

             return {
                [locale]: null,
                en: _.merge(_.pick(response, ['extract', 'extract_html', 'thumbnail', 'title', 'displaytitle']), {link: `https://en.wikipedia.org/wiki/${req.params.name}`})
            };
        } else {
            throw err;
        }
    }
};

