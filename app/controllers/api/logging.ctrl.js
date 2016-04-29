var express = require('express'),
    log = rootRequire('config/log'),
    router = express.Router();

module.exports = function(app) {
    app.use('/api/log', router);
};

router.post('/error', function(req, res) {
    log.error({body: req.body}, 'Client error');
    res.end('');
});