'use strict';

var angular = require('angular'),
    ol = require('openlayers'),
    _ = require('lodash'),
    projections = require('../../../../components/map/mapWidget/projections');

require('../../../../components/map/mapWidget/map.constants');

angular
    .module('portal')
    .directive('occPerCountry', occPerCountryDirective);

/** @ngInject */
function occPerCountryDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/pages/participant/country/occPerCountry/occPerCountry.html?v=' + BUILD_VERSION,
        scope: {
            filter: '='
        },
        link: mapLink,
        controller: occPerCountry,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function occPerCountry($scope, $timeout, enums, $httpParamSerializer, baseMaps) {
        var vm = this;
        vm.styleBreaks = {
            breakpoints: [0, 700],
            classes: ['isSmall', 'isLarge']
        };
        var map;
        $scope.create = function (element) {
            //var mapElement = element[0].querySelector('.occPerCountry__mapArea');
            //var proj = projections.EPSG_3575;
            //map = new ol.Map({
            //    target: mapElement,
            //    logo: false,
            //    view: new ol.View({
            //        center: [0, 0],
            //        zoom: 0
            //    }),
            //    interactions: ol.interaction.defaults({mouseWheelZoom:false})
            //});
            //map.addLayer(proj.getBaseLayer(_.assign({}, {style: 'gbif-light'})));
        };
    }
}

module.exports = occPerCountryDirective;
