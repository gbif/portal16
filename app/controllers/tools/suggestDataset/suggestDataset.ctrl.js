"use strict";

var express = require('express'),
    translationsHelper = rootRequire('app/helpers/translations'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/tools/suggest-dataset', function (req, res, next) {
    //get text content
    let markdownFiles = {
        description: 'tools/suggestDataset/description/',
        thankyou: 'tools/suggestDataset/thankyou/'
    };
    translationsHelper.getTranslations(markdownFiles, res.locals.gb.locales.current, function (err, translations) {
        if (err) {
            next(err);
        } else {
            render(req, res, next, {
                _meta: {
                    title: 'Suggest dataset'
                },
                translations: translations
            });
        }
    });
});

function render(req, res, next, data) {
    try {
        res.render('pages/tools/suggestDataset/suggestDataset', data);
    } catch (err) {
        next(err);
    }
}