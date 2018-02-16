'use strict';

let keys = {
    'nubKey': 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
    'colKey': '7ddf754f-d193-4cc9-b351-99906754a03b'
};

let linneanRanks = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
// from http://api.gbif.org/v1/enumeration/basic/Rank
let allRanks = ['domain', 'superkingdom', 'kingdom', 'subkingdom', 'infrakingdom', 'superphylum', 'phylum', 'subphylum', 'infraphylum', 'superclass', 'class', 'subclass', 'infraclass', 'parvclass', 'superlegion', 'legion', 'sublegion', 'infralegion', 'supercohort', 'cohort', 'subcohort', 'infracohort', 'magnorder', 'superorder', 'grandorder', 'order', 'suborder', 'infraorder', 'parvorder', 'superfamily', 'family', 'subfamily', 'infrafamily', 'supertribe', 'tribe', 'subtribe', 'infratribe', 'suprageneric_name', 'genus', 'subgenus', 'infragenus', 'section', 'subsection', 'series', 'subseries', 'infrageneric_name', 'species_aggregate', 'species', 'infraspecific_name', 'grex', 'subspecies', 'cultivar_group', 'convariety', 'infrasubspecific_name', 'proles', 'race', 'natio', 'aberration', 'morph', 'variety', 'subvariety', 'form', 'subform', 'pathovar', 'biovar', 'chemovar', 'morphovar', 'phagovar', 'serovar', 'chemoform', 'forma_specialis', 'cultivar', 'strain', 'other', 'unranked'];


module.exports = {
    linneanRanks: Object.freeze(linneanRanks),
    allRanks: Object.freeze(allRanks),
    keys: Object.freeze(keys)
};
