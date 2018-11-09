'use strict';

let i18n = rootRequire('config/i18n'),
    _ = require('lodash'),
    enums = rootRequire('app/models/enums/allEnums'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    request = rootRequire('app/helpers/request');

module.exports = {
    expandFacets: expandFacets,
    populateAllEnums: populateAllEnums,
    fillAllInRange: fillAllInRange
};

/**
 * iteratue all facets types and facets and expand enums with their translation and keys with their scientificName/title etc.
 * @param facets a list of facets from an occurrence search
 */
async function expandFacets(facets, __, includeFullObject) {
    __ = __ || i18n.__;
    includeFullObject = includeFullObject || false;
    let facetPromises = facets.map(function(facet) {
return expandFacet(facet, __, includeFullObject);
});
    let f = await Promise.all(facetPromises);
    return f;
}

async function expandFacet(facet, __, includeFullObject) {
    // if enum then look up value
    // else get item from API
    if (!_.has(options[facet.field], 'type')) {
        // throw 'No such facet type configured';
        // default to raw
        options[facet.field] = {type: type.RAW};
    }


    // preprocess
    if (options[facet.field].ordering === 'NUMERIC') {
        facet.counts = _.sortBy(facet.counts, function(e) {
            return _.toSafeInteger(e.name);
        });
    }
    if (options[facet.field].prune) {
        _.remove(facet.counts, options[facet.field].prune);
    }

    // resolve names
    if (options[facet.field].type == type.RAW) {
        facet.counts.forEach(function(f) {
            f.displayName = f.name;
        });
        return facet;
    } else if (options[facet.field].type == type.ENUM) {
        facet.counts.forEach(function(f) {
            let translationPath = options[facet.field].translationPath.replace('{VALUE}', f.name);
            f.displayName = __(translationPath);
        });
        return facet;
    } else if (options[facet.field].type == type.KEY) {
        let facetPromises = facet.counts.map(function(item) {
return addResolveUrl(item, options[facet.field], includeFullObject);
});
        await Promise.all(facetPromises);
        return facet;
    }
}

async function addResolveUrl(item, conf, includeFullObject) {
    let url = conf.url.replace('{VALUE}', item.name);
    let options = {
        url: url,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw 'failed to get key';
    }
    item.displayName = _.get(response, 'body.' + conf.field, 'Unknown');
    if (includeFullObject) {
        item._resolved = response.body;
    }
    return item;
}

/**
 * Fill all faceted enums and not just those with a count above zero. E.g. January: 5, February: 0, March: 10, ... instead of March: 10, January: 5, [no February], ...
 * @param facets
 */
function populateAllEnums(facets) {
    facets.map(function(facet, index) {
        if (_.isArray(_.get(options[facet.field], 'enums'))) {
            // fill facet with all enum values
            let mappedFacets = _.keyBy(facet.counts, 'name');
            let filled = options[facet.field].enums.map(function(e) {
                return {
                    name: e,
                    count: _.get(mappedFacets[e], 'count') || 0
                };
            });
            facets[index].counts = filled;
        }
    });
}

function fillAllInRange(facets) {
    facets.map(function(facet, index) {
        if (options[facet.field].range) {
            // fill facet with all integers in range
            // get min and max
            /* min, max and facetMap currently unused:
            let min = _.minBy(facet.counts, function(e) {
                return _.toSafeInteger(e.name);
            });
            let max = _.maxBy(facet.counts, function(e) {
                return _.toSafeInteger(e.name);
            });

            // map counts to obj
            let facetMap = _.keyBy(facet.counts, 'name');
            */
            let mappedFacets = _.keyBy(facet.counts, 'name');
            // let filled = options[facet.field].enums.map(function(e){
            //    return {
            //        name: e,
            //        count: _.get(mappedFacets[e], 'count') || 0
            //    }
            // });
            facets[index].counts = mappedFacets;
        }
    });
}

let type = {
    ENUM: 1,
    KEY: 2,
    RAW: 3
};
let options = {
    BASIS_OF_RECORD: {
        type: type.ENUM,
        translationPath: 'basisOfRecord.{VALUE}',
        enums: enums.basisOfRecord
    },
    MONTH: {
        type: type.ENUM,
        translationPath: 'month.{VALUE}',
        enums: enums.month,
        ordering: 'NUMERIC'
    },
    YEAR: {
        range: true,
        type: type.RAW,
        ordering: 'NUMERIC'
    },
    ISSUE: {
        type: type.ENUM,
        translationPath: 'occurrenceIssue.{VALUE}',
        enums: enums.occurrenceIssue,
        prune: function(e) {
            return ['COORDINATE_ROUNDED', 'GEODETIC_DATUM_ASSUMED_WGS84', 'COORDINATE_REPROJECTED'].indexOf(e.name) != -1;
        }
    },
    COUNTRY: {
        type: type.ENUM,
        translationPath: 'country.{VALUE}'
        // enums: enums.country
    },
    TAXON_KEY: {
        type: type.KEY,
        url: apiConfig.taxon.url + '{VALUE}',
        field: 'scientificName'
    },
    KINGDOM_KEY: {
        type: type.KEY,
        url: apiConfig.taxon.url + '{VALUE}',
        field: 'scientificName'
    }
};
// All other rank keys are the same as taxonKey
let ranks = ['KINGDOM_KEY', 'PHYLUM_KEY', 'CLASS_KEY', 'ORDER_KEY', 'FAMILY_KEY', 'GENUS_KEY', 'SPECIES_KEY'];
ranks.forEach(function(rank) {
    options[rank] = options.TAXON_KEY;
});
