'use strict';

var angular = require('angular'),
    projections = require('../mapWidget/projections'),
    control = require('ol/control'),
    interaction = require('ol/interaction'),
    Vector = require('ol/source/Vector').default,
    LayerVector = require('ol/layer/Vector').default,
    Fill = require('ol/style/Fill').default,
    Stroke = require('ol/style/Stroke').default,
    Style = require('ol/style/Style').default,
    TopoJSON = require('ol/format/TopoJSON').default,
    ol = require('ol');

angular
    .module('portal')
    .directive('countryShapeMap', countryShapeMapDirective);

/** @ngInject */
function countryShapeMapDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        template: '<div class="mapWidget__mapWrapper"><div class="countryShapeMap"></div>' +
        '<div class="countryShapeMap__zoomButtons"><a href="" ng-click="vm.zoomIn()">+</a><a href="" ng-click="vm.zoomOut()">-</a></div></div>',
        scope: {
            countryCode: '='
        },
        link: mapLink,
        controller: countryShapeMap,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function countryShapeMap($scope) {
        var vm = this;
        $scope.create = function(element) {
            var mapElement = element[0].querySelector('.countryShapeMap');

            if (vm.countryCode) {
                var countryCenters = {
                    'RU': {zoom: 1.3, extent: [24.739765882492065, 9.678770303726196, 193.84132838249207, 94.2295515537262]},
                    'US': {zoom: 1.7, extent: [-199.55990028381348, 9.983906507492065, -30.458337783813477, 94.53468775749207]},
                    'NZ': {zoom: 4, extent: [160.66725584864616, -47.51892510056496, 187.12233397364616, -34.33533135056496]},
                    'FR': {zoom: 4, extent: [-10.383871793746955, 40.56846499443054, 16.071206331253045, 53.75205874443054]},
                    'NL': {zoom: 6, extent: [1.9519936319042657, 50.540941131514835, 8.565763163154266, 53.836839569014835]}
                };
                angular.element(document).ready(function() {
                    var currentProjection = projections.EPSG_4326;
                    var map = new ol.Map({
                        target: mapElement,
                        layers: [
                            currentProjection.getBaseLayer({style: 'gbif-geyser-en'})
                        ],
                        interactions: /* ol. */interaction.defaults({mouseWheelZoom: false, doubleClickZoom: false}),
                        logo: false,
                        controls: /* ol. */control.defaults({zoom: false, attribution: false})
                    });
                    map.setView(currentProjection.getView(0, 0, 1, 1, 16));
                    vm.zoomIn = function() {
                        var view = map.getView();
                        view.setZoom(view.getZoom() + 1);
                    };
                    vm.zoomOut = function() {
                        var view = map.getView();
                        view.setZoom(view.getZoom() - 1);
                    };
                    var countryFeature;
                    var source = new /* ol.source. */Vector({
                        url: '/api/topojson/world/participants',
                        format: new /* ol.format. */TopoJSON(),
                        overlaps: false
                    });
                    source.once('change', function(e) {
                        source.forEachFeature(function(feature) {
                            if (feature.getProperties().countryCode === vm.countryCode) {
                                countryFeature = feature;
                                return true;
                            } else {
                                return false;
                            }
                        });
                        if (countryFeature) {
                            var extent = countryFeature.getGeometry().getExtent();
                            if (countryCenters[countryFeature.getProperties().countryCode]) {
                                map.getView().fit(countryCenters[countryFeature.getProperties().countryCode].extent);
                                map.getView().setZoom(countryCenters[countryFeature.getProperties().countryCode].zoom);
                            } else {
                                map.getView().fit(extent);
                            }
                        }
                    });
                    var vector = new /* ol.layer. */LayerVector({
                        source: source,
                        style: function(feature) {
                            return new /* ol.style. */Style({
                                fill: new /* ol.style. */Fill({
                                    color: (feature === countryFeature) ? 'rgba(120,181,120, 0.3)' : 'rgba(0,0,0,0)'
                                }),
                                stroke: new /* ol.style. */Stroke({
                                    color: '#FFFFFF',
                                    width: 1
                                }),
                                zIndex: 1
                            });
                        }
                    });
                    map.addLayer(vector);
                });
            }
        };
    }
}

module.exports = countryShapeMapDirective;
