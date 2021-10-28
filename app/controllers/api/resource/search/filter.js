const _ = require('lodash');

function getRangeParts(str) {
    str = str || '';
    if (str.toString() == '') return;

    let parts = str.toString().split(',');
    if (parts.length == 1) {
        // is
        return {
            values: [parts[0]],
            type: 'equals'
        };
    } else if (parts.length == 2) {
        if (parts[0] !== '*' && parts[1] !== '*') {
            return {
                values: parts,
                type: 'between'
            };
        } else if (parts[0] === '*' && parts[1] !== '*') {
            return {
                values: [undefined, parts[1]],
                type: 'lessThanOrEquals'
            };
        } else if (parts[0] !== '*' && parts[1] === '*') {
            return {
                values: [parts[0], undefined],
                type: 'greaterThanOrEquals'
            };
        }
    }
}

function getNestedFilter(field, value, path) {
    return {
        'nested': {
            'ignore_unmapped': true,
            'path': [
                path
            ],
            'query': getFilter(path + '.' + field, value)
        }
    };
}

function getFilter(field, value, isRange) {
    // Create the term filter
    let filterTerm = {};
    if (value.length == 1) {
        let rangeParts = getRangeParts(value[0]);
        if (isRange && rangeParts.type !== 'equals') {
            let rangeTerm = {};
            rangeTerm[field] = {};
            if (rangeParts.values[0]) {
                rangeTerm[field].gte = rangeParts.values[0];
            }
            if (rangeParts.values[1]) {
                rangeTerm[field].lte = rangeParts.values[1];
            }
            _.set(filterTerm, 'range', rangeTerm);
        } else {
            let term = {};
            term[field] = value[0];
            _.set(filterTerm, 'term', term);
        }
    } else {
        let term = {};
        term[field] = value;
        // range values not supported for arrays at this point as we havne't needed it
        _.set(filterTerm, 'terms', term);// value is an array with multiple values
    }

    return filterTerm;
}

module.exports = {
    getFilter: getFilter,
    getNestedFilter: getNestedFilter
};
