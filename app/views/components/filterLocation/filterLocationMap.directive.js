'use strict';

var angular = require('angular'),
    parseGeometry = require('wellknown');

angular
    .module('portal')
    .directive('filterLocationMap', filterLocationMapDirective);

/** @ngInject */
function filterLocationMapDirective() {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/filterLocation/filterLocationMap.html',
        scope: {},
        link: mapLink,
        controller: filterLocationMap,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function filterLocationMap($scope, OccurrenceFilter, $filter) {
        var vm = this,
            map;

        $scope.create = function (element) {
            map = createMap(element, OccurrenceFilter);
        };

        vm.state = OccurrenceFilter.getOccurrenceData();
        $scope.$watch(function () {
            return vm.state.query.geometry
        }, function (newQuery) {
            var query = $filter('unique')(newQuery);
            map.update(query);
        });
    }
}


function createMap(element, OccurrenceFilter) {
    var mapElement = element[0].querySelector('.filter-location-map');

    var map = L.map(mapElement, {
        center: [0, 0],
        scrollWheelZoom: false,
        zoom: 2
    });

    //TODO get other projection with decent basemap
    L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    map.fitWorld().zoomIn();

    var editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);

    var options = {
        position: 'topright',
        draw: {
            polyline: false, // Turns off this drawing tool
            polygon: {
                allowIntersection: false, // Restricts shapes to simple polygons
                drawError: {
                    color: 'tomato', // Color the shape will turn when intersects
                    message: 'No intersections allowed!' // Message that will show when intersect
                },
                shapeOptions: {
                    color: 'deepskyblue'
                }
            },
            circle: false, // Turns off this drawing tool
            rectangle: {
                shapeOptions: {
                    clickable: true,
                    color: 'deepskyblue'
                }
            },
            marker: false // Turns off this drawing tool
        },
        edit: {
            featureGroup: editableLayers,
            remove: true,
            allowIntersection: false,
            polygon: {
                allowIntersection: false
            },
            rectangle: {
                allowIntersection: false
            }
        }
    };
    var drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
        var layer = e.layer;
        editableLayers.addLayer(layer);
        updateQuery();
    });

    map.on(L.Draw.Event.DELETESTOP, updateQuery);
    map.on(L.Draw.Event.EDITED, updateQuery);

    function updateQuery() {
        var leafletGeoJson = editableLayers.toGeoJSON();
        var wktGeometries;
        for (var i = 0; i < leafletGeoJson.features.length; i++) {
            wktGeometries = wktGeometries || [];
            var feature = leafletGeoJson.features[i];
            var wktGeom = parseGeometry.stringify(feature);
            wktGeometries.push(wktGeom);
        }
        OccurrenceFilter.updateParams({geometry: wktGeometries});
    }

    function update(geometries) {
        geometries = geometries || [];
        editableLayers.clearLayers();
        geometries.forEach(function (wktStr) {
            var geojsonGeometry = parseGeometry(wktStr);
            editableLayers.addLayer(L.GeoJSON.geometryToLayer(geojsonGeometry));
        });
    }

    return {
        map: map,
        update: update
    };
}


module.exports = filterLocationMapDirective;
