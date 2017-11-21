'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    ol = require('openlayers'),
    Progress = require('../mapWidget/progress'),
    projections = require('../mapWidget/projections');

require('../basic/gbTileLayer');

angular
    .module('portal')
    .directive('featureMap', featureMapDirective);

/** @ngInject */
function featureMapDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/map/featureMap/featureMap.html?v=' + BUILD_VERSION,
        scope: {
            features: '=',
            mapstyle: '='
        },
        link: mapLink,
        controller: featureMap,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function featureMap($scope) {
        var vm = this,
            map,
            featureLayer;

        vm.projection = {
            epsg: 'EPSG:3857'
        };

        $scope.create = function (element) {
            map = createMap(element);
            changeBaseMap(map);
            addFeatureLayer();
        };

        vm.interactionWithMap = function () {
            if (!vm.hasInterActedWithMap) {
                map.scrollWheelZoom.enable();
                vm.hasInterActedWithMap = true;
            }
        };

        vm.controls = {
            filters: false,
            style: false,
            projection: false
        };

        $scope.$watch(function() { return vm.features; }, function() {
            if (map && vm.features) {
                addFeatureLayer();
            }
        });

        function addFeatureLayer() {
            if (!featureLayer && _.get(vm.features, 'features.length', 0) > 0) {
                featureLayer = setFeatures(map, vm.features);
            }
        }
    }
}


function createMap(element) {
    var mapElement = element[0].querySelector('.mapWidget__mapArea');
    var baseMapStyle = {style: 'gbif-light'};

    var interactions = ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false, mouseWheelZoom:false});
    var map = new ol.Map({
        target: mapElement,
        logo: false,
        controls: ol.control.defaults({zoom:false}),
        interactions: interactions
    });

    var currentProjection = projections.EPSG_4326;
    map.setView(currentProjection.getView(0, 0, 1));
    //if (currentProjection.fitExtent) {
    //    map.getView().fit(currentProjection.fitExtent, {constrainResolution: false, maxZoom: 12, minZoom: 0});
    //}

    map.addLayer(currentProjection.getBaseLayer(_.assign({}, baseMapStyle, {})));

    //var map = L.map(mapElement, {
    //    crs: L.CRS.EPSG4326,
    //    scrollWheelZoom: false
    //});
    window.map = map;
    return map;
}


function changeBaseMap(map) {
    // HTTP URL is                            http://{s}.ashbu.cartocdn.com/timrobertson100/api/v1/map/3a222bf37b6c105e0c7c6e3a2a1d6ecc:1467147536105/0/{z}/{x}/{y}.png?cache_policy=persist
    //var baseMap = L.tileLayer('https://cartocdn-ashbu.global.ssl.fastly.net/timrobertson100/api/v1/map/3a222bf37b6c105e0c7c6e3a2a1d6ecc:1467147536105/0/{z}/{x}/{y}.png?cache_policy=persist', {
    //    attribution: "&copy; <a href='https://www.cartodb.com/'>CartoDB</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>"
    //});
    //baseMap.addTo(map);
}

function setFeatures(map, features){
    //var layer = L.geoJson(features, {
    //    onEachFeature: function (feature, layer) {
    //        layer.bindPopup(JSON.stringify(feature.properties.boundingBox, null, 4));
    //    }
    //});
    //layer.addTo(map);
    //map.fitBounds(layer.getBounds());
    //return layer;
}

module.exports = featureMapDirective;
