'use strict';

var angular = require('angular');
require('../../globeContext/globeContext.directive');
require('./gbTileLayer');

angular
    .module('portal')
    .directive('gbmap', gbmapDirective);

/** @ngInject */
function gbmapDirective() {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/map/basic/gbmap.html',
        scope: {
            datasetKey: '=',
            taxonKey: '=',
            mapstyle: '='
        },
        link: mapLink,
        controller: gbmap,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element, attrs, ctrl) {
        scope.create(element);
    }

    /** @ngInject */
    function gbmap(enums, $httpParamSerializer, OccurrenceBbox, mapConstants, env, $scope, $timeout) {
        var vm = this,
            overlays = [],
            map;

        vm.basisOfRecord = {};
        enums.basisOfRecord.forEach(function(bor){
            vm.basisOfRecord[bor] = false;
        });

        vm.projection = {
            epsg: 'EPSG:3857'
        };

        vm.allYears = false;
        vm.yearRange = {};

        $scope.create = function(element){
            map = createMap(element);
            changeBaseMap(map);
            vm.updateMap();

            var slider = element[0].querySelector('.time-slider__slider');
            var years = element[0].querySelector('.time-slider__years');

            noUiSlider.create(slider, {
                start: [1700, 2016],
                step: 1,
                connect: true,
                range: {
                    'min': 1700,
                    'max': 2016
                }
            });
            slider.noUiSlider.on('update', function (vals) {
                // only adjust the range the user can see
                vm.yearRange.start = Math.floor(vals[0]);
                vm.yearRange.end = Math.floor(vals[1]);
                years.innerText = vm.yearRange.start  + " - " + vm.yearRange.end;
            });
            slider.noUiSlider.on('change', function (vals) {
                vm.yearRange.start = Math.floor(vals[0]);
                vm.yearRange.end = Math.floor(vals[1]);
                vm.updateMap();
            });
        };

        vm.updateMap = function() {
            overlays.forEach(function (layer) {
                map.removeLayer(layer);
            });
            overlays = addOverLays(map, getQuery());
        };

        function getQuery() {
            var query = {};

            //basis of record as array
            var basisOfRecord = Object.keys(vm.basisOfRecord).filter(function (e) {
                return vm.basisOfRecord[e];
            });
            query.basisOfRecord = $httpParamSerializer({basisOfRecord: basisOfRecord});
            if (basisOfRecord.length == 0 || basisOfRecord.length == Object.keys(vm.basisOfRecord).length) {
                delete query.basisOfRecord;
            }

            //year filters
            if (!vm.allYears && vm.yearRange.start && vm.yearRange.end) {
                query.year = vm.yearRange.start + "," + vm.yearRange.end;
            }

            //only show one key. if more are supplied then ignore the remaining. at a later time it could be two layers styled differently to compare them
            if (vm.datasetKey) {
                query.datasetKey = vm.datasetKey;
            } else if (vm.taxonKey) {
                query.taxonKey = vm.taxonKey;
            }

            return query;
        }

        vm.updateProjection = function() {
            //Proj4js.defs["EPSG:3031"] = "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";

            //var crs = new L.Proj.CRS('EPSG:3575',
            //    '+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
            //    {
            //        resolutions: [
            //            8192, 4096, 2048, 1024, 512, 256, 128
            //        ],
            //        origin: [0, 0]
            //    });
            //
            //map.options.crs = crs;//L.CRS.EPSG3857;
            //set new basemap and overlays
        }
    }
}



var baseMap = L.tileLayer('http://b.ashbu.cartocdn.com/timrobertson100/api/v1/map/3a222bf37b6c105e0c7c6e3a2a1d6ecc:1467147536105/0/{z}/{x}/{y}.png?cache_policy=persist', {
    attribution: "&copy; <a href='https://www.cartodb.com/'>CartoDB</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>"
});

var arctic = L.tileLayer('http://{s}.tiles.arcticconnect.org/osm_3575/{z}/{x}/{y}.png ', {
    attribution: '&copy; <a href="http://arcticconnect.org/">ArcticConnect</a>. Data © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});




function createMap(element, projection) {
    var mapElement = element[0].querySelector('.map-area');

    var crs3575 = new L.Proj.CRS('EPSG:3575',
        '+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
        {
            //resolutions: [
            //    8192, 4096, 2048, 1024, 512, 256, 128
            //],
            origin: [0, 0]
        });

    var map = L.map(mapElement, {
        crs: L.CRS.EPSG4326
    }).setView(new L.LatLng(0, 0), 1);

    //map.on('mousemove', function(e){
    //    document.getElementById('position').innerHTML = '<br>' + e.latlng.lat.toFixed(2) + '<br>' + e.latlng.lng.toFixed(2);
    //});

    //var geoJ = {
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
    //};
    //L.geoJson(geoJ, {
    //    style: function (feature) {
    //        return 'red';//{color: feature.properties.color};
    //    },
    //    onEachFeature: function (feature, layer) {
    //        //layer.bindPopup(feature.properties.description);
    //        layer.bindPopup('mypop up text');
    //    }
    //}).addTo(map);

    return map;
}

function changeBaseMap(map) {
    baseMap.addTo(map);
}

function addOverLays(map, query) {
    var queryParam = query.basisOfRecord;
    delete query.basisOfRecord;
    var conf = {style: "classic.poly", bin: "hex", "hexPerTile": 25, srs:'EPSG:4326'};

    var optionsA = angular.extend({}, conf, query);
    //optionsA.style = "outline.poly";


    //var optionsB = angular.copy(conf);
    //optionsB.style = "orange.marker";

    var overlays = [];
    var overlayA = L.gbifSimpleLayer('http://api.gbif-uat.org/v2/map/occurrence/density/{z}/{x}/{y}.png?' + queryParam, optionsA);
    overlayA.addTo(map);
    overlays.push(overlayA);

    //var overlayB = L.gbifSimpleLayer('http://api.gbif-uat.org/v2/map/occurrence/density/{z}/{x}/{y}.png', optionsB);
    //overlayB.addTo(map);


    //overlays.push(overlayB);
    return overlays;
}

module.exports = gbmapDirective;
