'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    utils = require('../../../shared/layout/html/utils/utils'),
    fixedUtil = require('./main/submenu');

require('./project/datasetProject.ctrl');
require('./stats/datasetStats.ctrl');
//require('./taxonomy/datasetTaxonomy.ctrl');
require('./activity/datasetActivity.ctrl');
require('../../../components/contactsCard/contacts.directive');
require('../../../components/doi/doi.directive');
require('../../../components/license/license.directive');
require('../../../components/map/featureMap/featureMap.directive');

angular
    .module('portal')
    .controller('datasetKey2Ctrl', datasetKey2Ctrl);

/** @ngInject */
function datasetKey2Ctrl($state, $stateParams, OccurrenceSearch, SpeciesSearch, DatasetExtended, Publisher, Installation, DatasetMetrics) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.$state = $state;
    vm.dataset = DatasetExtended.get({key: vm.key});
    vm.metrics = DatasetMetrics.get({key: vm.key});

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

    vm.taxa = SpeciesSearch.query({dataset_key: vm.key, facet: 'rank', limit: 0});

    vm.dataset.$promise.then(function () {
        vm.publisher = Publisher.get({id: vm.dataset.publishingOrganizationKey});
        vm.installation = Installation.get({id: vm.dataset.installationKey});
        vm.installation.$promise.then(function () {
            vm.host = Publisher.get({id: vm.installation.organizationKey});
        });
        vm.coverages = geoJsonFromCoverage(vm.dataset.geographicCoverages);
        vm.originalArchive = getOriginalDarwinCoreArchive(vm.dataset.endpoints);
    });

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
}

module.exports = datasetKey2Ctrl;
