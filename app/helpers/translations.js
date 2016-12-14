"use strict";

var marked = require('marked'),
    async = require('async'),
    Q = require('q'),
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
    fs.readFile(__dirname + '/../../locales/markdown/' + path + language + '.md', 'utf8', function (err, data) {
        if (err) {
            fs.readFile(__dirname + '/../../locales/markdown/' + path + 'en.md', 'utf8', function (err, data) {
                if (err) {
                    cb(err);
                } else {
                    parseMarkdown(data, cb);
                }
            });
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

function getTranslationPromise(fileMap, language) {
    var deferred = Q.defer();
    getTranslations(fileMap, language, function (err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

module.exports = {
    getTranslations: getTranslations,
    getTranslationPromise: getTranslationPromise
};