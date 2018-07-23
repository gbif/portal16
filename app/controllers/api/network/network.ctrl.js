'use strict';
let express = require('express'),
    router = express.Router();

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/networkKey/suggest', function(req, res, next) {
    res.json([
        {
            key: '2b7c7b4f-4d4f-40d3-94de-c28b6fa054a6',
            title: 'Ocean Biogeographic Information System (OBIS)'
        }
    ]);
});
