'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryTrendsCtrl', countryTrendsCtrl);

/** @ngInject */
function countryTrendsCtrl($stateParams) {
    var vm = this;
    vm.direction = $stateParams.direction;
    vm.isAbout = vm.direction == 'about';
    vm.countryCode = gb.countryCode;
    vm.aboutTemplate = '/api/country/' + vm.countryCode + '/trends/' + vm.direction;
    console.log(vm.trendsTemplate);

    vm.changeToPublished = function() {
    console.log('change tpo published');
        $state.go($state.current, {direction: 'published'}, {inherit: true, notify: false, reload: true});
    };
}

module.exports = countryTrendsCtrl;
