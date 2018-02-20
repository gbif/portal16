'use strict';

// var angular = require('angular'); it is required, but included in the main build. We need a better way to load bootstrap controllers async

angular
    .module('portal')
    .controller('homeCtrl', homeCtrl);

/** @ngInject */
function homeCtrl($http, suggestEndpoints, Page) {
    var vm = this;
    Page.setTitle('GBIF');
    Page.drawer(false);
    vm.mapView = undefined;
    vm.freeTextQuery;
    vm.mapOptions = {
        points: true
    };
    vm.mapFilter = {};

    function getLatest() {
        var geoip = $http.get('/api/utils/geoip/country');
        geoip.then(function(response) {
            vm.country = response.data;
            // to avoid too much offset cap latitude
            vm.country.location[0] = Math.min(vm.country.location[0], 40);
            vm.country.location[0] = Math.max(vm.country.location[0], -40);
            vm.mapView = {
                center: [vm.country.location[0], vm.country.location[1]],
                zoom: 3
            };
        });
    }
    getLatest();

    vm.getSuggestions = function(val) {
        return $http.get(suggestEndpoints.taxon, {
            params: {
                q: val,
                limit: 10
            }
        }).then(function(response) {
            return response.data;
        });
    };

    vm.typeaheadSelect = function(item) { //  model, label, event
        vm.mapFilter = {taxon_key: item.key};
    };

    vm.searchOnEnter = function() {
        vm.searchOnEnter = function(event) {
            if (event.which === 13 && !vm.selectedSpecies) {
                vm.mapFilter = {};
            }
        };
    };

    vm.updateSearch = function() {
        location.href = '/search?q=' + encodeURIComponent(vm.freeTextQuery);
    };
}

module.exports = homeCtrl;
