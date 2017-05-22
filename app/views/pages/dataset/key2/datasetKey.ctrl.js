'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    utils = require('../../../shared/layout/html/utils/utils'),
    submenuUpdate = require('./main/submenu');

require('./project/datasetProject.ctrl');
require('./stats/datasetStats.ctrl');
require('./taxonomy/datasetTaxonomy.ctrl');
require('../../../components/contactsCard/contacts.directive');
require('../../../components/doi/doi.directive');
require('../../../components/license/license.directive');
require('../../../components/map/featureMap/featureMap.directive');

angular
    .module('portal')
    .controller('datasetKey2Ctrl', datasetKey2Ctrl);

/** @ngInject */
function datasetKey2Ctrl($timeout, $state, $stateParams, OccurrenceSearch, SpeciesSearch, DatasetExtended, Publisher) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.$state = $state;
    vm.dataset = DatasetExtended.get({key:vm.key});

    vm.occurrences = OccurrenceSearch.query({dataset_key: vm.key, limit:0});
    vm.images = OccurrenceSearch.query({dataset_key: vm.key, media_type:'StillImage'});
    vm.images.$promise.then(function(resp){
        utils.attachImages(resp.results);
    });
    vm.withCoordinates = OccurrenceSearch.query({dataset_key: vm.key, has_coordinate: true, has_geospatial_issue: false, limit:0 });
    vm.withoutTaxon = OccurrenceSearch.query({dataset_key: vm.key, issue: 'TAXON_MATCH_NONE', limit:0 });
    vm.withYear = OccurrenceSearch.query({dataset_key: vm.key, year: '*,3000', limit:0 });

    vm.taxa = SpeciesSearch.query({dataset_key: vm.key, facet: 'rank', limit:0 });

    vm.dataset.$promise.then(submenuUpdate);
    vm.dataset.$promise.then(function(){
        vm.publisher = Publisher.get({id: vm.dataset.publishingOrganizationKey});
        vm.coverages = geoJsonFromCoverage(vm.dataset.geographicCoverages);
    });

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
            return geoJson;
        } else {
            return false;
        }
    }

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
