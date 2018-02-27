'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    ol = require('openlayers'),
    querystring = require('querystring'),
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
            mapStyle: '=',
            circle: '=',
            point: '=',
            baselayer: '='
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
            circleLayer;

        vm.styleBreaks = {
            breakpoints: [0, 700],
            classes: ['isSmall', 'isLarge']
        };

        $scope.create = function(element) {
            map = createMap(element, vm.mapStyle, vm.baselayer, getSuggestedProjection(vm.point));
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

        function addFeatureLayer() {
            if (!featureLayer && _.get(vm.features, 'features.length', 0) > 0) {
                featureLayer = setFeatures(map, vm.features);
            }
            if (!circleLayer && typeof vm.circle !== 'undefined') {
                circleLayer = setCircle(map, vm.circle);
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

function getSuggestedProjection(point) {
       // return projections.EPSG_4326;
  return (typeof point !== 'undefined' && point[1] < 85 && point[1] > -85) ? projections.EPSG_3857 : projections.EPSG_4326;
}

function createMap(element, style, baseLayer, projection) {
    var mapElement = element[0].querySelector('.mapWidget__mapArea');
    var baseMapStyle = {style: style || 'gbif-light'};

    var interactions = ol.interaction.defaults({altShiftDragRotate: false, pinchRotate: false, mouseWheelZoom: false});
    var map = new ol.Map({
        target: mapElement,
        logo: false,
        controls: ol.control.defaults({zoom: false}),
        interactions: interactions
    });

    var currentProjection = projection;
    map.setView(currentProjection.getView(0, 0, 1));
    if (currentProjection.fitExtent) {
        map.getView().fit(currentProjection.fitExtent, {constrainResolution: false, maxZoom: 12, minZoom: 0});
    }

  if (typeof baseLayer !== 'undefined') {
      addSimpleBaseLayer(map, baseLayer, currentProjection);
     // map.addLayer(projections.createBaseLayer(baseLayer.url, currentProjection, baseLayer.params));
  } else {
      map.addLayer(currentProjection.getBaseLayer(_.assign({}, baseMapStyle, {})));
  }
    window.featureMap = map;
    console.log(map.getView().getProjection().getMetersPerUnit());
    return map;
}

function metersToRadius(map, meters) {
   return meters / map.getView().getProjection().getMetersPerUnit();
}

function lonLatToCurrentProjection(map, point) {
    return ol.proj.fromLonLat(point, map.getView().getProjection());
}

function setFeatures(map, features) {
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(features)
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
    // var layer = L.geoJson(features, {
    //    onEachFeature: function (feature, layer) {
    //        layer.bindPopup(JSON.stringify(feature.properties.boundingBox, null, 4));
    //    }
    // });
    // layer.addTo(map);
    // map.fitBounds(layer.getBounds());
    // return layer;
}

function setCircle(map, circle) {
    var vectorSource = new ol.source.Vector({});
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: styleFunction
    });
    map.addLayer(vectorLayer);
    vectorSource.addFeature(new ol.Feature({
        geometry: new ol.geom.Circle(lonLatToCurrentProjection(map, circle.coordinates), metersToRadius(map, circle.radius)),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(113, 177, 113, 0.1)'
            })
        })}));
       map.getView().fit(vectorLayer.getSource().getExtent());
      var currentZoom = map.getView().getZoom();
       var newZoom = currentZoom > 6 ? currentZoom - 1.5 : currentZoom - 0.5;
      map.getView().setZoom(Math.max(newZoom, 0));
}

var image = new ol.style.Circle({
    radius: 5,
    fill: null,
    stroke: new ol.style.Stroke({color: 'darkseagreen', width: 2})
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
            color: 'darkseagreen',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(113, 177, 113, 0.1)'
        })
    }),
    'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkseagreen',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(113, 177, 113, 0.1)'
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
            color: 'darkseagreen',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(113, 177, 113, 0.1)'
        })
    })
};

function addSimpleBaseLayer(map, layer, projection) {

    map.addLayer(new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions: layer.attribution,
            url: layer.url,
            tilePixelRatio: 2
        })
    }));

}

var styleFunction = function(feature) {
    return styles[feature.getGeometry().getType()];
};

module.exports = featureMapDirective;
