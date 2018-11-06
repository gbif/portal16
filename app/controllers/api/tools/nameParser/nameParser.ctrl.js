let express = require('express'),
    path = require('path'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/api/tools/nameparser', router);
};

router.get('/names', function(req, res) {
    return res.sendFile(path.join(__dirname, 'names.txt'));
});
