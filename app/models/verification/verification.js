"use strict";
var verificationFolder = rootRequire('config/config').verification,
    path = require('path'),
    verificationConfig = require(path.join(verificationFolder, 'config')),
    verifier = require('./humanVerifier')(verificationConfig);

module.exports = {
    getChallenge: verifier.getChallenge,
    verify: verifier.verify,
    resolveImageName: function (name, cb) {
        verifier.resolveImageName(name, function (err, name) {
            if (name) {
                name = path.join(verificationFolder, name);
            }
            cb(err, name);
        });
    }
};