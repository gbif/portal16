let apiConfig = rootRequire('app/models/gbifdata/apiConfig');

let queryResolver = {
    taxonKey: {
        type: 'ENDPOINT',
        url: apiConfig.taxon.url,
        field: 'scientificName'
    },
    datasetKey: {
        type: 'ENDPOINT',
        url: apiConfig.dataset.url,
        field: 'title'
    },
    year: {
        type: 'ENUM',
        valueTranslation: 'intervals.year.'
    },
    elevation: {
        type: 'ENUM',
        valueTranslation: 'intervals.elevation.'
    },
    depth: {
        type: 'ENUM',
        valueTranslation: 'intervals.depth.'
    },
    month: {
        type: 'ENUM',
        valueTranslation: 'month.'
    },
    basisOfRecord: {
        type: 'ENUM',
        valueTranslation: 'basisOfRecord.'
    },
    country: {
        type: 'ENUM',
        valueTranslation: 'country.'
    },
    publishingCountry: {
        type: 'ENUM',
        valueTranslation: 'country.'
    },
    issue: {
        type: 'ENUM',
        valueTranslation: 'occurrenceIssue.'
    },
    typeStatus: {
        type: 'ENUM',
        valueTranslation: 'typeStatus.'
    },
    protocol: {
        type: 'ENUM',
        valueTranslation: 'endpointType.'
    },
    license: {
        type: 'ENUM',
        valueTranslation: 'license.'
    }
};

module.exports = queryResolver;
