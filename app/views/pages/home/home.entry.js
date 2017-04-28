'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('homeCtrl', homeCtrl);

/** @ngInject */
function homeCtrl($http) {
    var vm = this;
    vm.mapView = undefined;
    vm.mapOptions = {
        points: true
    };

    function getLatest() {
        var geoip = $http.get('/api/utils/geoip/country');
        geoip.then(function (response) {
            vm.country = response.data;
            //to avoid too much offset cap latitude
            vm.country.location[0] = Math.min(vm.country.location[0], 40);
            vm.country.location[0] = Math.max(vm.country.location[0], -40);
            vm.mapView = {
                center: [vm.country.location[0], vm.country.location[1]],
                zoom: 3
            };
        });

        //geoip.then(function () {
        //
        //    OccurrenceSearch.query({
        //        mediaType: 'stillImage',
        //        country: vm.country.countryCode,
        //        limit:10
        //    }, function (data) {
        //        vm.localOccurrences = data;
        //        vm.localOccurrences.results.forEach(function (e) {
        //            //select first image
        //            e._images = [];
        //            for (var i = 0; i < e.media.length; i++) {
        //                if (e.media[i].type == 'StillImage') {
        //                    e._images.push(e.media[i]);
        //                }
        //            }
        //        });
        //    });
        //
        //    OccurrenceSearch.query({
        //        mediaType: 'stillImage',
        //        limit:10
        //    }, function (data) {
        //        vm.occurrences = data;
        //        vm.occurrences.results.forEach(function (e) {
        //            //select first image
        //            e._images = [];
        //            for (var i = 0; i < e.media.length; i++) {
        //                if (e.media[i].type == 'StillImage') {
        //                    e._images.push(e.media[i]);
        //                }
        //            }
        //        });
        //    });
        //
        //});
    }

    getLatest();
}

module.exports = homeCtrl;
