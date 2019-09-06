'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl($state, $stateParams, Page, LOCALE, $http, $cookies, $translate) {
    var vm = this;
    $translate('resourceSearch.title').then(function(title) {
        Page.setTitle(title);
    });
    Page.drawer(false);
    vm.isActive = false;
    vm.query = angular.copy($stateParams);
    vm.freeTextQuery = vm.query.q;
    vm.locale = $stateParams.locale;
    vm.isRedirectedFromProd = $cookies.get('isRedirectedFromProd') === 'true';

    vm.clearFreetextAndSetFocus = function() {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
    };

    vm.updateSearch = function() {
        vm.loaded = false;
        vm.query.q = vm.freeTextQuery || '';
        if ($state.current.abstract) {
            location.href = '/search?q=' + encodeURIComponent(vm.query.q);
        } else {
            $state.go($state.current, vm.query);
        }
        window.scrollTo(0, 0);
    };

    vm.searchUrlFragment = function() {
        var pathName = window.location.pathname;
        var fragment = pathName.substr(pathName.lastIndexOf('/') + 1);
        vm.search(decodeURIComponent(fragment));
    };

    vm.search = function(q) {
        vm.searchResults = $http.get('/api/omnisearch', {
            params: {
                q: q || vm.freeTextQuery,
                locale: LOCALE
            }
        });
        vm.loading = true;
        vm.failed = false;
        vm.searchResults.then(function(response) {
            vm.loading = false;
            vm.results = response.data;
        }).catch(function() {
            // TODO inform user about failure
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
