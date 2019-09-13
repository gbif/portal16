'use strict';

var angular = require('angular'),
    moment = require('moment'),
    _ = require('lodash'),
  //  utils = require('../../../shared/layout/html/utils/utils'),
    fixedUtil = require('../../../dataset/key/main/submenu');
require('../../../../components/map/featureMap/featureMap.directive');


angular
    .module('portal')
    .controller('dataValidatorDocumentCtrl', dataValidatorDocumentCtrl);

/** @ngInject */
function dataValidatorDocumentCtrl($http, $state, $stateParams, Page, env, $translate) {
    var vm = this;
    vm.$state = $state;
    vm.dataApi = env.dataApi;
    $translate('validation.dataValidator').then(function(title) {
        Page.setTitle(title);
    });
    Page.drawer(false);

    vm.getEML = function(jobid) {
        $http.get(
            vm.dataApi + 'validator/jobserver/output/' + jobid + '/DATASET_OBJECT', {params: {nonse: Math.random()}}

        ).success(function(data) {
            vm.eml = data.content;
            console.log(data);
            if (_.get(vm.eml, 'temporalCoverages')) {
                vm.eml.temporalCoverages.forEach(function(c) {
                    if (c.end) {
                        c.end_date = moment(c.end).toISOString();
                    }
                    if (c.start) {
                        c.start_date = moment(c.start).toISOString();
                    }
                    if (c.period) {
                        c.period_date = moment(c.period).toISOString();
                    }
                });
            }
            vm.coverages = geoJsonFromCoverage(vm.eml.geographicCoverages);
            vm.originators = _.filter(vm.eml.contacts, function(c) {
                return c.type === 'ORIGINATOR';
            });
        }).error(function(err, status, headers) { // data, status, headers, config

           // TODO
        });
    };

    vm.jobid = $stateParams.jobid;

    vm.getEML(vm.jobid);


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

    function getFeature(coverage) {
        var b = coverage.boundingBox;
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

    vm.attachTabListener = function() {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function() {
        fixedUtil.updateMenu();
    };
}

module.exports = dataValidatorDocumentCtrl;

