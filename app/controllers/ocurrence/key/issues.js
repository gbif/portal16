"use strict";

function getFieldsWithIssues(occurrenceIssues, remarks) {
    let fieldsWithRemarks = {};
    occurrenceIssues.forEach(function(issue) {
        remarks[issue].relatedSimpleTerms.forEach(function(term){
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
        }
        else if (typeof verbatim[term.qualifiedName] === 'undefined') {
            fieldsWithDifferences[term.simpleName] = 'INFERED';
        }
        else if (i.toLowerCase().replace(/_/g, '') != v.toLowerCase().replace(/_/g, '')) {
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
    var summary = {};
    occurrenceIssues.forEach(function(e){
        let remark = remarks[e];
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
