let express = require('express'),
    botDetector = require('isbot'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/species', router);
};

function renderSearch(req, res) {
    res.render('pages/species/search/speciesSearch', {
        title: 'Species',
        _meta: {
            title: res.__('search.search'),
            description: 'Search for species in Global Biodiversity Information Facility. Free and Open Access to Biodiversity Data.'

        }
    });
}

router.get('/', function(req, res) {
    res.redirect(302, './species/search');
});

router.get('/search', function(req, res) {
    let userAgent = req.get('user-agent');    
        const isBot = botDetector.isbot(userAgent);
                if (isBot) {
                    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                    res.header('Pragma', 'no-cache');
                    res.header('Expires', '0');
                    return res.status(403).send('Not allowed for bots');
                } 
    renderSearch(req, res);
});

router.get('/table', function(req, res) {
    renderSearch(req, res);
});

