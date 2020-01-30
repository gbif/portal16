'use strict';

var angular = require('angular');
console.log('analytics ctrl registered');
angular
    .module('portal')
    .controller('analyticsCtrl', analyticsCtrl);

/** @ngInject */
function analyticsCtrl(URL_PREFIX, enums) {
    var vm = this;
    vm.countries = enums.country;
    vm.selectedCountry = '';
    vm.show = false;
    window.setTimeout(function() {
        vm.show = true;
    }, 50);

    vm.onChange = function(val) {
        if (val && val.length > 1) {
            window.location.href = URL_PREFIX + '/country/' + val + '/about#trends';
        }
    };
}

module.exports = analyticsCtrl;
