'use strict';

let enums = require('../../../../models/enums/allEnums');
let apiConfig = require('../../../../models/gbifdata/apiConfig');

let type = {
    ENUM: 1,
    KEY: 2,
    RAW: 3
};
let fields = {
    BASIS_OF_RECORD: {
        type: type.ENUM,
        translationPath: 'basisOfRecord.{VALUE}',
        enums: enums.basisOfRecord
    },
    MONTH: {
        type: type.ENUM,
        translationPath: 'month.{VALUE}',
        enums: enums.month,
        ordering: 'NUMERIC',
        range: {
            type: 'INT',
            min: 1,
            max: 12
        }
    },
    YEAR: {
        range: {
            type: 'INT',
            min: 1000,
            max: 2017 // TODO make dynamic
        },
        type: type.RAW
    },
    DEPTH: {
        range: {
            type: 'INT',
            min: 0,
            max: 10000
        },
        type: type.RAW
    },
    ELEVATION: {
        range: {
            type: 'INT',
            min: 0,
            max: 10000
        },
        type: type.RAW
    },
    DECIMAL_LATITUDE: {
        range: {
            type: 'FLOAT',
            min: -90,
            max: 90
        },
        type: type.RAW
    },
    ISSUE: {
        type: type.ENUM,
        translationPath: 'occurrenceIssue.{VALUE}',
        enums: enums.occurrenceIssue,
        prune: function(e) {
            return ['COORDINATE_ROUNDED', 'GEODETIC_DATUM_ASSUMED_WGS84', 'COORDINATE_REPROJECTED'].indexOf(e.name) != -1;
        },
        isOverlapping: true
    },
    ESTABLISHMENT_MEANS: {
        type: type.ENUM,
        translationPath: 'establishmentMeans.{VALUE}',
        enums: enums.establishmentMeans
    },
    LICENSE: {
        type: type.ENUM,
        translationPath: 'license.{VALUE}',
        enums: enums.license
    },
    COUNTRY: {
        type: type.ENUM,
        translationPath: 'country.{VALUE}'
        // enums: enums.country
    },
    PUBLISHING_COUNTRY: {
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
        type: type.ENUM,
        translationPath: 'kingdomKey.{VALUE}',
        enums: enums.kingdomKey,
        url: apiConfig.taxon.url + '{VALUE}',
        field: 'scientificName'
    },
    DATASET_KEY: {
        type: type.KEY,
        url: apiConfig.dataset.url + '{VALUE}',
        field: 'title'
    },
    PUBLISHING_ORG: {
        type: type.KEY,
        url: apiConfig.publisher.url + '{VALUE}',
        field: 'title'
    },
    EVENT_ID: {
        type: type.RAW
    },
    INSTITUTION_CODE: {
        type: type.RAW
    },
    COLLECTION_CODE: {
        type: type.RAW
    }
};
// All other rank keys are the same as taxonKey
let ranks = ['PHYLUM_KEY', 'CLASS_KEY', 'ORDER_KEY', 'FAMILY_KEY', 'GENUS_KEY', 'SPECIES_KEY'];
ranks.forEach(function(rank) {
    fields[rank] = fields.TAXON_KEY;
});

module.exports = {
    type: type,
    fields: fields
};
