"use strict";
let express = require('express'),
    nunjucks = require('nunjucks'),
    fs = require('fs'),
    log = rootRequire('config/log'),
    router = express.Router(),
    chai = require('chai'),
    expect = chai.expect,
    issueTemplateString = fs.readFileSync(__dirname + '/metadata.nunjucks', "utf8");

module.exports = function (app) {
    app.use('/api/datarepo', router);
};

router.post('/metadata', function (req, res) {
    res.set('Content-Type', 'text/xml');
    let body = req.body;

    //validate post content
    try {
        expect(body, 'body should be an object').to.be.an('object');
        expect(body.title, 'title').to.be.a('string');
        expect(body.description, 'description').to.be.a('string');

        res.send(getDescription(req.body));

    } catch(err){
        res.status(422);
        res.json({
            message: err.message
        });
    }
});



function getDescription(data) {
    //transform data if needed and return the rendered template
    return nunjucks.renderString(issueTemplateString, data);
}


