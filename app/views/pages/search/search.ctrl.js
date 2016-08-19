'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl($state, $stateParams, hotkeys) {
    var vm = this;
    vm.query = angular.copy($stateParams);
    vm.freeTextQuery = vm.query.q;
    vm.locale = $stateParams.locale;

    vm.clearFreetextAndSetFocus = function() {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
    };
    //might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
    hotkeys.add({
        combo: 'alt+f',
        description: 'Site search',
        callback: function(event) {
            vm.clearFreetextAndSetFocus();
            event.preventDefault();
        }
    });

    vm.updateSearch = function() {
        vm.query.q = vm.freeTextQuery;
        if ($state.current.abstract) {
            location.href = '/search?q=' + encodeURIComponent(vm.freeTextQuery);
        } else {
            $state.go($state.current, vm.query);
        }
        window.scrollTo(0,0);
    };
    vm.searchOnEnter = function(event) {
        if(event.which === 13) {
            vm.updateSearch();
        }
    };
    vm.cmsTypedSearch = function() {
    };
}

module.exports = searchCtrl;