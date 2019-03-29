'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    ol = require('openlayers'),
    querystring = require('querystring'),
    projections = require('../mapWidget/projections');

angular
    .module('portal')
    .directive('featureMap', featureMapDirective);

var projection;

/** @ngInject */
function featureMapDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/map/featureMap/featureMap.html?v=' + BUILD_VERSION,
        scope: {
            features: '=',
            wkt: '=',
            mapStyle: '=',
            featureStyle: '=',
            circle: '=',
            marker: '=',
            baselayer: '=',
            projection: '=',
            onMapMove: '='
        },
        link: mapLink,
        controller: featureMap,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function featureMap($scope) {
        var vm = this,
            map,
            featureLayer,
            circleLayer,
            wktLayer;


        $scope.create = function(element) {
            var prj = (vm.projection) ? vm.projection.replace(':', '_') : undefined;
            projection = (prj && typeof prj !== 'undefined') ? projections[prj] : projections.EPSG_4326;

            map = createMap(element, vm.mapStyle, vm.baselayer, projection);

            var unbind = $scope.$watch(function() {
                return vm.onMapMove;
            }, function() {
                if (map && vm.onMapMove && typeof vm.onMapMove === 'function') {
                    map.on('moveend', function() {
                        var center = ol.proj.toLonLat(map.getView().getCenter(), projection.srs);
                        vm.onMapMove(center[1], center[0], map.getView().getZoom());
                    });
                    unbind();
                }
            });


            addPopUp(map, (typeof vm.marker !== 'undefined'));
            addFeatureLayer();
        };

        vm.interactionWithMap = function() {
            if (!vm.hasInterActedWithMap) {
                map.scrollWheelZoom.enable();
                vm.hasInterActedWithMap = true;
            }
        };

        $scope.$watch(function() {
            return vm.features;
        }, function() {
            if (map && vm.features) {
                addFeatureLayer();
            }
        });
        $scope.$watch(function() {
            return vm.circle;
        }, function() {
            if (map && vm.circle) {
                addFeatureLayer();
            }
        });
        $scope.$watch(function() {
            return vm.wkt;
        }, function() {
            if (map && vm.wkt) {
                addFeatureLayer();
            }
        });
       $scope.$watch(function() {
            return vm.marker;
        }, function() {
            if (map && vm.marker) {
                var markerFeature = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat(vm.marker.point, projection.srs)),
                    message: vm.marker.message
                });
                markerFeature.setStyle(markerStyle);
                var vectorSource = new ol.source.Vector({
                    features: [markerFeature]
                });

                var vectorLayer = new ol.layer.Vector({
                    source: vectorSource
                });
                map.addLayer(vectorLayer);
                map.getView().fit(vectorLayer.getSource().getExtent());
                map.getView().setZoom(vm.marker.zoom || 6);
            }
        });

        function addFeatureLayer() {
            if (!featureLayer && _.get(vm.features, 'features.length', 0) > 0) {
                featureLayer = setFeatures(map, vm.features, vm.featureStyle);
            }
            if (!circleLayer && typeof vm.circle !== 'undefined') {
                circleLayer = setCircle(map, vm.circle);
            }
            if (!wktLayer && typeof vm.wkt !== 'undefined') {
                wktLayer = setWKT(map, vm.wkt);
            }
        }

        vm.zoomIn = function() {
            var view = map.getView();
            view.setZoom(view.getZoom() + 1);
        };

        vm.zoomOut = function() {
            var view = map.getView();
            view.setZoom(view.getZoom() - 1);
        };
    }
}


function createMap(element, style, baseLayer, projection) {
    var mapElement = element[0].querySelector('.mapWidget__mapArea');
    var baseMapStyle = {style: style || 'gbif-geyser-en'};

    var interactions = ol.interaction.defaults({altShiftDragRotate: false, pinchRotate: false, mouseWheelZoom: false});
    var map = new ol.Map({
        target: mapElement,
        logo: false,
        controls: ol.control.defaults({zoom: false, attribution: false}),
        interactions: interactions
    });

    var currentProjection = projection;
    map.setView(currentProjection.getView(0, 0, 1));
    if (currentProjection.fitExtent) {
        map.getView().fit(currentProjection.fitExtent, {constrainResolution: false, maxZoom: 12, minZoom: 0});
    }

    if (typeof baseLayer !== 'undefined') {
        addSimpleBaseLayer(map, baseLayer, currentProjection);
    } else {
        map.addLayer(currentProjection.getBaseLayer(_.assign({}, baseMapStyle, {})));
    }
    window.featureMap = map;
    return map;
}

function metersToRadius(map, meters) {
    return meters / map.getView().getProjection().getMetersPerUnit();
}

function lonLatToCurrentProjection(map, point) {
    return ol.proj.fromLonLat(point, map.getView().getProjection());
}

function setFeatures(map, features, featureStyle) {
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(features, {
            dataProjection: 'EPSG:4326',
            featureProjection: projection.srs
        }),
        wrapX: false
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: featureStyle || styleFunction
    });
    map.addLayer(vectorLayer);
    map.getView().fit(vectorLayer.getSource().getExtent(), {maxZoom: 6});
}

function setWKT(map, wkt) {
    var vectorSource = new ol.source.Vector({
        features: [new ol.format.WKT().readFeature(wkt, {
            dataProjection: 'EPSG:4326',
            featureProjection: projection.srs
        })]
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: styleFunction
    });
    map.addLayer(vectorLayer);
    map.getView().fit(vectorLayer.getSource().getExtent());
    var currentZoom = map.getView().getZoom();
    var newZoom = currentZoom > 6 ? currentZoom - 1.5 : currentZoom - 0.5;
    map.getView().setZoom(Math.max(newZoom, 0));
}

function setCircle(map, circle) {
    var vectorSource = new ol.source.Vector({});
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: styleFunction
    });
    map.addLayer(vectorLayer);
    var featureConfig = {
        geometry: new ol.geom.Circle(lonLatToCurrentProjection(map, circle.coordinates), metersToRadius(map, circle.radius)),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(113, 177, 113, 0.1)'
            })
        })
    };
    if (circle.message) {
        featureConfig.message = circle.message;
    }
    vectorSource.addFeature(new ol.Feature(featureConfig));
    map.getView().fit(vectorLayer.getSource().getExtent());

    map.getView().setZoom(6);
}

var image = new ol.style.Circle({
    radius: 4,
    fill: new ol.style.Fill({
        color: 'darkseagreen'
    }),
    stroke: new ol.style.Stroke({color: 'darkseagreen', width: 2})
});

var markerStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 41],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 1,
        src: '/img/marker.png'
    }))
});

var styles = {
    'Point': new ol.style.Style({
        image: image
    }),
    'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2
        })
    }),
    'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2
        })
    }),
    'MultiPoint': new ol.style.Style({
        image: image
    }),
    'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgb(0,0,255)',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0,0,255, 0.1)'
        })
    }),
    'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgb(0,0,255)',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0,0,255, 0.1)'
        })
    }),
    'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(113, 177, 113, 0.1)'
        }),
        image: new ol.style.Circle({
            radius: 10,
            fill: null,
            stroke: new ol.style.Stroke({
                color: 'darkseagreen'
            })
        })
    }),
    'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 0, 0, 0.8)',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 0, 0, 0.1)'
        })
    })
};

function addSimpleBaseLayer(map, layer) {
    map.addLayer(new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions: layer.attribution,
            url: layer.url + querystring.stringify(layer.params),
            tilePixelRatio: (isHighDensity()) ? 2 : 1
        })
    }));
}

function isHighDensity() {
    return ((window.matchMedia
    && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches
    || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), '
        + 'only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches))
    || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
}

function addPopUp(map, hasMarker) {
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    /**
     * Create an overlay to anchor the popup to the map.
     */
    var overlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        },
        offset: (hasMarker) ? [0, -41] : [0, 0]
    });

    map.addOverlay(overlay);
    /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
    closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };

    // display popup on click
    map.on('click', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature) {
                return feature;
            });
        if (feature && typeof feature.getGeometry().getCoordinates === 'function' && feature.get('message')) {
            var coordinates = feature.getGeometry().getCoordinates();
            overlay.setPosition(coordinates);
            content.innerHTML = feature.get('message');
        } else {
            overlay.setPosition(undefined);
        }
    });

        map.on('pointermove', function(evt) {
            var hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                return (feature && (typeof feature.getGeometry().getCoordinates === 'function' || typeof feature.getGeometry().getCenter === 'function') && feature.get('message'));
            });
            if (hit) {
                this.getTargetElement().style.cursor = 'pointer';
            } else {
                this.getTargetElement().style.cursor = '';
            }
        });
}

var styleFunction = function(feature) {
    return styles[feature.getGeometry().getType()];
};

module.exports = featureMapDirective;
