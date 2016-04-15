'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceCtrl', occurrenceCtrl);

/** @ngInject */
function occurrenceCtrl(Occurrence, leafletData, SimilarOccurrence) {
    var vm = this;
    vm.SimilarOccurrence = SimilarOccurrence;//.getSimilar({TAXONKEY: 2435146});
    vm.center = {zoom: 7, lat: 0, lng: 0};
    vm.markers = {};
    vm.tiles = {
        url: "http://2.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?app_id=_peU-uCkp-j8ovkzFGNU&app_code=gBoUkAMoxoqIWfxWA5DuMQ",
        options: {
            attribution: '&copy; <a href="https://legal.here.com/en/terms/serviceterms/us/">Nokia</a>'
        }
    };
    vm.mapDefaults = {
       zoomControlPosition: 'topleft',
        scrollWheelZoom: false
   };
   vm.mapEvents = {
        map: {
            enable: [], //https://github.com/tombatossals/angular-leaflet-directive/issues/1033
            logic: 'broadcast'
        },
        marker: {
            enable: [],
            logic: 'broadcast'
        }
    };

    vm.paths =  {
        
    };

    vm.tilePosStyle = {};
    vm.data;

    vm.setData = function(data) {
        vm.data = JSON.parse(data);
        setMap(vm.data);
    };

    vm.toggleMapOnMobile  =function() {
        vm.expandMap = !vm.expandMap;
    };

    function setMap(data) {
        if (typeof data.decimalLatitude === 'undefined' || typeof data.decimalLongitude === 'undefined') {
            return
        }
        vm.markers.taxon = {
            lat: data.decimalLatitude,
            lng: data.decimalLongitude,
            focus: false
        };
        if (data.verbatimLocality) {
            vm.markers.taxon.message = '<p>'+data.verbatimLocality+'</p>';
        }
        vm.center = {
            zoom: 8,
            lat: data.decimalLatitude+0.4,
            lng: data.decimalLongitude
        };
        if (data.coordinateAccuracyInMeters > 50) {
            vm.paths.c1 = {
                weight: 2,
                color: '#ff612f',
                latlngs: {
                    lat: data.decimalLatitude,
                    lng: data.decimalLongitude
                },
                radius: data.coordinateAccuracyInMeters,
                type: 'circle'
            };
        }

        //set static marker
        leafletData.getMap('occurrenceMap').then(function(map) {
            //vm.SimilarOccurrence.getSimilar(
            //    {
            //        geometry: vm.SimilarOccurrence.leafletBoundsToWkt(map.getBounds()),
            //        taxonkey: data.speciesKey, //TODO isn't always a species key
            //        //eventdate:
            //    }
            //);

            var a= L.latLng(data.decimalLatitude, data.decimalLongitude);
            var projPos = map.project(a, 0);
            vm.tilePosStyle = {
                left: projPos.x/2.56 + '%',
                top: projPos.y/2.56 + '%',
                display: 'block'
            };
            map.once('focus', function() { map.scrollWheelZoom.enable(); });
        });
    }
}

module.exports = occurrenceCtrl;