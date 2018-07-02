'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    utils = require('../../../shared/layout/html/utils/utils'),
    fixedUtil = require('./main/submenu');

require('./project/datasetProject.ctrl');
require('./stats/datasetStats.ctrl');
require('./constituents/datasetConstituents.ctrl');
// require('./taxonomy/datasetTaxonomy.ctrl');
require('./activity/datasetActivity.ctrl');
require('./event/event.ctrl');
require('../../../components/contact/contact.directive');
require('../../../components/doi/doi.directive');
require('../../../components/license/license.directive');
require('../../../components/map/featureMap/featureMap.directive');

angular
    .module('portal')
    .controller('datasetKeyCtrl', datasetKeyCtrl);

/** @ngInject */
// eslint-disable-next-line max-len
function datasetKeyCtrl($scope, $q, $http, $timeout, $state, $stateParams, $sessionStorage, DatasetCurrentCrawlingStatus, DatasetEventList, OccurrenceSearch, SpeciesRoot, SpeciesSearch, ResourceSearch, Dataset, DatasetExtended, DatasetConstituents, Publisher, Installation, DatasetMetrics, DatasetProcessSummary, $anchorScroll, constantKeys, Page, MapCapabilities, env) {
    var vm = this;
    Page.setTitle('Dataset');
    Page.drawer(false);

    vm.key = $stateParams.key;
    vm.capabilities = MapCapabilities.get({datasetKey: vm.key});
    vm.$state = $state;
    vm.dataset = DatasetExtended.get({key: vm.key});
    vm.metrics = DatasetMetrics.get({key: vm.key});
    vm.processSummary = DatasetProcessSummary.get({key: vm.key});
    vm.currentCrawlingStatus = DatasetCurrentCrawlingStatus.get({key: vm.key});
    vm.backboneKey = constantKeys.dataset.backbone;
    vm.ebirdKey = constantKeys.dataset.eod;
    vm.backboneNetworkKey = constantKeys.network.backboneNetwork;
    vm.dataApi = env.dataApi;
    vm.constituents = DatasetConstituents.get({key: vm.key, limit: 0});


   // vm.constituents = DatasetConstituents.get({key: vm.key, limit: 0});
    vm.isPartOfCOL = constantKeys.dataset.col === vm.key;
    vm.isBackbone = constantKeys.dataset.backbone === vm.key;
    vm.literature = ResourceSearch.query({contentType: 'literature', gbifDatasetKey: vm.key, limit: 0});

    vm.profile = $sessionStorage.user;

    vm.occurrences = OccurrenceSearch.query({dataset_key: vm.key, limit: 0});
    vm.images = OccurrenceSearch.query({dataset_key: vm.key, media_type: 'StillImage'});
    vm.images.$promise.then(function(resp) {
        utils.attachImages(resp.results);
    });
    vm.withCoordinates = OccurrenceSearch.query({
        dataset_key: vm.key,
        has_coordinate: true,
        has_geospatial_issue: false,
        limit: 0
    });
    vm.withoutTaxon = OccurrenceSearch.query({dataset_key: vm.key, issue: 'TAXON_MATCH_NONE', limit: 0});
    vm.withYear = OccurrenceSearch.query({dataset_key: vm.key, year: '*,3000', limit: 0});

    // Get first page of paginated events - currently from the proxy API that use occurrence facets to estimate it.  This is not ideal, but a fragile workaround
    vm.hasEvents = false;
    vm.changeEventPage = function(offset) {
        vm.events = DatasetEventList.query({datasetKey: vm.key, offset: offset, limit: 10});
        vm.events.$promise
            .then(function(response) {
                vm.hasEvents = vm.hasEvents || response.results.length > 0;
            })
            .catch(function() {
                // ignore and use promise for user feedback instead
            });
    };
    vm.changeEventPage(0);

    // get total event count if below proxy apis threshold (1000 at time of writing)
    $http.get('/api/dataset/' + vm.key + '/eventCount')
        .then(function(response) {
            vm.eventCount = response.data.endOfRecords ? response.data.count : undefined;
        })
        .catch(function() {
            // ignore
        });

    vm.taxa = SpeciesSearch.query({dataset_key: vm.key, origin: 'SOURCE', facet: 'status', limit: 0});
    vm.stats = {};
    vm.taxa.$promise.then(function() {
        vm.stats.accepted = _.get(vm.taxa, 'facets.STATUS.counts.ACCEPTED.count', 0);
        vm.stats.synonyms = _.get(vm.taxa, 'facets.STATUS.counts.HETEROTYPIC_SYNONYM.count', 0) +
                            _.get(vm.taxa, 'facets.STATUS.counts.SYNONYM.count', 0) +
                            _.get(vm.taxa, 'facets.STATUS.counts.PROPARTE_SYNONYM.count', 0) +
                            _.get(vm.taxa, 'facets.STATUS.counts.HOMOTYPIC_SYNONYM.count', 0);
    });

    // if this dataset is ebird then show a list of publishing countries - relates to https://github.com/gbif/portal16/issues/641.
    // It has been decided to hardcode a special rule for ebird. An easy generic way would be to always get publishing countries and show the list if larger than 1
    if (vm.ebirdKey === vm.key) {
        vm.publishingCountries = OccurrenceSearch.query({dataset_key: vm.key, facet: 'publishing_country', limit: 0, facetLimit: 1000});
    }

    vm.rootElements = SpeciesRoot.get({key: vm.key, limit: 2});

    vm.dataset.$promise.then(function() {
        Page.setTitle(vm.dataset.title);
        vm.publisher = Publisher.get({id: vm.dataset.publishingOrganizationKey});
        vm.installation = Installation.get({id: vm.dataset.installationKey});
        vm.installation.$promise.then(function() {
            vm.host = Publisher.get({id: vm.installation.organizationKey});
        });
        vm.parentDataset = Dataset.get({id: vm.dataset.parentDatasetKey});
        if (vm.dataset.duplicateOfDatasetKey) {
            vm.duplicateOfDataset = Dataset.get({id: vm.dataset.duplicateOfDatasetKey});
        }
        vm.coverages = geoJsonFromCoverage(vm.dataset.geographicCoverages);
        vm.originalArchive = getOriginalDarwinCoreArchive(vm.dataset.endpoints);
        vm.dataset._endpoints = _.filter(vm.dataset.endpoints, 'url');
        vm.dataset._identifiers = _.filter(vm.dataset.identifiers, function(e) {
            return ['DOI', 'URL', 'LSID', 'FTP', 'UNKNOWN'].indexOf(e.type) > -1;
        });
        $timeout(function() {
            $anchorScroll();
        });
        vm.projectEmpty = !vm.dataset.project || (!vm.dataset.project.abstract && !vm.dataset.project.studyAreaDescription && !vm.dataset.project.designDescription && !vm.dataset.project.funding);
        vm.isPartOfCOL = vm.isPartOfCOL || constantKeys.dataset.col === vm.dataset.parentDatasetKey;

        var projectId = _.get(vm.dataset, 'project.identifier');

        if (projectId) {
            vm.projects = ResourceSearch.query({contentType: 'project', projectId: projectId, limit: 1});
        }
        vm.orphanStatus = getOrphanStatus(vm.dataset);

        // checkIfUserIsContact();
    });

    // function checkIfUserIsContact() {
    //     if (vm.profile.email) {
    //         var contacts = _.get(vm.dataset, 'contacts', []);
    //         vm.matchedContact = _.find(contacts, function(contact){
    //             return contact.email == vm.profile.email || contact.email.indexOf(vm.profile.email) > -1;
    //         });
    //     }
    // }

    function getOriginalDarwinCoreArchive(endpoints) {
        endpoints = endpoints || [];
        return endpoints.find(function(e) {
            return e.type == 'DWC_ARCHIVE';
        });
    }

    function getOrphanStatus(dataset) {
      var orphanState = _.find(dataset.machineTags || [], {namespace: 'orphans.gbif.org', name: 'status'});
      return orphanState ? orphanState.value : undefined;
    }

    function geoJsonFromCoverage(geographicCoverages) {
        var geoJson = {
            'type': 'FeatureCollection',
            'features': []
        };
        if (_.isArray(geographicCoverages)) {
            geographicCoverages.forEach(function(e) {
                if (!_.get(e, 'boundingBox.globalCoverage', true)) {
                    geoJson.features.push(getFeature(e));
                }
            });
            if (geoJson.features.length > 0) {
                return geoJson;
            }
        }
        return false;
    }

    // for adding roles to the authors in the top
    // vm.getRoles = function (contact) {
    //    var roles = '';
    //    contact.roles.forEach(function (e, i) {
    //        roles += i === 0 ? e : ', ' + e;
    //    });
    //    return roles;
    // };

    vm.attachTabListener = function() {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function() {
        fixedUtil.updateMenu();
    };

    function getFeature(coverage) {
        var b = coverage.boundingBox;
        if (b.minLongitude > b.maxLongitude) {
            b.maxLongitude += 360;
        }
        return {
            'type': 'Feature',
            'properties': {
                description: coverage.description,
                boundingBox: coverage.boundingBox
            },
            'geometry': {
                'type': 'Polygon',
                'coordinates': [
                    [
                        [
                            b.minLongitude,
                            b.minLatitude
                        ],
                        [
                            b.maxLongitude,
                            b.minLatitude
                        ],
                        [
                            b.maxLongitude,
                            b.maxLatitude
                        ],
                        [
                            b.minLongitude,
                            b.maxLatitude
                        ],
                        [
                            b.minLongitude,
                            b.minLatitude
                        ]
                    ]
                ]
            }
        };
    }

    function updateSyncStatus() {
        $q.all([vm.occurrences.$promise, vm.processSummary.$promise])
            .then(function() {
                var offBy = Math.abs((vm.occurrences.count / _.get(vm, 'processSummary.lastDataChange.fragmentsReceived', vm.occurrences.count)) - 1);
                vm.isOutOfSync = offBy > 0.1;
            });
    }
    updateSyncStatus();

    vm.range = function(n) {
        return new Array(n);
    };

    function checkCrawlStatus() {
        if (vm.crawlingState !== 'FINISHED') {
            DatasetCurrentCrawlingStatus.get({key: vm.key}).$promise
                .then(function(response) {
                    vm.currentCrawlingStatus = response;
                    $timeout(checkCrawlStatus, 10000);
                    if (vm.currentCrawlingStatus.isInQueue) {
                        vm.crawlingState = 'IN_QUEUE';
                    }
                    if (!vm.currentCrawlingStatus.isInQueue && vm.crawlingState == 'IN_QUEUE') {
                        vm.crawlingState = 'FINISHED';
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    }

    vm.isTrustedContact = false;
    function checkIfTrustedContact() {
        $http.get('/api/dataset/' + vm.key + '/permissions')
            .then(function(response) {
                vm.componentHealth = _.get($sessionStorage, 'notifications.components');
                vm.processSummary = DatasetProcessSummary.get({key: vm.key, _cacheBust: Date.now()});
                // prepareTrustedBrakdown();
                vm.isTrustedContact = response.data.isTrustedContact;
            }, function() {
                // ignore error and simply don't show the user
            });
    }
    checkIfTrustedContact();

    vm.crawlingState = 'FINISHED';
    vm.startCrawling = function() {
        if (vm.crawlingState != 'FINISHED') {
            return; // to avoid starting it twice
        }
        vm.crawlingState = 'STARTED';
        $http.post('/api/dataset/' + vm.key + '/crawl')
            .then(function() {
                checkCrawlStatus();
            }, function() {
                vm.crawlingState = 'FAILED';
            });
    };

    // stop checking for crawl status if the user leaves the page
    $scope.$on('$stateChangeStart', function() {
        vm.crawlingState = 'FINISHED';
    });
}

module.exports = datasetKeyCtrl;

