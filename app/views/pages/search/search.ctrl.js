'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl($scope, $state, $stateParams, hotkeys, NAV_EVENTS, $http) {
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
    //hotkeys.add(
    //    {
    //        combo: ['alt+f', 'alt+space'],
    //        description: 'Site search',
    //        callback: function (event) {
    //            vm.isActive = true;
    //            vm.clearFreetextAndSetFocus();
    //            event.preventDefault();
    //        }
    //    }
    //);

    vm.updateSearch = function () {
        vm.loaded = false;
        vm.query.q = vm.freeTextQuery || '';
        if ($state.current.abstract) {
            location.href = '/search?q=' + encodeURIComponent(vm.query.q);
        } else {
            $state.go($state.current, vm.query);
        }
        window.scrollTo(0, 0);
    };
    //vm.searchRedirect = function () {
    //    vm.loaded = false;
    //    vm.query.q = vm.freeTextQuery || '';
    //    location.href = '/search?q=' + encodeURIComponent(vm.query.q);
    //};
    //vm.searchOnEnter = function (event) {
    //    if (event.which === 13) {
    //        vm.updateSearch();
    //    }
    //
    //};
    //
    //vm.closeOnEsc = function (event) {
    //    if (event.which === 27) {
    //        document.getElementById('siteSearch').blur();
    //        vm.isActive = false;
    //    }
    //};

    //$scope.$on(NAV_EVENTS.toggleSearch, function (event, data) {
    //    if (data.toggle) {
    //        vm.isActive = !vm.isActive;
    //    } else {
    //        vm.isActive = data.state;
    //    }
    //    if (vm.isActive) {
    //        vm.clearFreetextAndSetFocus();
    //    } else {
    //        document.getElementById('siteSearch').blur();
    //    }
    //});

    vm.search = function(){
        vm.searchResults = $http.get('/api/omnisearch', {
            params: {
                q: vm.freeTextQuery
            }
        });
        vm.loading = true;
        vm.failed = false;
        vm.searchResults.then(function (response) {
            vm.loading = false;
            vm.results = response.data;
        }).catch(function () {
            //TODO inform user about failure
            vm.loading = false;
            vm.failed = true;
        });
    }
    vm.search();

}

module.exports = searchCtrl;