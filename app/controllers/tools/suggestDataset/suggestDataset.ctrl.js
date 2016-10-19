"use strict";

var express = require('express'),
    translationsHelper = rootRequire('app/helpers/translations'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/tools/suggest-dataset', function (req, res, next) {
    //get text content
    let markdownFiles = [
        {'token': 'description', 'directory': 'tools/suggestDataset/description/'},
        {'token': 'thankyou', 'directory': 'tools/suggestDataset/thankyou/'},
        {'token': 'failure', 'directory': 'tools/suggestDataset/failure/'}
    ];

    translationsHelper.getTranslations(markdownFiles, res.locals.gb.locales.current)
        .then(function(translations){
            render(req, res, next, {
                _meta: {
                    title: 'Suggest dataset'
                },
                translations: translations
            });
        })
        .catch(function(err){
            next(err);
        });
});

function render(req, res, next, context) {
    try {
        res.render('pages/tools/suggestDataset/suggestDataset.nunjucks', context);
    } catch (err) {
        next(err);
    }
}