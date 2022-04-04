let express = require('express'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/occurrence-snapshots', renderTemplate);


function renderTemplate(req, res, next) {
    res.render('pages/tools/occurrenceSnapshots/occurrenceSnapshots', {
        _meta: {
            title: req.__('tools.occurrenceSnapshots.title'),
            noIndex: true
        }
    });
}


