'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('homeCtrl', homeCtrl);

/** @ngInject */
function homeCtrl($http, OccurrenceSearch, env) {
    var vm = this;
    vm.imageCache = env.imageCache;
    vm.mapView = undefined;
    vm.mapOptions = {
        points: true
    };
    vm.showCountryCard = false;
    vm.country;
    if (window.location.search.indexOf('underDevelopment') >= 0) {
        vm.underDevelopment = true;
    }
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

            $http.get('/api/home/node/' + vm.country.countryCode, {}).then(function (response) {
                if (response.data.rss) {
                    vm.rssFeed = response.data.rss;
                    vm.hasFeed = true;
                    vm.showCountryCard = true;
                }
                vm.participationStatus = _.get(response, 'data.record.participationStatus');
            }, function () {
                //TODO ignore failures as this is optional anyhow
            });
        });

        geoip.then(function () {

            OccurrenceSearch.query({
                mediaType: 'stillImage',
                country: vm.country.countryCode,
                limit:50
            }, function (data) {
                vm.occurrences = data;
                if (vm.occurrences.count > 50) {
                    vm.showCountryCard = true;
                    vm.hasImages = true;
                }
                vm.occurrences.results.forEach(function (e) {
                    //select first image
                    e._images = [];
                    for (var i = 0; i < e.media.length; i++) {
                        if (e.media[i].type == 'StillImage') {
                            e._images.push(e.media[i]);
                        }
                    }
                });
            });

            OccurrenceSearch.query({
                country: vm.country.countryCode
            }, function (data) {
                vm.totalCount = data.count;
            });

            $http.get('/api/home/publishers/' + vm.country.countryCode, {params: {limit: 3}}).then(function (response) {
                vm.publishers = response.data;
                vm.hasPublishingPublishers = vm.publishers.results.length > 0;
                vm.hasMorePublishers = vm.publishers.results.length < vm.publishers.count;
            });

            $http.get('/api/home/datasets/' + vm.country.countryCode, {params: {limit: 3}}).then(function (response) {
                vm.datasets = response.data;
                vm.hasDatasets = vm.datasets.count > 0;
                vm.hasMoreDatasets = vm.datasets.results.length < vm.datasets.count;
            });

        });
    }

    getLatest();
}

module.exports = homeCtrl;

