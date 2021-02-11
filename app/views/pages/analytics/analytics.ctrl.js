'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('analyticsCtrl', analyticsCtrl);

/** @ngInject */
function analyticsCtrl(URL_PREFIX, enums) {
    var vm = this;
    vm.countries = enums.country;
    vm.gbifRegions = enums.gbifRegion;
    vm.selectedRegion = 'GLOBAL';
    var region = window.location.pathname.split('/region/')[1];
    if (vm.gbifRegions.includes(region)) {
        vm.selectedRegion = region;
    }

    vm.show = false;
    window.setTimeout(function() {
        vm.show = true;
    }, 50);

    vm.onChange = function(val) {
        if (val === 'GLOBAL') {
            window.location.href = URL_PREFIX + '/analytics/global/';
        } else if (val && vm.gbifRegions.includes(val)) {
            window.location.href = URL_PREFIX + '/analytics/region/' + val;
        } else if (val && val.length > 1) {
            window.location.href = URL_PREFIX + '/country/' + val + '/about#trends';
        }
    };
}

module.exports = analyticsCtrl;
