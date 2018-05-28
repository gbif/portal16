'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryTrendsCtrl', countryTrendsCtrl);

/** @ngInject */
function countryTrendsCtrl($stateParams, $state) {
    var vm = this;
    vm.direction = $stateParams.direction;
    vm.showAbout = vm.direction == 'about';
    vm.countryCode = gb.countryCode;
    vm.locale = gb.locale;
    vm.aboutTemplate = '/api/country/' + vm.countryCode + '/trends/' + vm.direction;

    vm.changeToPublished = function() {
        $state.go($state.current, {direction: 'published'}, {inherit: true, notify: false, reload: true});
    };
}

module.exports = countryTrendsCtrl;
