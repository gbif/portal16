'use strict';
var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .controller('resourceListCtrl', resourceListCtrl);

/** @ngInject */
function resourceListCtrl(hotkeys, ResourceFilter, ResourceSearch, env, $httpParamSerializer, BUILD_VERSION) {
    var vm = this, offset;
    vm.state = ResourceFilter.getState();
    vm.tileApi = env.tileApi;
    vm.imageCache = env.imageCache;
    vm.BUILD_VERSION = BUILD_VERSION;
    vm.dataApi = env.dataApi;
    vm.locale = gb.locale;

    //* pagination */
    function updatePaginationCounts() {
        offset = parseInt(vm.state.query.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt(vm.state.query.limit) || 20;
        vm.currentPage = Math.floor(offset / vm.limit) + 1;
    }

    updatePaginationCounts();

    vm.pageChanged = function() {
        vm.state.query.offset = (vm.currentPage - 1) * vm.limit;
        updatePaginationCounts();
        ResourceFilter.update(vm.state.query);
        window.scrollTo(0, 0);
    };

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function() {
            if (offset + vm.limit < vm.state.data.count) {
                vm.currentPage += 1;
                vm.pageChanged();
            }
        }
    });
    hotkeys.add({
        combo: 'alt+left',
        description: 'Previous',
        callback: function() {
            if (offset > 0) {
                vm.currentPage -= 1;
                vm.pageChanged();
            }
        }
    });

    vm.getSerializedQuery = function() {
        var query = angular.copy(vm.state.query);
        delete query.locale;
        delete query.advanced;
        delete query.limit;
        delete query.offset;
        delete query.contentType;
        query = _.omitBy(query, angular.isUndefined);
        return $httpParamSerializer(query);
      };

    vm.faqData = {};
    var searchFaq = function() {
        if (vm.faqData.$cancelRequest) vm.faqData.$cancelRequest();
        var q = _.assign({}, vm.state.query, {contentType: 'help', limit: 5, searchable: true});
        vm.faqData = ResourceSearch.query(q);
    };
    searchFaq();

    vm.hasData = function() {
        return typeof vm.state.data.count !== 'undefined';
    };
}

module.exports = resourceListCtrl;

