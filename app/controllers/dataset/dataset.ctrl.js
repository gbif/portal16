'use strict';
var express = require('express'),
    Dataset = require('../../models/gbifdata/gbifdata').Dataset,
    api = require('../../models/gbifdata/apiConfig'),
    router = express.Router(),
    request = require('request'),
    async = require('async'),
    Q = require('q');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset/:key\.:ext?', function (req, res, next) {
    var datasetKey = req.params.key;

    var getOptions = {
        expand: ['publisher', 'installation', 'occurrenceCount', 'occurrenceGeoRefCount', 'process']
    };
    Dataset.get(datasetKey, getOptions).then(function(dataset) {
        renderPage(req, res, dataset);
    }, function(err){
        next();
    });
});

router.get('/occurrence-download-dataset/:key', function (req, res) {
    var datasetKey = req.params.key,
        offset = req.query.offset,
        limit = req.query.limit;

    request(api.occurrenceDownloadDataset.url + datasetKey + '?offset=' + offset + '&limit=' + limit, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var processedBody = reconstructQueryFromPredicates(JSON.parse(body));
            processQueryTable(processedBody, res.__).then(
                function(data) {
                    res.json(data);
                }, function (err) {
                    console.log(err);
                }
            );
        }
    });
});

function renderPage(req, res, dataset) {
    var headerContacts = organizeContacts(dataset.record.contacts, 'HEADER');
    var georeferencedPercentage = dataset.occurrenceGeoRefCount / dataset.occurrenceCount * 100;
    var georeferencedString = (georeferencedPercentage == 100) ? georeferencedPercentage + '% ' + res.__('datasetDetails.' + 'georeferenced') : Math.round(georeferencedPercentage * 100) / 100 + '% ' + res.__('datasetDetails.' + 'georeferenced') + ' (' + dataset.occurrenceGeoRefCount + ' ' + res.__('datasetDetails.' + 'records') + ')';
    var publisherStyle = (dataset.publisher.title.length > 52) ? 'publisher-field--long-title' : '';
    var countBreaking = (dataset.occurrenceCount >= 10000) ? '<br>' : '';
    var publisherModifier = (dataset.occurrenceCount >= 10000) ? 'publisher-field--large-count' : '';

    var datasetContent = {
        datasetDetails: dataset.record,
        publisher: dataset.publisher,
        installation: dataset.installation,
        metadataElementsToFold: metadataElementsToFold(dataset.record),
        headerContacts: headerContacts,
        headerContactsString: JSON.stringify(headerContacts),
        occurrenceCount: dataset.occurrenceCount,
        occurrenceGeoRefCount: dataset.occurrenceGeoRefCount,
        georeferencedString: georeferencedString,
        publisherStyle: publisherStyle,
        countBreaking: countBreaking,
        publisherModifier: publisherModifier,
        process: dataset.process.results,
        api: api,
        identifiers: processIdentifiers(dataset.record.identifiers),
        hasTitle: true
    };

    if (req.params.ext == 'json') {
        res.json(datasetContent);
    } else {
        dataset.record.doiUrl = doiToUrl(dataset.record.doi);
        res.render('pages/dataset/datasetDetails', datasetContent);
    }
}

function doiToUrl(doi) {
    if (doi) { return doi.replace('doi:', 'http://dx.doi.org/'); }
}

/**
 * Process available metadata elements for the template.
 * @todo Decide whether this should be in model or controller.
 */
function metadataElementsToFold(datasetDetails) {
    var metadataElementsToFold = [
        { title: "Description", property: "description" },
        { title: "Purpose", property: "purpose" },
        { title: "Temporal coverage", property: "temporalCoverages" },
        { title: "Geographic coverage", property: "geographicCoverages" },
        { title: "Taxonomic coverage", property: "taxonomicCoverages" },
        { title: "Project", property: "project" },
        { title: "Sampling description", property: "samplingDescription" },
        { title: "Data description", property: "dataDescriptions" },
        { title: "Curatorial units", property: "curatorialUnits" },
        { title: "Collections", property: "collections" },
        { title: "Keyword collections", property: "keywordCollections" },
        { title: "Additional information", property: "additionalInfo"},
        { title: "Bibliographic citations", property: "bibliographicCitations" }
    ];
    var results = [];

    metadataElementsToFold.forEach(function (elementToFold) {
        if (typeof datasetDetails[elementToFold.property] !== 'undefined' && datasetDetails[elementToFold.property].length !== 0) {

            switch (elementToFold.property) {
                case 'taxonomicCoverages':
                    // TODO Introduce lodash to simplify and enhance the readability of the code.
                    var originalCoverages = datasetDetails[elementToFold.property];
                    var taxonomicCoveragesProcessed = [];
                    // See source list at https://github.com/gbif/gbif-api/blob/master/src/main/java/org/gbif/api/vocabulary/Rank.java#L41
                    var ranks = ['DOMAIN', 'KINGDOM', 'SUBKINGDOM', 'SUPERPHYLUM', 'PHYLUM', 'SUBPHYLUM', 'SUPERCLASS', 'CLASS', 'SUBCLASS', 'SUPERORDER', 'ORDER', 'SUBORDER', 'INFRAORDER', 'SUPERFAMILY', 'FAMILY', 'SUBFAMILY', 'TRIBE', 'SUBTRIBE', 'SUPRAGENERIC_NAME', 'GENUS', 'SUBGENUS', 'SECTION', 'SUBSECTION', 'SERIES', 'SUBSERIES', 'INFRAGENERIC_NAME', 'SPECIES', 'INFRASPECIFIC_NAME', 'SUBSPECIES', 'INFRASUBSPECIFIC_NAME', 'VARIETY', 'FORM', 'SUBFORM', 'RANK_NOT_SPECIFIED'];
                    var ranksToItalicize = ['SUPRAGENERIC_NAME', 'GENUS', 'SUBGENUS', 'SECTION', 'SUBSECTION', 'SERIES', 'SUBSERIES', 'INFRAGENERIC_NAME', 'SPECIES', 'INFRASPECIFIC_NAME', 'SUBSPECIES', 'INFRASUBSPECIFIC_NAME', 'VARIETY', 'FORM', 'SUBFORM'];

                    originalCoverages.forEach(function (originalCoverage) {
                        if (typeof originalCoverage === 'object') {
                            var taxonomicCoverage = {};
                            taxonomicCoverage.description = originalCoverage.description;
                            taxonomicCoverage.coverages = [];

                            // First find available ranks
                            var availableRanks = [];
                            originalCoverage.coverages.forEach(function (coverage) {
                                if (typeof coverage === 'object') {
                                    if (coverage.rank) {
                                        if (availableRanks.indexOf(coverage.rank.interpreted) == -1) {
                                            availableRanks.push(coverage.rank.interpreted);
                                        }
                                    }
                                    else {
                                        availableRanks.push('RANK_NOT_SPECIFIED');
                                    }
                                }
                            });
                            // Sort ranks with arbitrary order
                            var sortedRanks = availableRanks.sort(function(a, b){
                                return ranks.indexOf(a) - ranks.indexOf(b);
                            });

                            // Fill in taxa to accompany the rank
                            sortedRanks.forEach(function (sortedRank) {
                                var newCoverage = {rank: sortedRank, taxa: []};

                                originalCoverage.coverages.forEach(function(coverage) {
                                    var taxon = {};
                                    var searchUrl = function(name) {
                                        var url = '/species/search?=';
                                        url = url + name.replace(' ', '+');
                                        return url;
                                    };

                                    if (coverage.rank) {
                                        if (sortedRank == coverage.rank.interpreted) {
                                            if (coverage.scientificName) {
                                                taxon.scientificName = coverage.scientificName;
                                                taxon.searchUrl = searchUrl(coverage.scientificName) + '&rank=' + coverage.rank.interpreted;
                                            }
                                            if (coverage.commonName) {
                                                taxon.commonName = coverage.commonName;
                                            }

                                            // Preliminary calculation for italicizing latin names.
                                            taxon.italicized = (ranksToItalicize.indexOf(coverage.rank.interpreted) != -1);

                                            newCoverage.taxa.push(taxon);
                                        }
                                    }
                                    else if (sortedRank == 'RANK_NOT_SPECIFIED') {
                                        if (coverage.scientificName) {
                                            taxon.scientificName = coverage.scientificName;
                                            taxon.searchUrl = searchUrl(coverage.scientificName);
                                        }
                                        if (coverage.commonName) {
                                            taxon.commonName = coverage.commonName;
                                        }
                                        newCoverage.taxa.push(taxon);
                                    }

                                });
                                taxonomicCoverage.coverages.push(newCoverage);
                            });
                        }
                        taxonomicCoveragesProcessed.push(taxonomicCoverage);
                    });
                    elementToFold.values = taxonomicCoveragesProcessed;
                    break;
                case 'contacts':
                    // check valid contacts exist before returning
                    var organizedContacts = organizeContacts(datasetDetails[elementToFold.property], 'OTHER');
                    var valid = false;
                    organizedContacts.forEach(function(c){
                        if (c.contacts.length >= 1) {
                            valid = true;
                        }
                    });
                    if (valid == true) elementToFold.values = organizedContacts;
                    break;
                default:
                    elementToFold.values = datasetDetails[elementToFold.property];
                    break;
            }

            if (elementToFold.values) results.push(elementToFold);
        }
    });

    return results;
}

/**
 * Reorganize contacts according to roles ordered in the roles variable.
 * Todo pluralize the role label w/ https://github.com/mashpie/i18n-node
 * @param sourceContacts
 * @param mode
 */
function organizeContacts(sourceContacts, mode) {
    var roles = [];
    var resultRoles = [];

    // The order of roles here matters as weighting.
    switch (mode) {
        case 'HEADER':
            roles = [
                {'type': 'ORIGINATOR', 'label': 'Originator'},
                {'type': 'METADATA_AUTHOR', 'label': 'Metadata author'}
            ];
            break;
        case 'OTHER':
            roles = [
                {'type': 'ADMINISTRATIVE_POINT_OF_CONTACT', 'label': 'Administrative contact'},
                {'type': 'TECHNICAL_POINT_OF_CONTACT', 'label': 'Technical contact'},
                {'type': 'POINT_OF_CONTACT', 'label': 'Contact'},
                {'type': 'PRINCIPAL_INVESTIGATOR', 'label': 'Principal investigator'},
                {'type': 'AUTHOR', 'label': 'Author'},
                {'type': 'EDITOR', 'label': 'Editor'},
                {'type': 'CONTENT_PROVIDER', 'label': 'Content provider'},
                {'type': 'CUSTODIAN_STEWARD', 'label': 'Custodian steward'},
                {'type': 'DISTRIBUTOR', 'label': 'Distributor'},
                {'type': 'OWNER', 'label': 'Owner'},
                {'type': 'PUBLISHER', 'label': 'Publisher'},
                {'type': 'USER', 'label': 'User'},
                {'type': 'DATA_ADMINISTRATOR', 'label': 'Data administrator'},
                {'type': 'SYSTEM_ADMINISTRATOR', 'label': 'System administrator'},
                {'type': 'PROGRAMMER', 'label': 'Programmer'},
                {'type': 'PROCESSOR', 'label': 'Processor'}
            ];
            break;
        default:
            roles = [
                {'type': 'ORIGINATOR', 'label': 'Originator'},
                {'type': 'METADATA_AUTHOR', 'label': 'Metadata author'},
                {'type': 'PRINCIPAL_INVESTIGATOR', 'label': 'Principal investigator'},
                {'type': 'AUTHOR', 'label': 'Author'},
                {'type': 'EDITOR', 'label': 'Editor'},
                {'type': 'CONTENT_PROVIDER', 'label': 'Content provider'},
                {'type': 'CUSTODIAN_STEWARD', 'label': 'Custodian steward'},
                {'type': 'DISTRIBUTOR', 'label': 'Distributor'},
                {'type': 'OWNER', 'label': 'Owner'},
                {'type': 'PUBLISHER', 'label': 'Publisher'},
                {'type': 'USER', 'label': 'User'},
                {'type': 'DATA_ADMINISTRATOR', 'label': 'Data administrator'},
                {'type': 'SYSTEM_ADMINISTRATOR', 'label': 'System administrator'},
                {'type': 'PROGRAMMER', 'label': 'Programmer'},
                {'type': 'PROCESSOR', 'label': 'Processor'},
                {'type': 'HEAD_OF_DELEGATION', 'label': 'Head of Delegation'},
                {'type': 'TEMPORARY_HEAD_OF_DELEGATION', 'label': 'Temporary Head of Delegation'},
                {'type': 'ADDITIONAL_DELEGATE', 'label': 'Additional delegate'},
                {'type': 'TEMPORARY_DELEGATE', 'label': 'Temporary delegate'},
                {'type': 'REGIONAL_NODE_REPRESENTATIVE', 'label': 'Regional node representative'},
                {'type': 'NODE_MANAGER', 'label': 'Node manager'},
                {'type': 'NODE_STAFF', 'label': 'Node staff'},
                {'type': 'ADMINISTRATIVE_POINT_OF_CONTACT', 'label': 'Administrative contact'},
                {'type': 'TECHNICAL_POINT_OF_CONTACT', 'label': 'Technical contact'},
                {'type': 'POINT_OF_CONTACT', 'label': 'Contact'}
            ];
            break;
    }

    roles.forEach(function (role, ri) {
        role.contacts = [];
        sourceContacts.forEach(function(sourceContact){
            if (sourceContact.type == role.type) {

                // Process firstName, lastName and email here so the template is cleaner.
                // Make click-to-email name if email exists.
                var name = '';
                if (sourceContact.email[0]) {
                    name = sourceContact.firstName + ' ' + sourceContact.lastName;
                }
                else if (sourceContact.firstName && sourceContact.lastName) {
                    name = sourceContact.firstName + ' ' + sourceContact.lastName;
                }
                else {
                    name = sourceContact.organization;
                }
                sourceContact.name = name;

                var exists = false;
                if (role.contacts[0]) {
                    role.contacts.forEach(function(c){
                        if (c.key == sourceContact.key) {
                            exists = true;
                        }

                    });
                }

                if (!exists) {
                    role.contacts.push(sourceContact);
                }
            }
        });
        // if no contacts matched then don't include this role in the result.
        if (role.contacts.length != 0) {
            resultRoles.push(role);
        }
    });

    return resultRoles;
}

/**
 * To process identifiers so the template only get those meaningful to show.
 * There are multiple identifiers coming together in the API response. We want to show only
 * 1) DOI that resolves to the original dataset page;
 * 2) URLs that are provided by the data publisher;
 * 3) UUID that are provided by the data publisher and are NOT resolving to GBIF dataset page;
 * 4) Other identifiers that are provided by the data publisher.
 *
 * TODO As of 8 May 16 We print out all ids except 'GBIF_PORTAL', despite the goal above.
 * @param identifiers
 */
function processIdentifiers(identifiers) {
    var processedIdentifiers = [];
    var typeToDisplay = ['DOI', 'URL', 'UUID', 'LSID', 'FTP', 'UNKNOWN'];
    identifiers = identifiers.sort(function(a, b){
        return typeToDisplay.indexOf(a.type) - typeToDisplay.indexOf(b.type);
    });
    identifiers.forEach(function(id){
        if (typeToDisplay.indexOf(id.type) != -1) {
            var idObj = {};
            idObj.formattedString = id.type + ' ' + setAnchor(id.identifier);
            processedIdentifiers.push(idObj);
        }

        function setAnchor(str) {
            if (str.match('^(http|https|ftp)://')) {
                return '<a href="' + str + '">' + str + '</a>';
            }
            else {
                return str;
            }
        }
    });
    return processedIdentifiers;
}

function reconstructQueryFromPredicates(body) {
    var reconstructedResults = {
        offset: body.offset,
        limit: body.limit,
        endOfRecords: body.endOfRecords,
        count: body.count,
        results: []
    };
    var searchParameters = [
        { type: 'DATASET_KEY', label: 'Dataset Key'},
        { type: 'YEAR', label: 'Year'},
        { type: 'MONTH', label: 'Month'},
        { type: 'EVENT_DATE', label: 'Event date'},
        { type: 'LAST_INTERPRETED', label: 'Last interpreted'},
        { type: 'DECIMAL_LATITUDE', label: 'Decimal latitude'},
        { type: 'DECIMAL_LONGITUDE', label: 'Decimal longitude'},
        { type: 'COUNTRY', label: 'Country'},
        { type: 'CONTINENT', label: 'Continent'},
        { type: 'PUBLISHING_COUNTRY', label: 'Publishing country'},
        { type: 'ELEVATION', label: 'Elevation'},
        { type: 'DEPTH', label: 'Depth'},
        { type: 'INSTITUTION_CODE', label: 'Institution code'},
        { type: 'COLLECTION_CODE', label: 'Collection code'},
        { type: 'CATALOG_NUMBER', label: 'Catalog number'},
        { type: 'RECORDED_BY', label: 'Recorded by'},
        { type: 'RECORD_NUMBER', label: 'Record number'},
        { type: 'BASIS_OF_RECORD', label: 'Basis of record'},
        { type: 'TAXON_KEY', label: 'Taxon'},
        { type: 'KINGDOM_KEY', label: 'Kingdom'},
        { type: 'PHYLUM_KEY', label: 'Phylum'},
        { type: 'CLASS_KEY', label: 'Class'},
        { type: 'ORDER_KEY', label: 'Order'},
        { type: 'FAMILY_KEY', label: 'Family'},
        { type: 'GENUS_KEY', label: 'Genus'},
        { type: 'SUBGENUS_KEY', label: 'Subgenus'},
        { type: 'SPECIES_KEY', label: 'Species'},
        { type: 'SCIENTIFIC_NAME', label: 'Scientific name'},
        { type: 'HAS_COORDINATE', label: 'Has coordinate'},
        { type: 'GEOMETRY', label: 'Geometry'},
        { type: 'HAS_GEOSPATIAL_ISSUE', label: 'Has geospatial issue'},
        { type: 'ISSUE', label: 'Issue'},
        { type: 'TYPE_STATUS', label: 'Type status'},
        { type: 'MEDIA_TYPE', label: 'Media type'},
        { type: 'OCCURRENCE_ID', label: 'Occurrence ID'},
        { type: 'ESTABLISHMENT_MEANS', label: 'Establishment Means'}
    ];

    var parsePredicates = (function f(p, cGroup){
        if (p.key) {
            var typeGroup = {label: '', type: '', values: []};
            searchParameters.forEach(function(sp){
                if (sp.type == p.key) {
                    typeGroup.label = sp.label;

                    var exists = false;
                    cGroup.forEach(function(tg, i){
                        if (tg.label == typeGroup.label) {
                            exists = true;
                            cGroup[i].values.push({comparison: p.type, value: p.value});
                            cGroup[i].type = p.key;
                        }
                    });

                    if (exists == false) {
                        typeGroup.values.push({comparison: p.type, value: p.value});
                        typeGroup.type = p.key;
                        cGroup.push(typeGroup);
                    }
                }
            });
        }
        else if (p.predicates){
            p.predicates.forEach(function(pp) {
                f(pp, cGroup);
            });
        }
    });

    // http://www.gbif.org/occurrence/search?TAXON_KEY=9432&TAXON_KEY=5498&TAXON_KEY=9369&TAXON_KEY=6160&TAXON_KEY=2439923&TAXON_KEY=3240591&TAXON_KEY=2439920&TAXON_KEY=795&TAXON_KEY=2439881&TAXON_KEY=785&TAXON_KEY=731&TAXON_KEY=732&TAXON_KEY=798&TAXON_KEY=9418&TAXON_KEY=5489&TAXON_KEY=5219955&TAXON_KEY=5506&TAXON_KEY=5219946&TAXON_KEY=9619&COUNTRY=PA&COUNTRY=CO&COUNTRY=EC&COUNTRY=CR&COUNTRY=VE&HAS_COORDINATE=true&YEAR=2000%2C*
    function constructQueryUrl(cGroup) {
        var url = 'http://www.gbif.org/occurrence/search?';
        cGroup.forEach(function(cg, cgi){

            // First to check whether there is any comparison that is not "equal"
            // If yes, those need to be considered as a group.
            var multipleComparison = false;
            cg.values.forEach(function(v){
                if (v.comparison != 'equal') multipleComparison = true;
            });

            if (multipleComparison == true && cg.values.length == 2) {
                var lower, upper, processedValue;
                cg.values.forEach(function(v){
                    switch (v.comparison) {
                        case 'greaterThanOrEquals':
                            lower = v.value;
                            break;
                        case 'lessThanOrEquals':
                            upper = v.value;
                            break;
                    }
                });
                if (lower && upper == 'undefined') {
                    processedValue = lower + ',*';
                }
                else if (lower == 'undefined' && upper) {
                    processedValue = '*,' + upper;
                }
                else if (lower && upper) {
                    processedValue = lower + ',' + upper;
                }
                if (cgi != 0) url += '&';
                url += cg.type + '=' + encodeURIComponent(processedValue);
            }
            else {
                cg.values.forEach(function(v, vi) {
                    if (cgi != 0 || vi != 0) url += '&';
                    url += cg.type + '=' + v.value;
                });
            }
        });
        return url;
    }

    /**
     * Use the same logic of constructQueryUrl() but for preparing the HTML for the client side.
     * @param cGroup
     * @returns {string}
     */
    function humanReadableQuery(cGroup) {
        var table = [];
        cGroup.forEach(function(cg){
            var tableObj = {
                filterType: cg.label,
                filterValues: [],
                processedValue: ''
            };

            // First to check whether there is any comparison that is not "equal"
            // If yes, those need to be considered as a group.
            var multipleComparison = false;
            cg.values.forEach(function(v){
                if (v.comparison != 'equals') multipleComparison = true;
            });

            if (multipleComparison == true) {
                var lower, upper, processedValue;
                cg.values.forEach(function(v){
                    switch (v.comparison) {
                        case 'greaterThanOrEquals':
                            lower = v.value;
                            break;
                        case 'lessThanOrEquals':
                            upper = v.value;
                            break;
                    }
                });
                if (lower && upper == undefined) {
                    processedValue = '>=' + lower;
                }
                else if (lower == undefined && upper) {
                    processedValue = '<=' + upper;
                }
                else if (lower && upper) {
                    processedValue = lower + '-' + upper;
                }
                tableObj.filterValues.push(processedValue);
            }
            else {
                tableObj.filterValues = cg.values;
            }
            table.push(tableObj);
        });

        return table;
    }

    body.results.forEach(function(result) {
        var criteriaGroup = [];
        if (result.download.request.predicate) {
            parsePredicates(result.download.request.predicate, criteriaGroup);
        }

        var resultObj = {
            downloadKey: result.downloadKey,
            downloadDoi: result.download.doi,
            recordInvolved: result.numberRecords,
            datasetInvolved: result.download.numberDatasets,
            totalRecords: result.download.totalRecords,
            downloadLink: result.download.downloadLink,
            size: result.download.size,
            created: result.download.created,
            modified: result.download.modified,
            status: result.download.status,
            criteria: criteriaGroup,
            queryUrl: constructQueryUrl(criteriaGroup),
            queryTable: humanReadableQuery(criteriaGroup)
        };

        reconstructedResults.results.push(resultObj);
    });

    return reconstructedResults;
}

function processQueryTable(body, __) {
    var defer = Q.defer();
    var tasks = [];
    body.results.forEach(function(result, ri){
        var requestUrls = [];
        result.queryTable.forEach(function(row){
            switch (row.filterType) {
                case 'Taxon':
                    row.filterValues.forEach(function(v, vi){
                        requestUrls[vi] = api.speciesParsedName.url + v.value;
                    });
                    break;
                case 'Country':
                    row.filterValues.forEach(function(v){
                        v.value = __('country.' + v.value);
                    });
                    break;
                case 'Basis of record':
                    row.filterValues.forEach(function(v){
                        v.value = __('bor.' + v.value);
                    });
                    break;
            }
        });
        tasks[ri] = requestUrls;
    });

    var processedTaxonValuePromises = [];
    tasks.forEach(function(lists, i){
        processedTaxonValuePromises[i] = getTaxonName(lists);
    });

    Q.all(processedTaxonValuePromises).then(function(values){
        // add processed names to body
        values.forEach(function(v, vi){
            if (body.results[vi].queryTable && v.length != 0) {
                body.results[vi].queryTable.forEach(function(row, roi){
                    if (row.filterType == 'Taxon') {
                        body.results[vi].queryTable[roi].processedValue = v;
                    }
                });
            }
        });
        defer.resolve(body);
    }, function(err){
        defer.reject(new Error(err));
    });
    return defer.promise;
}

function getTaxonName(lists) {
    var deferred = Q.defer();
    var processedTaxonValue = '';
    async.map(lists, function(url, callback){
        request(url, function (error, response, body){
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body).canonicalName;
                callback(null, result);
            }
            else {
                callback(error || response.statusCode);
            }
        });
    }, function(err, results) {
        if (!err) {
            processedTaxonValue = results.join(', ');
            deferred.resolve(processedTaxonValue);
        }
        else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
}