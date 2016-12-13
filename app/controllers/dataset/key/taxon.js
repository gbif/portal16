"use strict";

var _ = require('lodash'),
    nsMap = require('../../../helpers/namespaces');

function cleanupVerbatim(v) {
    var v2 = {};
    if (v) {
        _.forOwn(v, function (val, key) {
            if (_.startsWith(key, 'http')) {
                v2[simpleName(key)] = val;
            }
        });
        v2.extensions = {};
        _.forOwn(v.extensions, function (records, eterm) {
            var records2 = [];
            _.forEach(records, function (rec) {
                var rec2 = {};
                _.forOwn(rec, function (value, term) {
                    rec2[simpleName(term)] = value;
                });
                if (!_.isEmpty(rec2)) {
                    records2.push(rec2);
                }
            });
            if (!_.isEmpty(records2)) {
                v2.extensions[simpleName(eterm)] = records2;
            }
        });
    }
    return v2;

    function simpleName(term) {
        var index = term.lastIndexOf('/');
        return term.substr(index + 1);
    }

    function normTerm(term) {
        var index = term.lastIndexOf('/');
        var ns = term.slice(0, index);
        var name = term.substr(index + 1);

        if (ns in nsMap) {
            ns = nsMap[ns] + ":";
        } else {
            ns = ns + "/";
        }
        return ns + name;
    }
}

module.exports = {
    cleanupVerbatim: cleanupVerbatim
};
