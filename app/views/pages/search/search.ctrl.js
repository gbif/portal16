'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl($state, $stateParams, Page, $http, $cookies) {
    var vm = this;
    Page.setTitle('Search');
    vm.isActive = false;
    vm.query = angular.copy($stateParams);
    vm.freeTextQuery = vm.query.q;
    vm.locale = $stateParams.locale;
    vm.isRedirectedFromProd = $cookies.get('isRedirectedFromProd') === 'true';

    vm.clearFreetextAndSetFocus = function () {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
    };

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
    };
    if (vm.freeTextQuery) {
        vm.search();
    } else {
        vm.loading = false;
    }

}

module.exports = searchCtrl;