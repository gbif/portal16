'use strict';
let _ = require('lodash');

function getFieldsWithIssues(occurrenceIssues, remarks) {
    let fieldsWithRemarks = {};
    occurrenceIssues.forEach(function(issue) {
        if (_.isUndefined(remarks[issue])) {
            return;
        }
        remarks[issue].relatedSimpleTerms.forEach(function(term) {
            fieldsWithRemarks[term] = fieldsWithRemarks[term] || [];
            fieldsWithRemarks[term].push({
                type: issue,
                severity: remarks[issue].severity
            });
        });
    });

    return fieldsWithRemarks;
}

function getFieldsWithDifferences(interpreted, verbatim, terms) {
    let fieldsWithDifferences = {};
    terms.forEach(function(term) {
        let i = '' + interpreted[term.simpleName],
            v = '' + verbatim[term.qualifiedName];

        if (typeof interpreted[term.simpleName] === 'undefined') {
            fieldsWithDifferences[term.simpleName] = 'EXCLUDED';
        } else if (typeof verbatim[term.qualifiedName] === 'undefined') {
            fieldsWithDifferences[term.simpleName] = 'INFERED';
        } else if (i.toLowerCase().replace(/_/g, '') != v.toLowerCase().replace(/_/g, '')) {
            fieldsWithDifferences[term.simpleName] = 'AUTHORED';
        }
    });

    return fieldsWithDifferences;
}

function getSummary(occurrenceIssues, remarks) {
    occurrenceIssues = occurrenceIssues || [];
    if (occurrenceIssues.length == 0) {
        return undefined;
    }
    let summary = undefined;
    occurrenceIssues.forEach(function(e) {
        let remark = remarks[e];

        // handle remarks that isn't listed in the remarks endpoint http://api.gbif.org/v1/enumeration/interpretationRemark/
        if (_.isUndefined(remark)) {
            // Dummy remark: show remarks that isn't known as warnings. Translations is likely to be missing
            remark = {type: e,
                severity: 'WARNING',
                    relatedTerms: [],
                    relatedSimpleTerms: []
            };

            // return; //don't show remarks that are not listed in the remarks endpoint http://api.gbif.org/v1/occurrence/interpretation. that means that
        }
        if (remark.severity == 'INFO') return;
        summary = summary || {};
        summary[remark.severity] = summary[remark.severity] || [];
        summary[remark.severity].push(remark);
    });
    return summary;
}

module.exports = {
    getFieldsWithIssues: getFieldsWithIssues,
    getFieldsWithDifferences: getFieldsWithDifferences,
    getSummary: getSummary
};
