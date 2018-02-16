'use strict';

let angular = require('angular'),
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
    let directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/map/featureMap/featureMap.html?v=' + BUILD_VERSION,
        scope: {
            features: '=',
            mapStyle: '=',
        },
        link: mapLink,
        controller: featureMap,
        controllerAs: 'vm',
        bindToController: true,
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function featureMap($scope) {
        let vm = this,
            map,
            featureLayer;

        vm.styleBreaks = {
            breakpoints: [0, 700],
            classes: ['isSmall', 'isLarge'],
        };

        $scope.create = function(element) {
            map = createMap(element, vm.mapStyle);
            addFeatureLayer();
        };

        vm.interactionWithMap = function() {
            if (!vm.hasInterActedWithMap) {
                map.scrollWheelZoom.enable();
                vm.hasInterActedWithMap = true;
            }
        };

        $scope.$watch(function() {
 return vm.features;}, function() {
            if (map && vm.features) {
                addFeatureLayer();
            }
        });

        function addFeatureLayer() {
            if (!featureLayer && _.get(vm.features, 'features.length', 0) > 0) {
                featureLayer = setFeatures(map, vm.features);
            }
        }

        vm.zoomIn = function() {
            let view = map.getView();
            view.setZoom(view.getZoom() + 1);
        };

        vm.zoomOut = function() {
            let view = map.getView();
            view.setZoom(view.getZoom() - 1);
        };
    }
}


function createMap(element, style) {
    let mapElement = element[0].querySelector('.mapWidget__mapArea');
    let baseMapStyle = {style: style || 'gbif-light'};

    let interactions = ol.interaction.defaults({altShiftDragRotate: false, pinchRotate: false, mouseWheelZoom: false});
    let map = new ol.Map({
        target: mapElement,
        logo: false,
        controls: ol.control.defaults({zoom: false}),
        interactions: interactions,
    });

    let currentProjection = projections.EPSG_4326;
    map.setView(currentProjection.getView(0, 0, 1));
    if (currentProjection.fitExtent) {
        map.getView().fit(currentProjection.fitExtent, {constrainResolution: false, maxZoom: 12, minZoom: 0});
    }

    map.addLayer(currentProjection.getBaseLayer(_.assign({}, baseMapStyle, {})));
    window.featureMap = map;
    return map;
}

function setFeatures(map, features) {
    let vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(features),
    });
    let vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: styleFunction,
    });
    map.addLayer(vectorLayer);
    map.getView().fit(vectorLayer.getSource().getExtent());
    let currentZoom = map.getView().getZoom();
    let newZoom = currentZoom > 6 ? currentZoom - 1.5 : currentZoom - 0.5;
    map.getView().setZoom(Math.max(newZoom, 0));
    // var layer = L.geoJson(features, {
    //    onEachFeature: function (feature, layer) {
    //        layer.bindPopup(JSON.stringify(feature.properties.boundingBox, null, 4));
    //    }
    // });
    // layer.addTo(map);
    // map.fitBounds(layer.getBounds());
    // return layer;
}

let image = new ol.style.Circle({
    radius: 5,
    fill: null,
    stroke: new ol.style.Stroke({color: 'darkseagreen', width: 2}),
});

let styles = {
    'Point': new ol.style.Style({
        image: image,
    }),
    'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2,
        }),
    }),
    'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2,
        }),
    }),
    'MultiPoint': new ol.style.Style({
        image: image,
    }),
    'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(113, 177, 113, 0.1)',
        }),
    }),
    'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(113, 177, 113, 0.1)',
        }),
    }),
    'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(113, 177, 113, 0.1)',
        }),
        image: new ol.style.Circle({
            radius: 10,
            fill: null,
            stroke: new ol.style.Stroke({
                color: 'darkseagreen',
            }),
        }),
    }),
    'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(113, 177, 113, 0.1)',
        }),
    }),
};

var styleFunction = function(feature) {
    return styles[feature.getGeometry().getType()];
};

module.exports = featureMapDirective;
