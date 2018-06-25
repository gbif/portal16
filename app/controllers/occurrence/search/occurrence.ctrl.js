'use strict';
let express = require('express'),
    url = require('url'),
    changeCase = require('change-case'),
    _ = require('lodash'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

let re = /^[-,0-9]+/i;
function redirectOldQueries(req, res) {
    // handle old query params
    let query = req.query,
        pathName = req.path,
        snakeQuery = {},
        different = false;
    _.forEach(query, function(value, key) {
        let snakeKey = changeCase.snakeCase(key);
        snakeQuery[snakeKey] = value;
        different = different || key !== snakeKey;
    });

    // the old site used display=map as a param to indicate a map view. map this to a route
    if (query.display == 'map') {
        delete snakeQuery.display;
        pathName = '/occurrence/map';
    }

    // the old site didn't use WKT, but only the coordinates and assumed polygon - this site uses wkt instead
    if (snakeQuery.geometry) {
        let a = [].concat(snakeQuery.geometry);
        snakeQuery.geometry = a.map(function(e) {
            let startsWithNumber = e.match(re);
            if (startsWithNumber) {
                different = true;
                return 'POLYGON((' + e + '))';
            } else {
                return e;
            }
        });
    }

    // if the query has been rewritten then redirect with the normalized params
    if (different) {
        res.redirect(302, url.format({
                pathname: pathName,
                query: snakeQuery
            }
        ));
        return true;
    }
    return false;
}

function renderSearch(req, res) {
    if (!redirectOldQueries(req, res)) {
        res.render('pages/occurrence/ocurrence', {
            title: 'Occurrences',
            _meta: {
                hasTools: true,
                title: req.__('search.search'),
                description: req.__('occurrenceSearch.description')
            }
        });
    }
}

router.get('/occurrence/', function(req, res) {
    res.redirect(302, './occurrence/search');
});

router.get('/occurrence/search', function(req, res) {
    renderSearch(req, res);
});

router.get('/occurrence/gallery', function(req, res) {
    renderSearch(req, res);
});

router.get('/occurrence/map', function(req, res) {
    renderSearch(req, res);
});

router.get('/occurrence/download', function(req, res) {
    renderSearch(req, res);
});

router.get('/occurrence/taxonomy', function(req, res) {
    renderSearch(req, res);
});

router.get('/occurrence/datasets', function(req, res) {
    renderSearch(req, res);
});

router.get('/occurrence/charts', function(req, res) {
    renderSearch(req, res);
});
