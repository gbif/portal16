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
    type: Joi.string().valid('equals').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.bool()).required()
  }),
  Joi.object({
    type: Joi.string().valid('greaterThan').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number()).required()
  }),
  Joi.object({
    type: Joi.string().valid('greaterThanOrEquals').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number()).required()
  }),
  Joi.object({
    type: Joi.string().valid('lessThan').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number()).required()
  }),
  Joi.object({
    type: Joi.string().valid('lessThanOrEquals').required(),
    key: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number()).required()
  }),
  Joi.object({
    type: Joi.string().valid('within').required(),
    key: Joi.string().required(),
    value: Joi.string().required()
  }),
  Joi.object({
    type: Joi.string().valid('isNotNull').required(),
    key: Joi.string().required()
  }),
  Joi.object({
    type: Joi.string().valid('like').required(),
    key: Joi.string().required(),
    value: Joi.string().required()
  }),
  Joi.object({
    type: Joi.string().valid('in').required(),
    key: Joi.string().required(),
    values: Joi.array().required().items(Joi.alternatives().try(Joi.string(), Joi.number(), Joi.bool()))
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
  'BASIS_OF_RECORD',
  'CATALOG_NUMBER',
  'CLASS_KEY',
  'COLLECTION_CODE',
  'CONTINENT',
  'COORDINATE_UNCERTAINTY_IN_METERS',
  'COUNTRY',
  'CRAWL_ID',
  'DATASET_KEY',
  'DECIMAL_LATITUDE',
  'DECIMAL_LONGITUDE',
  'DEPTH',
  'ELEVATION',
  'ESTABLISHMENT_MEANS',
  'EVENT_DATE',
  'EVENT_ID',
  'FAMILY_KEY',
  'GADM_GID',
  'GADM_LEVEL0_GID',
  'GADM_LEVEL1_GID',
  'GADM_LEVEL2_GID',
  'GADM_LEVEL3_GID',
  'GENUS_KEY',
  'GEOMETRY',
  'HAS_COORDINATE',
  'HAS_GEOSPATIAL_ISSUE',
  'IDENTIFIED_BY',
  'IDENTIFIED_BY_ID',
  'INSTITUTION_CODE',
  'ISSUE',
  'KINGDOM_KEY',
  'LAST_INTERPRETED',
  'LICENSE',
  'LOCALITY',
  'MEDIA_TYPE',
  'MONTH',
  'NETWORK_KEY',
  'OCCURRENCE_ID',
  'OCCURRENCE_STATUS',
  'ORDER_KEY',
  'ORGANISM_ID',
  'ORGANISM_QUANTITY',
  'ORGANISM_QUANTITY_TYPE',
  'PHYLUM_KEY',
  'PROGRAMME',
  'PROJECT_ID',
  'PROTOCOL',
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
  'SPECIES_KEY',
  'STATE_PROVINCE',
  'SUBGENUS_KEY',
  'TAXON_KEY',
  'TYPE_STATUS',
  'VERBATIM_SCIENTIFIC_NAME',
  'VERBATIM_TAXON_ID',
  'WATER_BODY',
  'YEAR'
];

