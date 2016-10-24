'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl($scope, $state, $stateParams, hotkeys, NAV_EVENTS) {
    var vm = this;
    vm.isActive = false;
    vm.query = angular.copy($stateParams);
    vm.freeTextQuery = vm.query.q;
    vm.locale = $stateParams.locale;

    vm.clearFreetextAndSetFocus = function () {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
    };
    //might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
    hotkeys.add({
        combo: 'alt+f',
        description: 'Site search',
        callback: function (event) {
            vm.clearFreetextAndSetFocus();
            event.preventDefault();
        }
    });

    vm.updateSearch = function () {
        vm.query.q = vm.freeTextQuery || '';
        if ($state.current.abstract) {
            location.href = '/search?q=' + encodeURIComponent(vm.query.q);
        } else {
            $state.go($state.current, vm.query);
        }
        window.scrollTo(0, 0);
    };
    vm.searchOnEnter = function (event) {
        if (event.which === 13) {
            vm.updateSearch();
        }
    };

    $scope.$on(NAV_EVENTS.toggleSearch, function (event, data) {
        if (data.toggle) {
            vm.isActive = !vm.isActive;
        } else {
            vm.isActive = data.state;
        }
    });
}

module.exports = searchCtrl;