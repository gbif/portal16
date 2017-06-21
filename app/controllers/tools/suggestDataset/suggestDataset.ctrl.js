"use strict";

var express = require('express'),
    translationsHelper = rootRequire('app/helpers/translations'),
    router = express.Router(),
    markdownFiles = {
        description: 'tools/suggestDataset/description/',
        thankyou: 'tools/suggestDataset/thankyou/',
        failure: 'tools/suggestDataset/failure/'
    },
    translations = {};

module.exports = function (app) {
    app.use('/', router);
};

router.get('/suggest-dataset', function (req, res, next) {

    //if the text hasn't already been read from disk, then get it
    if (typeof translations[res.locals.gb.locales.current] === 'undefined') {
        translations[res.locals.gb.locales.current] = translationsHelper.getTranslationPromise(markdownFiles, res.locals.gb.locales.current);
    }

    //once promise has been resolved then
    translations[res.locals.gb.locales.current].then(
        function (data) {
            render(req, res, next, {
                _meta: {
                    title: 'Suggest dataset'
                },
                translations: data
            });
        },
        function (err) {
            next(err);
        }
    );
});

function render(req, res, next, data) {
    try {
        res.render('pages/tools/suggestDataset/suggestDataset', data);
    } catch (err) {
        next(err);
    }
}