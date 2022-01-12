'use strict';

var angular = require('angular'),
    utils = require('../../../shared/layout/html/utils/utils');

require('./directives/taxonomyBrowser/taxonomyBrowser.directive.js');
require('./directives/speciesDatasets.directive.js');
require('./directives/vernacularNames.directive.js');
require('./directives/nameUsages.directive.js');
require('./directives/treatment.directive.js');
require('./directives/wikidataIdentifiers.directive.js');
require('./directives/distributions.directive.js');
require('./directives/typeSpecimen.directive.js');
require('../../../components/iucnStatus/iucnStatus.directive.js');
require('../../../components/occurrenceCard/occurrenceCard.directive.js');
require('../../../components/scientificName/scientificName.directive.js');
require('./literature/literature.ctrl.js');

angular.module('portal').controller('speciesKey2Ctrl', speciesKey2Ctrl);

/** @ngInject */
// eslint-disable-next-line max-len
function speciesKey2Ctrl(
    $state,
    $stateParams,
    Species,
    $http,
    DwcExtension,
    OccurrenceSearch,
    SpeciesVernacularName,
    SpeciesSearch,
    SpeciesDescriptions,
    SpeciesMedia,
    SpeciesVerbatim,
    Dataset,
    SpeciesCombinations,
    // SpeciesDistributions,
    CitesApi,
    TaxonomySynonyms,
    suggestEndpoints,
    SpeciesTreatment,
    SpeciesTreatments,
    ResourceSearch,
    constantKeys,
    Page,
    PublisherExtended,
    MapCapabilities,
    BUILD_VERSION,
    LOCALE,
    $translate,
    $mdMedia
) {
    var vm = this;
    vm.$translate = $translate;
    Page.drawer(true);
    vm.$mdMedia = $mdMedia;
    vm.key = $stateParams.speciesKey;
    vm.$state = $state;
    vm.backboneKey = constantKeys.dataset.backbone;
    vm.$state = $state;
    vm.BUILD_VERSION = BUILD_VERSION;
    var literatureLimit = 25;
    vm.capabilities = MapCapabilities.get({taxonKey: vm.key});
    vm.species = Species.get({id: vm.key});
    vm.occurrences = OccurrenceSearch.query({taxon_key: vm.key});
    vm.vernacularName = SpeciesVernacularName.get({id: vm.key});
    vm.mappedOccurrences = OccurrenceSearch.query({
        taxon_key: vm.key,
        has_coordinate: true,
        has_geospatial_issue: false,
        limit: 0
    });
    vm.images = OccurrenceSearch.query({
        taxon_key: vm.key,
        media_type: 'stillImage',
        limit: 20
    });
    
    ResourceSearch.query({gbifTaxonKey: vm.key, contentType: 'literature', limit: literatureLimit, locale: LOCALE}, function(data) {
        vm.literature = data;
    }, function() {
        // TODO handle request error
    });

    SpeciesMedia.get({
        id: vm.key,
        media_type: 'stillImage',
        limit: 50
    })
        .$promise.then(function (data) {
            if (data.results) {
                data.results = data.results.filter(function (img) {
                    return img.identifier.indexOf('zenodo.org') === -1;
                });
            }
            vm.speciesImages = data;
        })
        .catch(vm.nonCriticalErrorHandler);

    vm.images.$promise.then(function (resp) {
        utils.attachImages(resp.results);
    });

    vm.isNub = false;

    vm.species.$promise.then(function (resp) {
        vm.criticalErrorHandler();
        Page.setTitle(vm.species.scientificName);
        vm.isSpeciesOrBelow = !!resp.speciesKey;
        vm.isFamilyOrAbove = !resp.speciesKey && !resp.genusKey;
        var searchRank = vm.isSpeciesOrBelow ? undefined : 'SPECIES';
        vm.subsumedSpecies = SpeciesSearch.query({
            highertaxon_key: vm.key,
            rank: searchRank,
            status: ['ACCEPTED', 'DOUBTFUL'],
            limit: 0
        });

        vm.dataset = Dataset.get({id: resp.datasetKey});
        vm.isNub = vm.species.datasetKey === vm.backboneKey;
        if (!vm.isNub) {
            vm.verbatim = SpeciesVerbatim.get({id: vm.key});
            vm.verbatim.$promise.then(function () {
                vm.verbatimHasExtensions =
                    Object.keys(vm.verbatim.extensions).length > 0;
                if (
                    vm.verbatim[
                        'http://purl.org/dc/terms/bibliographicCitation'
                    ]
                ) {
                    vm.species.bibliographicCitation =
                        vm.verbatim[
                            'http://purl.org/dc/terms/bibliographicCitation'
                        ];
                }
                if (vm.verbatim[
                    'http://rs.tdwg.org/dwc/terms/datasetName'
                ]) {
                    // see https://github.com/gbif/portal-feedback/issues/3560
                    vm.species.datasetName =
                        vm.verbatim[
                            'http://rs.tdwg.org/dwc/terms/datasetName'
                        ];
                }
                if (vm.verbatim[
                    'http://rs.tdwg.org/dwc/terms/datasetID'
                ]) {
                    vm.species.datasetID =
                        vm.verbatim[
                            'http://rs.tdwg.org/dwc/terms/datasetID'
                        ];
                }
            });
            // Treatments
            vm.speciesTreatment = SpeciesTreatment.get({id: vm.key});
            vm.speciesTreatment.$promise.then(function () {
                vm.hasTreatment = true;
            });
            vm.speciesTreatment.$promise.catch(function () {
                vm.hasTreatment = false;
            });
            vm.verbatim.$promise.catch(vm.nonCriticalErrorHandler);

            vm.dwcextensions = DwcExtension.get();
            vm.dwcextensions.$promise.catch(vm.nonCriticalErrorHandler);

            angular.element(document).ready(function () {
                vm.lightbox = new Lightbox();
                vm.lightbox.load();
            });
        } else {
            // is nub
            // get list of countries where listed as invasive according to GRIIS
            if (vm.isSpeciesOrBelow) {
                vm.invadedListLength = 3;
                $http
                    .get('/api/species/' + vm.key + '/invadedCountries')
                    .then(function (response) {
                        vm.invadedCountries = response.data;
                    })
                    .catch(function (response) {
                        // ignore error
                    });
            }
            // treatments if any
            vm.treatments = SpeciesTreatments.query({id: vm.key});
        }
        vm.isSynonym =
            typeof vm.species.taxonomicStatus !== 'undefined' &&
            vm.species.taxonomicStatus.indexOf('SYNONYM') > -1 &&
            vm.species.accepted &&
            vm.species.acceptedKey &&
            vm.species.acceptedKey !== vm.species.key;

        getCitesStatus(resp.kingdom, resp.canonicalName);
    });

    vm.occurrenceQuery = {taxon_key: vm.key};
    vm.descriptions = SpeciesDescriptions.get({id: vm.key, limit: 100});
    vm.combinations = SpeciesCombinations.query({id: vm.key});
    //  vm.distributions = SpeciesDistributions.query({id: vm.key, limit: 200});

    vm.species.$promise.then(function (resp) {
        if (!resp.synonym) {
            vm.synonyms = TaxonomySynonyms.query({
                datasetKey: resp.datasetKey,
                taxonKey: resp.key
            });
            vm.synonyms.$promise.catch(vm.nonCriticalErrorHandler);
        }
        if (vm.species.sourceTaxonKey) {
            vm.sourceTaxon = Species.get({id: vm.species.sourceTaxonKey});
            vm.sourceTaxon.$promise
                .then(function (sourceTx) {
                    vm.sourceTaxonExists = true;
                    vm.sourceTaxonDataset = Dataset.get({
                        id:
                            vm.sourceTaxon.constituentKey ||
                            vm.sourceTaxon.datasetKey
                    });
                    if (sourceTx.references) {
                        vm.sourceTaxonLink = sourceTx.references;
                    } else if (vm.species.nameType === 'OTU') {
                        SpeciesVerbatim.get({
                            id: vm.species.sourceTaxonKey
                        }).$promise.then(function (sourceTaxonVerbatim) {
                            var references =
                                sourceTaxonVerbatim[
                                    'http://purl.org/dc/terms/references'
                                ];
                            if (references.substring(0, 10) === 'dx.doi.org') {
                                vm.sourceTaxonLink = 'https://' + references;
                                // PlutoF resolves DOIs in a away that prevents the browser "back" button to take us back to gbif.org, therefore a target _blank here
                                vm.refLinkTarget = '_blank';
                            }
                        });
                    }
                })
                .catch(function () {
                    vm.sourceTaxonExists = false;
                });
        } else if (vm.species.constituentKey) {
            vm.sourceTaxonDataset = Dataset.get({
                id: vm.species.constituentKey
            });
        }
    });
    // Disable Open Tree Of Life
    /* vm.species.$promise.then(function() {
         $http.get('/api/otl/ottid', {
             params: {
                 canonicalName: vm.species.canonicalName,
                 nubKey: (vm.species.datasetKey === vm.backboneKey) ? vm.species.key : vm.species.nubKey
             }
         }).then(function(response) {
             vm.ott_id = response.data.ott_id;
         });
     }); */

    function getCitesStatus(kingdom, name) {
        vm.cites = CitesApi.get({
            kingdom: kingdom,
            name: name
        });
    }

    vm.getSuggestions = function (val) {
        return $http
            .get(suggestEndpoints.taxon, {
                params: {
                    q: val,
                    datasetKey: vm.species.datasetKey,
                    limit: 10
                }
            })
            .then(function (response) {
                return response.data;
            });
    };

    vm.typeaheadSelect = function (item) {
        //  model, label, event
        $state.go(
            $state.current,
            {speciesKey: item.key},
            {inherit: false, notify: true, reload: false}
        );
    };

    vm.hasCriticalError;
    vm.criticalErrorHandler = function () {
        vm.hasCriticalError = true;
    };
    vm.hasNonCriticalError;
    vm.nonCriticalErrorHandler = function (err) {
        if (err.status >= 500) {
            vm.hasNonCriticalError = true;
        }
    };
    vm.species.$promise.catch(vm.criticalErrorHandler);
    vm.mappedOccurrences.$promise.catch(vm.criticalErrorHandler);
    vm.occurrences.$promise.catch(vm.criticalErrorHandler);
    vm.capabilities.$promise.catch(vm.criticalErrorHandler);

    vm.vernacularName.$promise.catch(vm.nonCriticalErrorHandler);
    // vm.speciesImages.$promise.catch(vm.nonCriticalErrorHandler);
    vm.images.$promise.catch(vm.nonCriticalErrorHandler);
    vm.descriptions.$promise.catch(vm.nonCriticalErrorHandler);
    vm.combinations.$promise.catch(vm.nonCriticalErrorHandler);
    // vm.distributions.$promise.catch(vm.nonCriticalErrorHandler);
    // vm.cites.$promise.catch(vm.nonCriticalErrorHandler); //broken cites isn't worth mentioning
    // vm.sourceTaxon.$promise.catch(vm.nonCriticalErrorHandler); //this is often failing when the ref taxon has been deleted
}

module.exports = speciesKey2Ctrl;
