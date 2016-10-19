"use strict";

var marked = require('marked'),
    async = require('async'),
    fs = require('fs');

function parseMarkdown(data, cb) {
    try {
        let renderedText = marked(data);
        cb(null, renderedText);
    } catch (err) {
        cb(err)
    }
}

function getTranslatedMarkdown(path, language, cb) {
    language = language ? language : en;
    fs.readFile(__dirname + '/../../locales/markdown/' + path + language + '.md', 'utf8', function (err, data) {
        if (err) {
            cb(err);
        } else {
            parseMarkdown(data, cb);
        }
    });
}

function getTranslations(fileMap, language, callback) {
    var tasks = {};
    Object.keys(fileMap).forEach(function (e) {
        tasks[e] = function (cb) {
            getTranslatedMarkdown(fileMap[e], language, cb);
        };
    });

    async.parallel(tasks, callback);
}

module.exports = {
    getTranslations: getTranslations
};