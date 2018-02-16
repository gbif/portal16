
'use strict';

let angular = require('angular'),
    globeCreator = require('./globe'),
    _ = require('lodash');

require('./gbTileLayer');


angular
    .module('portal')
    .directive('gbmap', gbmapDirective);

/** @ngInject */
function gbmapDirective(BUILD_VERSION) {
    let directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/map/basic/gbmap.html?v=' + BUILD_VERSION,
        scope: {
            datasetKey: '=',
            taxonKey: '=',
            publishingOrg: '=',
            country: '=',
            publishingCountry: '=',
            mapstyle: '=',
            mapView: '=',
            mapOptions: '=',
        },
        link: mapLink,
        controller: gbmap,
        controllerAs: 'vm',
        bindToController: true,
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function gbmap(enums, $httpParamSerializer, $scope) {
        let vm = this,
            overlays = [],
            map;

        vm.basisOfRecord = {};
        enums.basisOfRecord.forEach(function(bor) {
            vm.basisOfRecord[bor] = false;
        });

        vm.projection = {
            epsg: 'EPSG:3857',
        };

        vm.allYears = true;
        vm.yearRange = {};

        $scope.create = function(element) {
            map = createMap(element);
            changeBaseMap(map);
            vm.updateMap();

            let slider = element[0].querySelector('.time-slider__slider');
            let years = element[0].querySelector('.time-slider__years');

            noUiSlider.create(slider, {
                start: [1700, 2016],
                step: 1,
                connect: true,
                range: {
                    'min': 1700,
                    'max': 2016,
                },
            });
            slider.noUiSlider.on('update', function(vals) {
                // only adjust the range the user can see
                vm.yearRange.start = Math.floor(vals[0]);
                vm.yearRange.end = Math.floor(vals[1]);
                years.innerText = vm.yearRange.start + ' - ' + vm.yearRange.end;
            });
            slider.noUiSlider.on('start', function() {
                $scope.$apply(function() {
                    vm.allYears = false;
                });
            });
            slider.noUiSlider.on('change', vm.sliderChange);
        };

        vm.interactionWithMap = function() {
            if (!vm.hasInterActedWithMap) {
                map.scrollWheelZoom.enable();
                vm.hasInterActedWithMap = true;
            }
        };

        vm.getExploreQuery = function() {
            let q = getQuery();
            q.basis_of_record = q.basisOfRecord;
            delete q.basisOfRecord;
            q.dataset_key = q.datasetKey;
            delete q.datasetKey;
            q.has_geospatial_issue = false;
            q.has_coordinate = true;
            q.geometry = getBoundsAsQueryString();
            return $httpParamSerializer(q);
        };

        /**
         * Make sure that longitude coordinates are within the bounds of the map (dateline wrapping).
         * @param n
         * @return {number} within the -180 to 180 bounds. -200 will fx wrap to 160
         */
        function normalizeLng(n) {
            let m = typeof n === 'number' ? n : 0;
            m = m % 360;
            if (m < -180) m += 360;
            if (m > 180) m -= 360;
            return m;
        }

        /**
         * cap latitude (north south) to be within -90 to 90. no wrapping as we do not do that when displaying the map
         * @param n
         * @return {number} -110 will return -90. 92 will return 90
         */
        function capBounds(n) {
            let m = typeof n === 'number' ? n : 0;
            m = Math.min(90, m);
            m = Math.max(-90, m);
            return m;
        }

        /**
         * Get the bounds of the map as wkt string.
         * @return {string} format 'POLYGON((W S,W N,E N,E S,W S))'
         */
        function getBoundsAsQueryString() {
            if (!map) return;
            let bounds = map.getBounds();
            let N = capBounds(bounds._northEast.lat),
                S = capBounds(bounds._southWest.lat),
                W = normalizeLng(bounds._southWest.lng),
                E = normalizeLng(bounds._northEast.lng);

            let str = 'POLYGON' + '((W S,W N,E N,E S,W S))'
                    .replace(/N/g, N.toFixed(2))
                    .replace(/S/g, S.toFixed(2))
                    .replace(/W/g, W.toFixed(2))
                    .replace(/E/g, E.toFixed(2));
            // if we are seeing all of earth then do not filter on bounds. TODO, this will be different code for other projections. How to handle that well?
            if (N == 90 && S == -90 && Math.abs(bounds._northEast.lng - bounds._southWest.lng) >= 360) {
                str = undefined;
            }
            return str;
        }

        vm.sliderChange = function(vals) {
            vm.yearRange.start = Math.floor(vals[0]);
            vm.yearRange.end = Math.floor(vals[1]);
            vm.updateMap();
            $scope.$apply(function() {
                vm.allYears = false;
            });
        };

        vm.updateMap = function() {
            overlays.forEach(function(layer) {
                map.removeLayer(layer);
            });
            let points = _.get(vm, 'mapOptions.points');
            overlays = addOverLays(map, getMapQuery(), points);
        };

        function getMapQuery() {
            let query = getQuery();

            if (query.basisOfRecord) {
                query.basisOfRecord = $httpParamSerializer({basisOfRecord: query.basisOfRecord});
            }

            return query;
        }

        function getQuery() {
            let query = {};

            // basis of record as array
            let basisOfRecord = Object.keys(vm.basisOfRecord).filter(function(e) {
                return vm.basisOfRecord[e];
            });
            query.basisOfRecord = basisOfRecord;
            if (basisOfRecord.length == 0 || basisOfRecord.length == Object.keys(vm.basisOfRecord).length) {
                delete query.basisOfRecord;
            }

            // year filters
            if (!vm.allYears && vm.yearRange.start && vm.yearRange.end) {
                query.year = vm.yearRange.start + ',' + vm.yearRange.end;
            }

            // only show one key. if more are supplied then ignore the remaining. at a later time it could be two layers styled differently to compare them
            let possibleKeys = ['taxonKey', 'datasetKey', 'publishingOrg', 'country', 'publishingCountry'];
            for (let i = 0; i < possibleKeys.length; i++) {
                let key = possibleKeys[i];
                if (vm[key]) {
                    query[key] = vm[key];
                    break;
                }
            }
            return query;
        }

        vm.updateProjection = function() {
            // Proj4js.defs["EPSG:3031"] = "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";

            // var crs = new L.Proj.CRS('EPSG:3575',
            //    '+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
            //    {
            //        resolutions: [
            //            8192, 4096, 2048, 1024, 512, 256, 128
            //        ],
            //        origin: [0, 0]
            //    });
            //
            // map.options.crs = crs;//L.CRS.EPSG3857;
            // set new basemap and overlays
        };

        vm.controls = {
            filters: false,
            style: false,
            projection: false,
        };

        vm.toggleControls = function(control) {
            Object.keys(vm.controls).forEach(function(e) {
                if (e == control) {
                    vm.controls[control] = !vm.controls[control];
                } else {
                    vm.controls[e] = false;
                }
            });
        };
        vm.toggleFilter = function() {
            vm.toggleControls('filters');
        };
        vm.toggleStyle = function() {
            vm.toggleControls('style');
        };
        vm.toggleProjection = function() {
            vm.toggleControls('projection');
        };

        $scope.$watch(function() {
 return vm.mapView;}, function() {
            if (map && vm.mapView) {
                map.setView(new L.LatLng(vm.mapView.center[0], vm.mapView.center[1]), vm.mapView.zoom);
            }
        });
    }
}


function createMap(element) {
    let globe,
        mapElement = element[0].querySelector('.map-area'),
        globeCanvas = element[0].querySelector('.globe');

    // var crs3575 = new L.Proj.CRS('EPSG:3575',
    //    '+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
    //    {
    //        //resolutions: [
    //        //    8192, 4096, 2048, 1024, 512, 256, 128
    //        //],
    //        origin: [0, 0]
    //    });

    let map = L.map(mapElement, {
        crs: L.CRS.EPSG4326,
        scrollWheelZoom: false,
    }).fitWorld();

    if (!globe) {
        globe = globeCreator(globeCanvas, {
            land: '#4d5258',
            focus: 'deepskyblue',
        });
    }
    map.on('move', function() {
        globe.setCenter(map.getCenter().lat, map.getCenter().lng, map.getZoom());
    });
    window.map = map;

    // var geoJ = {
    //    "type": "FeatureCollection",
    //    "features": [
    //        {
    //            "type": "Feature",
    //            "properties": {},
    //            "geometry": {
    //                "type": "Point",
    //                "coordinates": [
    //                    -40.078125,
    //                    84.8024737243345
    //                ]
    //            }
    //        },
    //        {
    //            "type": "Feature",
    //            "properties": {},
    //            "geometry": {
    //                "type": "Point",
    //                "coordinates": [
    //                    -55.54687499999999,
    //                    -84.33698037639608
    //                ]
    //            }
    //        }
    //    ]
    // };
    // L.geoJson(geoJ, {
    //    style: function (feature) {
    //        return 'red';//{color: feature.properties.color};
    //    },
    //    onEachFeature: function (feature, layer) {
    //        //layer.bindPopup(feature.properties.description);
    //        layer.bindPopup('mypop up text');
    //    }
    // }).addTo(map);

    return map;
}


function changeBaseMap(map) {
    // HTTP URL is                            http://{s}.ashbu.cartocdn.com/timrobertson100/api/v1/map/3a222bf37b6c105e0c7c6e3a2a1d6ecc:1467147536105/0/{z}/{x}/{y}.png?cache_policy=persist
    let baseMap = L.tileLayer('https://cartocdn-ashbu.global.ssl.fastly.net/timrobertson100/api/v1/map/3a222bf37b6c105e0c7c6e3a2a1d6ecc:1467147536105/0/{z}/{x}/{y}.png?cache_policy=persist', {
        attribution: '&copy; <a href=\'https://www.cartodb.com/\'>CartoDB</a> <a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap contributors</a>'
    });

    // var arctic = L.tileLayer('//{s}.tiles.arcticconnect.org/osm_3575/{z}/{x}/{y}.png ', {
    //    attribution: '&copy; <a href="http://arcticconnect.org/">ArcticConnect</a>. Data © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    // });
    baseMap.addTo(map);
}

function addOverLays(map, query, points) {
    let queryParam = query.basisOfRecord;
    delete query.basisOfRecord;

    let conf = {"style": 'classic.poly', "bin": 'hex', 'hexPerTile': 25, "srs": 'EPSG:4326'};
    if (points) {
        conf = {srs: 'EPSG:4326'};
    }

    let optionsA = angular.extend({}, conf, query);
    // optionsA.style = "outline.poly";


    // var optionsB = angular.copy(conf);
    // optionsB.style = "orange.marker";

    let overlays = [];
    let overlayA = L.gbifSimpleLayer('//{s}-api.gbif-uat.org/v2/map/occurrence/density/{z}/{x}/{y}.png?' + queryParam, optionsA);
    overlayA.addTo(map);
    overlays.push(overlayA);

    // var overlayB = L.gbifSimpleLayer('http://api.gbif-uat.org/v2/map/occurrence/density/{z}/{x}/{y}.png', optionsB);
    // overlayB.addTo(map);


    // overlays.push(overlayB);
    return overlays;
}

module.exports = gbmapDirective;
