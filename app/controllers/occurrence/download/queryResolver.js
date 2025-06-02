let apiConfig = rootRequire('app/models/gbifdata/apiConfig');

let queryResolver = {
    taxonKey: {
        type: 'TAXON_ENDPOINT',
        url: apiConfig.taxon.url,
        field: 'scientificName'
    },
    datasetKey: {
        type: 'ENDPOINT',
        url: apiConfig.dataset.url,
        field: 'title'
    },
    institutionKey: {
      type: 'ENDPOINT',
      url: apiConfig.institution.url,
      field: 'name'
    },
    collectionKey: {
      type: 'ENDPOINT',
      url: apiConfig.collection.url,
      field: 'name'
    },
    publishingOrg: {
        type: 'ENDPOINT',
        url: apiConfig.publisher.url,
        field: 'title'
    },
    networkKey: {
      type: 'ENDPOINT',
      url: apiConfig.network.url,
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
    iucnRedListCategory: {
      type: 'ENUM',
      valueTranslation: 'iucnRedListCategory.'
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
    taxonomicIssue: {
        type: 'ENUM',
        valueTranslation: 'occurrenceIssue.'
    },
    typeStatus: {
        type: 'ENDPOINT',
        url: apiConfig.base.url + 'vocabularies/TypeStatus/concepts/',
        field: 'name',
        vocabularyEndpoint: true
    },
    protocol: {
        type: 'ENUM',
        valueTranslation: 'endpointType.'
    },
    license: {
        type: 'ENUM',
        valueTranslation: 'license.'
    },
    eventDate: {
        type: 'ENUM',
        valueTranslation: 'intervals.year.'
    },
    gbifRegion: {
        type: 'ENUM',
        valueTranslation: 'gbifRegion.'
    },
    sex: {
        type: 'ENDPOINT',
        url: apiConfig.base.url + 'vocabularies/Sex/concepts/',
        field: 'name',
        vocabularyEndpoint: true
    }
};

module.exports = queryResolver;
