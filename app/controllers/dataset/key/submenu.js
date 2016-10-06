"use strict";
var _ = require('lodash');

function composeSubmenu(dataset) {
    var menu = [];

    //submenu groups
    var introduction = {name: 'introduction', items: []},
        coverage = {name: 'coverage', items: []},
        methodology = {name: 'methodology', items: []},
        //project = {name: 'project', items: []},
        credit = {name: 'credit', items: []},
        usage = {name: 'usage', items: []};

    //populate groups if there is content
    if (_.get(dataset, '_occurrenceCount.count', 0) > 0 || _.get(dataset, '_speciesTaxonCount.count', 0) > 0) introduction.items.push('metrics');
    if (_.get(dataset, '_occurrenceCount.count', 0) > 0 || _.has(dataset, '_computedValues.geoCoverage')) introduction.items.push('map');
    if (_.has(dataset, 'record.description')) introduction.items.push('description');
    if (_.has(dataset, 'record.purpose')) introduction.items.push('purpose');


    let temporalCoverages = _.get(dataset, 'record.temporalCoverages');
    if (!_.isEmpty(temporalCoverages)) coverage.items.push('temporalCoverages');
    let geographicCoverages = _.get(dataset, 'record.geographicCoverages');
    if (!_.isEmpty(geographicCoverages)) coverage.items.push('geographicCoverages');
    let taxonomicCoverages = _.get(dataset, 'record.taxonomicCoverages');
    if (!_.isEmpty(taxonomicCoverages)) coverage.items.push('taxonomicCoverages');


    if (_.has(dataset, 'record.samplingDescription.studyExtent')) methodology.items.push('studyExtent');
    if (_.has(dataset, 'record.samplingDescription.sampling')) methodology.items.push('sampling');
    if (_.has(dataset, 'record.samplingDescription.qualityControl')) methodology.items.push('qualityControl');
    if (_.has(dataset, 'record.samplingDescription.methodSteps')) methodology.items.push('methodSteps');

    //let projectField = _.get(dataset, 'record.project');
    //if (!_.isEmpty(projectField)) project.items.push('about');
    //if (_.has(dataset, 'record.project.funding')) project.items.push('funding');


    credit.items.push('citation');
    let bibliography = _.get(dataset, '_computedValues.bibliography');
    if (!_.isEmpty(bibliography)) credit.items.push('bibliography');
    if (_.has(dataset, 'record.contacts')) credit.items.push('contributions');
    // credit.items.push('licensec');

    usage.items.push('usage metrics');
    usage.items.push('processing history');


    //if there is content, then add the froup
    if (!_.isEmpty(introduction.items)) menu.push(introduction);
    if (!_.isEmpty(coverage.items)) menu.push(coverage);
    if (!_.isEmpty(methodology.items)) menu.push(methodology);
    //if (!_.isEmpty(project.items)) menu.push(project);
    if (!_.isEmpty(credit.items)) menu.push(credit);
    if (!_.isEmpty(usage.items)) menu.push(usage);

    dataset._computedValues.submenu = menu;
    return dataset;
}

module.exports = composeSubmenu;
