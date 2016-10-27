'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('navCtrl', navCtrl);

/** @ngInject */
function navCtrl($rootScope, NAV_EVENTS) {
    var vm = this;

    vm.toggleFilter = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true});
    };

    vm.toggleSearch = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {toggle: true});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {state: false});
    };
}

module.exports = navCtrl;