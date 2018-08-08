'use strict';
let express = require('express'),
    router = express.Router(),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    ranks = require('../../../models/enums/allEnums').rank,
    request = require('requestretry'),
    Q = require('q');

const FAMILY_RANK_INDEX = ranks.indexOf('FAMILY'); // 15;
const SPECIES_RANK_INDEX = ranks.indexOf('SPECIES'); // 27;

const rankMarkerMap = {
    'dom.': 'DOMAIN',
    'superreg.': 'SUPERKINGDOM',
    'reg.': 'KINGDOM',
    'subreg.': 'SUBKINGDOM',
    'infrareg.': 'INFRAKINGDOM',
    'superphyl.': 'SUPERPHYLUM',
    'phyl.': 'PHYLUM',
    'subphyl.': 'SUBPHYLUM',
    'infraphyl.': 'INFRAPHYLUM',
    'supercl.': 'SUPERCLASS',
    'cl.': 'CLASS',
    'subcl.': 'SUBCLASS',
    'infracl.': 'INFRACLASS',
    'parvcl.': 'PARVCLASS',
    'superleg.': 'SUPERLEGION',
    'leg.': 'LEGION',
    'subleg.': 'SUBLEGION',
    'infraleg.': 'INFRALEGION',
    'supercohort': 'SUPERCOHORT',
    'cohort': 'COHORT',
    'subcohort': 'SUBCOHORT',
    'infracohort': 'INFRACOHORT',
    'magnord.': 'MAGNORDER',
    'superord.': 'SUPERORDER',
    'grandord.': 'GRANDORDER',
    'ord.': 'ORDER',
    'subord.': 'SUBORDER',
    'infraord.': 'INFRAORDER',
    'parvord.': 'PARVORDER',
    'superfam.': 'SUPERFAMILY',
    'fam.': 'FAMILY',
    'subfam.': 'SUBFAMILY',
    'infrafam.': 'INFRAFAMILY',
    'supertrib.': 'SUPERTRIBE',
    'trib.': 'TRIBE',
    'subtrib.': 'SUBTRIBE',
    'infratrib.': 'INFRATRIBE',
    'supragen.': 'SUPRAGENERIC_NAME',
    'gen.': 'GENUS',
    'subgen.': 'SUBGENUS',
    'infragen.': 'INFRAGENUS',
    'sect.': 'SECTION',
    'subsect.': 'SUBSECTION',
    'ser.': 'SERIES',
    'subser.': 'SUBSERIES',
    'infrageneric': 'INFRAGENERIC_NAME',
    'agg.': 'SPECIES_AGGREGATE',
    'sp.': 'SPECIES',
    'infrasp.': 'INFRASPECIFIC_NAME',
    'grex': 'GREX',
    'subsp.': 'SUBSPECIES',
    'convar.': 'CONVARIETY',
    'infrasubsp.': 'INFRASUBSPECIFIC_NAME',
    'prol.': 'PROLES',
    'race': 'RACE',
    'natio': 'NATIO',
    'ab.': 'ABERRATION',
    'morph': 'MORPH',
    'var.': 'VARIETY',
    'subvar.': 'SUBVARIETY',
    'f.': 'FORM',
    'subf.': 'SUBFORM',
    'pv.': 'PATHOVAR',
    'biovar': 'BIOVAR',
    'chemovar': 'CHEMOVAR',
    'morphovar': 'MORPHOVAR',
    'phagovar': 'PHAGOVAR',
    'serovar': 'SEROVAR',
    'chemoform': 'CHEMOFORM',
    'f.sp.': 'FORMA_SPECIALIS',
    'cv.': 'CULTIVAR',
    'strain': 'STRAIN'
};

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/species/names', function(req, res) {
    if (typeof req.query.q === 'undefined') {
        res.status(400);
        res.send();
    } else {
        let nameMap = {
            failed: {}
        };
        let promises = [];

        let keys = req.query.q.split(',');

        keys.forEach(function(key) {
            promises.push(getParsedName(key)
                .then(function(name) {
                    nameMap[key] = name;
                })
                .catch(function() {
                    nameMap.failed[key] = true;
                }));
        });

        Q.allSettled(promises).then(function() {
            return res.status(200).json(nameMap);
        }).catch(function() {
            res.status(500);
            res.send();
        });
    }
});

router.get('/species/:key/name', function(req, res) {
    let namePromise = getParsedName(req.params.key);
    namePromise.then(function(name) {
        if (name) {
            res.json({n: name});
        } else {
            res.status(204);
            res.send();
        }
    }).catch(function(err) {
        res.status(err.statusCode || 500);
        res.send();
    });
});

// We only get the rankMarker from the api, here the the markers are mapped to their ENUM constant name


async function getParsedName(speciesKey) {
    let name = await getName(speciesKey);

    if (name.type == 'OTU' ) {
        let species = await getSpecies(speciesKey);

        if (species.taxonomicStatus === 'SYNONYM') {
            let accepted = await getSpecies(species.acceptedKey);
            return name.scientificName + ' <i>(' + accepted.canonicalName + ')</i>';
        } else {
                let parent = await getSpecies(species.parentKey);
                return (ranks.indexOf(parent.rank) < SPECIES_RANK_INDEX) ?
                name.scientificName + ' <i>(' + parent.canonicalName + ' sp.)</i>' :
                name.scientificName + ' <i>(aff. ' + parent.canonicalName + ')</i>';
        }
        // return n;
    } else {
        // unparsable names - see https://github.com/gbif/portal-feedback/issues/209#issuecomment-307491143
        return formatName(name);
    }
}

function formatName(name) {
    let n = '';

    if (name.type == 'SCIENTIFIC' || name.type == 'CULTIVAR' || name.type == 'DOUBTFUL') {
        if (name.rankMarker && ranks.indexOf(rankMarkerMap[name.rankMarker]) > FAMILY_RANK_INDEX) {
            if ((name.genusOrAbove || name.specificEpithet) && name.scientificName.indexOf('×') === -1) {
                n += '<i>' + add(name.genusOrAbove) + add(name.specificEpithet) + '</i>';
            } else if (name.scientificName.indexOf('×') > -1 && name.canonicalNameWithMarker) {
                n += '<i>' + add(name.canonicalNameWithMarker) + '</i>';
            }


            if (name.infraSpecificEpithet && name.type !== 'CULTIVAR') {
                n += add(name.rankMarker);
            }

            if (name.infraSpecificEpithet) {
                n += '<i>' + add(name.infraSpecificEpithet) + '</i>';
            }

            if (name.infraGeneric && ranks.indexOf(rankMarkerMap[name.rankMarker]) < SPECIES_RANK_INDEX && name.type !== 'CULTIVAR') {
                n += add(name.rankMarker) + '<i>' + add(name.infraGeneric) + '</i>';
            }

            if (name.cultivarEpithet) {
                n += '\'' + name.cultivarEpithet + '\' ';
            }
        } else if (name.rankMarker === 'unranked') {
            n = name.scientificName;
            return n;
        } else {
            n += add(name.genusOrAbove);
        }
    } else if (name.type == 'HYBRID') {
        n += '<i>' + add(name.scientificName) + '</i>';
    } else if (name.type == 'CANDIDATUS') {
        let candName = name.genusOrAbove;
        if (name.specificEpithet) {
            candName += ' ' + name.specificEpithet;
        }

        n += '"<i>Candidatus </i>' + candName + '" ';
    } else if (name.type == 'INFORMAL') {
        if (ranks.indexOf(rankMarkerMap[name.rankMarker]) > FAMILY_RANK_INDEX) {
            n = '<i>' + add(name.scientificName) + '</i>';
        } else {
            n = name.scientificName;
        }
        return n;
    } else if ( name.type == 'VIRUS' || name.type == 'PLACEHOLDER') { // unparsable names - see https://github.com/gbif/portal-feedback/issues/209#issuecomment-307491143
        n = name.scientificName;
        return n;
    }

    if (name.bracketAuthorship || name.bracketYear) {
        n += '(' + addNoSpace(name.bracketAuthorship);
        if (name.bracketAuthorship && name.bracketYear) {
            n += ', ';
        }
        n += addNoSpace(name.bracketYear) + ') ';
    }
    n += addNoSpace(name.authorship);
    if (name.authorship && name.year) {
        n += ', ';
    }
    n += add(name.year);


    return n.trim();
}

async function getName(speciesKey) {
    let baseRequest = {
        url: apiConfig.taxon.url + speciesKey + '/name',
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function getSpecies(speciesKey) {
    let baseRequest = {
        url: apiConfig.taxon.url + speciesKey,
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

function add(value) {
    return value ? value + ' ' : '';
}

function addNoSpace(value) {
    return value ? value : '';
}

module.exports.formatName = formatName;
module.exports.getParsedName = getParsedName;
