/* eslint-disable object-curly-spacing */
const request = rootRequire('app/helpers/request');
const querystring = require('querystring');
const log = require('../../../../config/log');
const apiConfig = require('../../../models/gbifdata/apiConfig');

/*
Similate approximate load on services for the new demo site when visiting a dataset page.
*/
const { graphqlRequest } = require('./graphqlRequest');

async function occurrenceSearchLoad(query) {
  // just ignore query for now - could also just use a random year or country?
  const predicate = await getPredicateFromQuery(query);
  const variables = queries.table.variables;
  variables.predicate = predicate;
  graphqlRequest(queries.table.query, variables);
}

const queries = {
  table: { "query": "\n  query OccurrenceSearch(\n    $from: Int\n    $size: Int\n    $predicate: Predicate\n    $q: String\n    $language: String\n    $sortBy: OccurrenceSortBy\n    $sortOrder: SortOrder\n    $checklistKey: ID\n  ) {\n    occurrenceSearch(q: $q, predicate: $predicate) {\n      documents(from: $from, size: $size, sortBy: $sortBy, sortOrder: $sortOrder) {\n        from\n        size\n        total\n        results {\n          key\n          taxonKey\n          verbatimScientificName\n          classification(checklistKey: $checklistKey) {\n            usage {\n              rank\n              name\n              key\n            }\n            taxonMatch {\n              usage {\n                name\n                key\n                canonicalName\n                formattedName\n              }\n            }\n            meta {\n              mainIndex {\n                datasetTitle\n              }\n            }\n            vernacularNames(lang: $language, maxLimit: 1) {\n              name\n              reference {\n                citation\n              }\n            }\n            hasTaxonIssues\n          }\n          primaryImage {\n            thumbor(width: 80)\n          }\n          eventDate\n          year\n          coordinates\n          formattedCoordinates\n          country\n          countryCode\n          basisOfRecord\n          datasetTitle\n          datasetKey\n          publishingOrgKey\n          publisherTitle\n          catalogNumber\n          recordedBy\n          identifiedBy\n          fieldNumber\n          sex\n          lifeStage\n          recordNumber\n          individualCount\n          typeStatus\n          occurrenceStatus\n          preparations\n          institutionCode\n          institutionKey\n          institution {\n            code\n            name\n          }\n          collectionCode\n          collectionKey\n          collection {\n            code\n            name\n          }\n          organismID\n          locality\n          higherGeography\n          stateProvince\n          establishmentMeans\n          iucnRedListCategory\n          stillImageCount\n          movingImageCount\n          soundCount\n          issues(types: [\"WARNING\", \"ERROR\"])\n          volatile {\n            features {\n              isSequenced\n              isTreament\n              isClustered\n              isSamplingEvent\n            }\n          }\n        }\n      }\n    }\n  }\n", "variables": { "language": "eng", "predicate": "PREDICATE_HERE", "checklistKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c", "size": 50, "from": 0, "sortOrder": "ASC" }, "operationName": "OccurrenceSearch" }
};

module.exports = {
  occurrenceSearchLoad
};


function getPredicateFromQuery(query) {
  return getPredicate(query).then((response) => {
    return response.predicate;
  }).catch((err) => {
    return null;
  });
}

async function getPredicate(query) {
  query = query || {};
  query.format = 'SIMPLE_CSV';
  let options = {
    url: apiConfig.occurrenceSearchDownload.url + 'predicate?' + querystring.stringify(query),
    method: 'GET',
    maxAttempts: 1,
    fullResponse: true,
    json: true
  };
  let response = await request(options);
  if (response.statusCode !== 200) {
    throw new Error('Failed API query');
  }
  return response.body;
}