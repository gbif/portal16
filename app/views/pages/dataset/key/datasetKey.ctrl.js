'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    utils = require('../../../shared/layout/html/utils/utils'),
    fixedUtil = require('./main/submenu');

require('./project/datasetProject.ctrl');
require('./stats/datasetStats.ctrl');
require('./constituents/datasetConstituents.ctrl');
//require('./taxonomy/datasetTaxonomy.ctrl');
require('./activity/datasetActivity.ctrl');
require('../../../components/contact/contact.directive');
require('../../../components/doi/doi.directive');
require('../../../components/license/license.directive');
require('../../../components/map/featureMap/featureMap.directive');

angular
    .module('portal')
    .controller('datasetKeyCtrl', datasetKeyCtrl);

/** @ngInject */
function datasetKeyCtrl($http, $timeout, $interval, $state, $stateParams, $sessionStorage, DatasetCurrentCrawlingStatus, OccurrenceSearch, SpeciesRoot, SpeciesSearch, ResourceSearch, Dataset, DatasetExtended, DatasetConstituents, Publisher, Installation, DatasetMetrics, DatasetProcessSummary, $anchorScroll, constantKeys, Page, MapCapabilities, env) {
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
    vm.backboneNetworkKey = constantKeys.network.backboneNetwork;
    vm.dataApi = env.dataApi;
    vm.constituents =  DatasetConstituents.get({key: vm.key, limit: 0});


   // vm.constituents = DatasetConstituents.get({key: vm.key, limit: 0});
    vm.isPartOfCOL = constantKeys.dataset.col === vm.key;
    vm.isBackbone = constantKeys.dataset.backbone === vm.key;
    vm.literature = ResourceSearch.query({contentType: 'literature', gbifDatasetKey: vm.key, limit: 0});

    vm.profile = $sessionStorage.user;

    vm.occurrences = OccurrenceSearch.query({dataset_key: vm.key, limit: 0});
    vm.images = OccurrenceSearch.query({dataset_key: vm.key, media_type: 'StillImage'});
    vm.images.$promise.then(function (resp) {
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

    vm.taxa = SpeciesSearch.query({dataset_key: vm.key, origin: 'SOURCE', facet: 'status', limit: 0});
    vm.stats = {};
    vm.taxa.$promise.then(function(){
        vm.stats.accepted = _.get(vm.taxa, 'facets.STATUS.counts.ACCEPTED.count', 0);
        vm.stats.synonyms = _.get(vm.taxa, 'facets.STATUS.counts.HETEROTYPIC_SYNONYM.count', 0) +
                            _.get(vm.taxa, 'facets.STATUS.counts.SYNONYM.count', 0) +
                            _.get(vm.taxa, 'facets.STATUS.counts.PROPARTE_SYNONYM.count', 0) +
                            _.get(vm.taxa, 'facets.STATUS.counts.HOMOTYPIC_SYNONYM.count', 0);
    });

    vm.rootElements = SpeciesRoot.get({key: vm.key, limit: 2});

    vm.dataset.$promise.then(function () {
        Page.setTitle(vm.dataset.title);
        vm.publisher = Publisher.get({id: vm.dataset.publishingOrganizationKey});
        vm.installation = Installation.get({id: vm.dataset.installationKey});
        vm.installation.$promise.then(function () {
            vm.host = Publisher.get({id: vm.installation.organizationKey});
        });
        vm.parentDataset = Dataset.get({id: vm.dataset.parentDatasetKey});
        if (vm.dataset.duplicateOfDatasetKey) {
            vm.duplicateOfDataset = Dataset.get({id: vm.dataset.duplicateOfDatasetKey});
        }
        vm.coverages = geoJsonFromCoverage(vm.dataset.geographicCoverages);
        vm.originalArchive = getOriginalDarwinCoreArchive(vm.dataset.endpoints);
        vm.dataset._endpoints = _.filter(vm.dataset.endpoints, 'url');
        vm.dataset._identifiers = _.filter(vm.dataset.identifiers, function(e){
            return ['DOI', 'URL', 'LSID', 'FTP', 'UNKNOWN'].indexOf(e.type) > -1;
        });
        $timeout(function(){
            $anchorScroll();
        });
        vm.projectEmpty = !vm.dataset.project || (!vm.dataset.project.studyAreaDescription && !vm.dataset.project.designDescription && !vm.dataset.project.funding);
        vm.isPartOfCOL = vm.isPartOfCOL || constantKeys.dataset.col === vm.dataset.parentDatasetKey;

        var projectId = _.get(vm.dataset, 'project.identifier');

        if (projectId) {
            vm.projects = ResourceSearch.query({contentType: 'project', projectId: projectId, limit: 1});
        }

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
        return endpoints.find(function (e) {
            return e.type == 'DWC_ARCHIVE';
        });
    }

    function geoJsonFromCoverage(geographicCoverages) {
        var geoJson = {
            "type": "FeatureCollection",
            "features": []
        };
        if (_.isArray(geographicCoverages)) {
            geographicCoverages.forEach(function (e) {
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

    //for adding roles to the authors in the top
    //vm.getRoles = function (contact) {
    //    var roles = '';
    //    contact.roles.forEach(function (e, i) {
    //        roles += i === 0 ? e : ', ' + e;
    //    });
    //    return roles;
    //};

    vm.attachTabListener = function () {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function () {
        fixedUtil.updateMenu();
    };

    function getFeature(coverage) {
        var b = coverage.boundingBox;
        if (b.minLongitude > b.maxLongitude) {
            b.maxLongitude += 360;
        }
        return {
            "type": "Feature",
            "properties": {
                description: coverage.description,
                boundingBox: coverage.boundingBox
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
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

    vm.range = function(n){
        return new Array(n);
    };

    function checkCrawlStatus() {
        DatasetCurrentCrawlingStatus.get({key: vm.key}).$promise
        .then(function(response){
            vm.currentCrawlingStatus = response;
            $interval(checkCrawlStatus, 30000, 15);
        })
        .catch(function(err){
            console.log(err);
        });
    }

    vm.isTrustedContact = false;
    function checkIfTrustedContact(){
        $http.get('/api/dataset/' + vm.key + '/permissions')
            .then(function(response){
                vm.componentHealth = _.get($sessionStorage, 'notifications.components');
                vm.processSummary = DatasetProcessSummary.get({key: vm.key, _cacheBust: Date.now()});
                //prepareTrustedBrakdown();
                vm.isTrustedContact = response.data.isTrustedContact;
            }, function(){
                //ignore error and simply don't show the user
            });
    }
    checkIfTrustedContact();

    vm.startCrawling = function(){
        if (vm.crawlingStarted) {
            return; // to avoid starting it twice
        }
        vm.crawlingStarted = true;
        $http.post('/api/dataset/' + vm.key + '/crawl')
            .then(function(){
                vm.crawlingFailed = false;
                $timeout(checkCrawlStatus, 1000);
                $interval(checkCrawlStatus, 3000, 2);
            }, function(){
                vm.crawlingFailed = true;
            });
    };

    //function prepareTrustedBrakdown(){
    //    vm.crawlLabels = ['Normal', 'Not modified', 'Aborted', 'Aborted by user', 'unknown'];
    //    vm.crawlData = [1, 7, 2];
    //    vm.crawlColors = ['#61a861', '#74b974', '#ff6347', '#ffc247', '#bbb'];
    //    vm.crawlOptions = {
    //        responsive: true,
    //        maintainAspectRatio: false
    //    };
    //    vm.processSummary = DatasetProcessSummary.get({key: vm.key, _cacheBust: Date.now()});
    //    vm.processSummary.$promise.then(function(response){
    //        var NORMAL = (response.stats.NORMAL || 0);
    //        var NOT_MODIFIED = (response.stats.NOT_MODIFIED || 0);
    //        var ABORT = (response.stats.ABORT || 0);
    //        var USER_ABORT = (response.stats.USER_ABORT || 0);
    //        var UNKNOWN = (response.stats.UNKNOWN || 0);
    //        vm.crawlData = [NORMAL, NOT_MODIFIED, ABORT, USER_ABORT, UNKNOWN];
    //    });
    //}

}

module.exports = datasetKeyCtrl;

