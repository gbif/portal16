'use strict';
const Joi = require('joi');

// consider splitting the joined alternative schema into one per predicate
// we would then need to iterate over them all and evaluate them all individually.
// doing so would give better feedback messages
const schema = Joi.alternatives().try(
  Joi.object({
    type: Joi.string().valid('and').required(),
    predicates: Joi.array().items(Joi.link('#predicateItem')).required()
  }),
  Joi.object({
    type: Joi.string().valid('or').required(),
    predicates: Joi.array().items(Joi.link('#predicateItem')).required()
  }),
  Joi.object({
    type: Joi.string().valid('not').required(),
    predicate: Joi.link('#predicateItem')
  }),
  Joi.object({
    type: Joi.string().valid('geoDistance').required(),
    latitude: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    longitude: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    distance: Joi.string().required(),
  }),
  Joi.object({
    type: Joi.string().valid('equals').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.bool()).required(),
    matchCase: Joi.alternatives().try(Joi.string(), Joi.bool()),
    checklistKey: Joi.string().optional(),
  }),
  Joi.object({
    type: Joi.string().valid('greaterThan').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    matchCase: Joi.alternatives().try(Joi.string(), Joi.bool())
  }),
  Joi.object({
    type: Joi.string().valid('greaterThanOrEquals').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    matchCase: Joi.alternatives().try(Joi.string(), Joi.bool())
  }),
  Joi.object({
    type: Joi.string().valid('lessThan').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    matchCase: Joi.alternatives().try(Joi.string(), Joi.bool())
  }),
  Joi.object({
    type: Joi.string().valid('lessThanOrEquals').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    matchCase: Joi.alternatives().try(Joi.string(), Joi.bool())
  }),
  Joi.object({
    type: Joi.string().valid('within').required(),
    geometry: Joi.string().required(),
  }),
  Joi.object({
    type: Joi.string().valid('isNotNull').required(),
    parameter: Joi.string().required(),
    checklistKey: Joi.string().optional(),
  }),
  Joi.object({
    type: Joi.string().valid('isNull').required(),
    parameter: Joi.string().required(),
    checklistKey: Joi.string().optional(),
  }),
  Joi.object({
    type: Joi.string().valid('like').required(),
    key: Joi.string().required(),
    value: Joi.string().required(),
    matchCase: Joi.alternatives().try(Joi.string(), Joi.bool())
  }),
  Joi.object({
    type: Joi.string().valid('in').required(),
    key: Joi.string().required(),
    values: Joi.array().required().items(Joi.alternatives().try(Joi.string(), Joi.number(), Joi.bool())),
    matchCase: Joi.alternatives().try(Joi.string(), Joi.bool()),
    checklistKey: Joi.string().optional(),
  })
).id('predicateItem');

// TODO we ought to evaluate all the values by format and content (for enums)
function validatePredicate(predicate, legalKeys) {
  legalKeys = legalKeys || allowedKeys;
  // test schema
  const {error} = schema.validate(predicate);
  if (error) {
    return {
      predicate,
      error: {
        message: error.details.map((x) => x.message).join(', ')
      }
    };
  }
  // ensure that keys are configured
  try {
    testPredicateKeys(predicate, legalKeys);
    return {value: predicate};
  } catch (err) {
    return {
      predicate,
      error: {
        message: err.message
      }
    };
  }
}

function testPredicateKeys(predicate, legalKeys) {
  if (predicate.key && !legalKeys.includes(predicate.key)) throw new Error(`'${predicate.key}' is not a known field.`);

  if (predicate.predicate) {
    testPredicateKeys(predicate.predicate, legalKeys);
  }
  if (predicate.predicates) {
    predicate.predicates.forEach((p) => testPredicateKeys(p, legalKeys));
  }
}

module.exports = {
  schema,
  validatePredicate
};

let allowedKeys = [
'ACCEPTED_TAXON_KEY',
'ASSOCIATED_SEQUENCES',
'BASIS_OF_RECORD',
'BED',
'CATALOG_NUMBER',
'CLASS_KEY',
'COLLECTION_CODE',
'COLLECTION_KEY',
'CONTINENT',
'COORDINATE_UNCERTAINTY_IN_METERS',
'COUNTRY',
'CRAWL_ID',
'DATASET_ID',
'DATASET_KEY',
'DATASET_NAME',
'DECIMAL_LATITUDE',
'DECIMAL_LONGITUDE',
'DEGREE_OF_ESTABLISHMENT',
'DEPTH',
'DISTANCE_FROM_CENTROID_IN_METERS',
'DWCA_EXTENSION',
'EARLIEST_AGE_OR_LOWEST_STAGE',
'EARLIEST_EON_OR_LOWEST_EONOTHEM',
'EARLIEST_EPOCH_OR_LOWEST_SERIES',
'EARLIEST_ERA_OR_LOWEST_ERATHEM',
'EARLIEST_PERIOD_OR_LOWEST_SYSTEM',
'ELEVATION',
'END_DAY_OF_YEAR',
'ESTABLISHMENT_MEANS',
'EVENT_DATE',
'EVENT_ID',
'FAMILY_KEY',
'FIELD_NUMBER',
'FORMATION',
'GADM_GID',
'GADM_LEVEL_0_GID',
'GADM_LEVEL_1_GID',
'GADM_LEVEL_2_GID',
'GADM_LEVEL_3_GID',
'GBIF_ID',
'GBIF_REGION',
'GENUS_KEY',
'GEO_DISTANCE',
'GEOMETRY',
'GEOREFERENCED_BY',
'GROUP',
'HAS_COORDINATE',
'HAS_GEOSPATIAL_ISSUE',
'HIGHER_GEOGRAPHY',
'HIGHEST_BIOSTRATIGRAPHIC_ZONE',
'HOSTING_ORGANIZATION_KEY',
'IDENTIFIED_BY',
'IDENTIFIED_BY_ID',
'INSTALLATION_KEY',
'INSTITUTION_CODE',
'INSTITUTION_KEY',
'IS_IN_CLUSTER',
'IS_SEQUENCED',
'ISLAND',
'ISLAND_GROUP',
'ISSUE',
'TAXONOMIC_ISSUE',
'CHECKLISTY_KEY',
'IUCN_RED_LIST_CATEGORY',
'KINGDOM_KEY',
'LAST_INTERPRETED',
'LATEST_AGE_OR_HIGHEST_STAGE',
'LATEST_EON_OR_HIGHEST_EONOTHEM',
'LATEST_EPOCH_OR_HIGHEST_SERIES',
'LATEST_ERA_OR_HIGHEST_ERATHEM',
'LATEST_PERIOD_OR_HIGHEST_SYSTEM',
'LICENSE',
'LIFE_STAGE',
'LOCALITY',
'LOWEST_BIOSTRATIGRAPHIC_ZONE',
'MEDIA_TYPE',
'MEMBER',
'MODIFIED',
'MONTH',
'NETWORK_KEY',
'OCCURRENCE_ID',
'OCCURRENCE_STATUS',
'ORDER_KEY',
'ORGANISM_ID',
'ORGANISM_QUANTITY',
'ORGANISM_QUANTITY_TYPE',
'OTHER_CATALOG_NUMBERS',
'PARENT_EVENT_ID',
'PATHWAY',
'PHYLUM_KEY',
'PREPARATIONS',
'PREVIOUS_IDENTIFICATIONS',
'PROGRAMME',
'PROJECT_ID',
'PROTOCOL',
'PUBLISHED_BY_GBIF_REGION',
'PUBLISHING_COUNTRY',
'PUBLISHING_ORG',
'RECORD_NUMBER',
'RECORDED_BY',
'RECORDED_BY_ID',
'RELATIVE_ORGANISM_QUANTITY',
'REPATRIATED',
'SAMPLE_SIZE_UNIT',
'SAMPLE_SIZE_VALUE',
'SAMPLING_PROTOCOL',
'SCIENTIFIC_NAME',
'SEX',
'SPECIES_KEY',
'START_DAY_OF_YEAR',
'STATE_PROVINCE',
'SUBGENUS_KEY',
'TAXON_CONCEPT_ID',
'TAXON_ID',
'TAXON_KEY',
'TAXONOMIC_STATUS',
'TYPE_STATUS',
'VERBATIM_SCIENTIFIC_NAME',
'WATER_BODY',
'YEAR'
];

