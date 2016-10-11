"use strict";
var express = require('express'),
    hash = require('object-hash'),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    github = require('octonode'),
    router = express.Router(),
    querystring = require('querystring');

module.exports = function (app) {
    app.use('/api/tools/suggest-dataset', router);
};

router.post('/', function (req, res) {
    createIssue();
    res.json({
        referenceId: 5123
    });

});

function createIssue(data) {
    var client = github.client({
        username: 'mortenhofft',
        password: require('../../../../../config/config').githubPassword
    });

    var ghrepo = client.repo('MortenHofft/slettes');

    ghrepo.issue({
        "title": "Found a bug",
        "body": "I'm having a problem with this. \n- [x] check this please\n- [ ] but not this",
        "labels": ["Label1"]
    }, function(err, data, headers){
        console.log(err);
        console.log(data);
    }); //issue
}