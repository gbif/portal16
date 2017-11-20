var express = require('express'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    router = express.Router(),
    getStatus = require('./notifications.model');
    tests = require('./tests'),
    health = require('./health.model');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/health', function (req, res) {
    let status = getStatus();
    res.json(status);
});


var test = {
    "health": {
        "components": {
            "SPECIES": {
                "status": "OPERATIONAL",
                "pending": false,
                "errors": [
                    {
                        "details": "Wrong value for key: expected 'Puma concolor (Linnaeus, 1771)' to equal 'Puma concolor (Linnaeus, 1771) XXX'"
                    },
                    {
                        "details": "Response too slow: expected 190 to be below 3"
                    }
                ]
            },
            "OCCURRENCE": {
                "status": "OPERATIONAL",
                "pending": false,
                "errors": [
                    {
                        "details": "Response too slow: expected 269 to be below 5"
                    }
                ]
            },
            "REGISTRY": {
                "status": "OPERATIONAL",
                "pending": false
            },
            "CRAWLER": {
                "status": "OPERATIONAL",
                "pending": false
            },
            "RESOURCE_SEARCH": {
                "status": "OPERATIONAL",
                "pending": false
            },
            "CONTENTFUL": {
                "status": "OPERATIONAL",
                "pending": false
            }
        },
        "status": "CRITICAL"
    },
    "messages": {
        "list": [
            {
                "createdAt": "2017-10-25T09:43:45.954Z",
                "start": "2017-10-25T11:00+02:00",
                "end": "2017-12-29T19:00+02:00",
                "notificationType": "WARNING",
                "id": "1MT8H7t5zOeKoO2MAgUICc",
                "title": "Temporary disruptions",
                "body": "Apologies for temporary disruptions while we attend to the GBIF occurrence index. Shouldn't take long",
                "type": "Entry",
                "contentType": "notification",
                "space": {
                    "sys": {
                        "type": "Link",
                        "linkType": "Space",
                        "id": "qz96qz790wh9"
                    }
                },
                "updatedAt": "2017-11-17T16:29:31.194Z",
                "revision": 12,
                "_gbifDOIs": []
            },
            {
                "createdAt": "2017-08-28T14:18:12.419Z",
                "start": "2017-10-19T14:00+02:00",
                "end": "2017-11-30T15:15+02:00",
                "notificationType": "INFO",
                "id": "7g5tmBdd6gUiqYGgUCOC2w",
                "title": "Planned partial outage",
                "body": "GBIF are migrating to a new data center from **November 28-30**.  We apologise for the inconvenience but services are currently offline.  We aim to keep this as short as possible. ",
                "type": "Entry",
                "contentType": "notification",
                "space": {
                    "sys": {
                        "type": "Link",
                        "linkType": "Space",
                        "id": "qz96qz790wh9"
                    }
                },
                "updatedAt": "2017-11-17T16:31:23.488Z",
                "revision": 3,
                "_gbifDOIs": []
            }
        ],
        "status": "WARNING"
    },
    "status": "CRITICAL",
    "hash": "69c4ea4b62d7e3c39659edcf0fd6bb63e7da32bc",
    "changed": true,
    "updatedAt": "2017-11-17T16:33:45.896Z"
};