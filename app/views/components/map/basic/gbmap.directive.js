'use strict';

var angular = require('angular');
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
            type: '=',
            key: '='
        },
        controller: gbmap,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function gbmap(leafletData) {
        var vm = this;
        vm.id = 'testerdette';
        vm.center = {zoom: 0, lat: 0, lng: 0};
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

        leafletData.getMap(vm.id).then(function(map) {
            map.once('focus', function() { map.scrollWheelZoom.enable(); });
        });
    }
}

module.exports = gbmapDirective;
