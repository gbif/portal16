'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceCtrl', occurrenceCtrl);

/** @ngInject */
function occurrenceCtrl(Occurrence, leafletData, $stateParams, $state, $translate) {
    var vm = this;
    vm.summaryFields = [
        {
            title: 'Scientific name',
            field: 'scientificName'
        },
        {
            title: 'Year',
            field: 'year'
        },
        {
            title: 'License',
            field: 'license'
        }
    ];
    vm.center = {zoom: 6, lat: 0, lng: 0};
    vm.markers = {};
    vm.tiles = {
        url: "http://2.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?app_id=_peU-uCkp-j8ovkzFGNU&app_code=gBoUkAMoxoqIWfxWA5DuMQ",
        options: {
            attribution: '&copy; <a href="https://legal.here.com/en/terms/serviceterms/us/">Nokia</a>'
        }
    };
    vm.mapDefaults = {
       zoomControlPosition: 'topright'
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

    vm.tilePosStyle = {};
    vm.data;



    function setMap(data) {
        if (typeof data.decimalLatitude === 'undefined' || typeof data.decimalLongitude === 'undefined') {
            return
        }
        vm.markers.taxon = {
            lat: data.decimalLatitude,
            lng: data.decimalLongitude
        };
        vm.center = {
            zoom: 6,
            lat: data.decimalLatitude,
            lng: data.decimalLongitude
        };

        //set static marker
        leafletData.getMap('occurrenceMap').then(function(map) {
            var a= L.latLng(data.decimalLatitude, data.decimalLongitude);
            var projPos = map.project(a, 0);
            vm.tilePosStyle = {
                left: projPos.x/2.56 + '%',
                top: projPos.y/2.56 + '%',
                display: 'block'
            };
        });
    }

    if ($stateParams.occurrenceId) {
        Occurrence.get({id: $stateParams.occurrenceId}).$promise.then(
            function(data){
                vm.data = data;
                setMap(data);
                $translate('BASIS_OF_RECORD.' + data.basisOfRecord).then(function (subtitle) {
                    vm.subtitle = subtitle;
                });
            }, function() {
                //TODO failed to get data handle error
            }
        );
    }

    vm.go = function() {
        $state.go('occurrence', {occurrenceId: 1234563253, locale: 'da'}, {reload: true});
    }
}

module.exports = occurrenceCtrl;