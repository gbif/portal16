"use strict";

var marked = require('marked'),
    fs = require('fs'),
    Q = require('q');

function parseMarkdown(data) {
    var deferred = Q.defer();
    let renderedText = marked(data);
    if (renderedText) {
        deferred.resolve(renderedText);
    }
    else {
        deferred.reject(new Error('Error when rendering markdown at line 14 of translation.js'));
    }
    return deferred.promise;
}

function getTranslatedMarkdown(text, language) {
    var deferred = Q.defer();
    var readFile = Q.denodeify(fs.readFile);
    if (!language) language = 'en';

    readFile(__dirname + '/../../locales/markdown/' + text.directory + language + '.md', 'utf8')
        .then(function(data){
            return parseMarkdown(data);
        })
        .then(function(data){
            var item = {
                'token': text.token,
                'text': data
            };
            deferred.resolve(item);
        })
        .catch(function(err){
            deferred.reject(err.message)
        });
    return deferred.promise;
}

function getTranslations(files, language) {
    var defer = Q.defer();
    var tasks = [];
    files.forEach(function (f) {
        tasks.push(getTranslatedMarkdown(f, language));
    });

    Q.all(tasks).then(function(translations){
        var resultObj = {};
        translations.forEach(function(translation){
            resultObj[translation.token] = translation.text;
        });
        defer.resolve(resultObj);
    })
        .catch(function(err){
            return defer.reject(err);
        });
    return defer.promise;
}

module.exports = {
    getTranslations: getTranslations
};