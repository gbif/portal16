/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('cmsSearchCtrl', cmsSearchCtrl);

// http://stackoverflow.com/questions/18961332/angular-ui-router-show-loading-animation-during-resolve-process#

/** @ngInject */
function cmsSearchCtrl($state, $stateParams, results, hotkeys) {
    var vm = this;
    vm.query = $stateParams;
    vm.freeTextQuery = $stateParams.q;
    vm.status = results.status;
    vm.statusText = results.statusText;
    vm.count = results.count;
    vm.appliedFilterCount = 0;
    vm.actionMessageClass = 'action-notice--hidden';

    //fixed order for facets
    var facetOrder = {
        type: 1,
        language: 2,
        category_informatics: 3,
        category_data_use: 4,
        category_capacity_enhancement: 5,
        category_about_gbif: 6,
        category_audience: 7,
        category_purpose: 8,
        category_data_type: 9,
        category_country: 10,
        category_resource_type: 11,
        category_topic: 12,
        category_tags: 13
    };

    vm.facets = (results.hasOwnProperty('facets')) ? results.facets : facetsFromUrl(facetOrder);

    function facetsFromUrl(facetOrder) {
        var facets = [];
        for (var property in facetOrder) {
            if (typeof $stateParams[property] !== 'undefined') {
                var facet = {};
                facet.field = property;
                facet.fieldLabel = property;
                facet.counts = [{
                    enum: $stateParams[property],
                    key: $stateParams[property],
                    title: $stateParams[property]
                }];
                facets.push(facet);
            }
        }
        return facets;
    }

    vm.sortFacets = function(a) {
        return facetOrder[a.field] || 100;
    };

    // Order country tags by name, regardless the count.
    if (typeof vm.facets !== 'undefined') {
        vm.facets.forEach(function(f){
            if (f.field == 'category_country' && f.counts !== undefined) {
                f.counts.sort(function(a, b){ return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);});
            }
        });
    }

    vm.getFilterCount = function() {
        var c = 0;
        Object.keys($stateParams).forEach(function(e){
            var v = $stateParams[e];
            if (typeof v !== 'undefined' && e != 'locale' && e != 'q') {
                c++;
            }
        });
        return c;
    };
    vm.appliedFilterCount = vm.getFilterCount();

    vm.freeTextSearch = function() {
        $state.go('.', {q: vm.freeTextQuery}, {inherit:false});
        window.scrollTo(0,0);
    };

    vm.updateSearch = function() {
        vm.actionMessageClass = 'action-notice--visible';
        $stateParams.q = vm.freeTextQuery;
        $stateParams.offset = undefined;
        $stateParams.limit = undefined;
        $state.go($state.current, $stateParams);
        window.scrollTo(0,0);
    };

    vm.isFacetInQuery = function(field, value) {
        var param = vm.query[field.toLowerCase()];
        if (param == value) {
            return true;
        } else if ( angular.isArray(param) ) {
            if (param.indexOf(value) > -1) {
                return true
            }
        }
        return false;
    };

    vm.addFilter = function(field, value) {
        var param = vm.query[field.toLowerCase()];
        if (angular.isUndefined(param)) {
            vm.query[field.toLowerCase()] = value;
        } else if ( angular.isArray(param) ) {
            if (param.indexOf(value) < 0) {
                param.push(value);
            }
        } else {
            if (param !== value) {
                vm.query[field.toLowerCase()] = [vm.query[field.toLowerCase()], value];
            }
        }
        vm.updateSearch();
    };

    vm.removeFilter = function(field, value) {
        var param = vm.query[field.toLowerCase()];
        if (param == value) {
            vm.query[field.toLowerCase()] = undefined;
        } else if ( angular.isArray(param) ) {
            vm.query[field.toLowerCase()] = param.filter(function(e){
                return e!=value;
            });
        }
        vm.updateSearch();
    };

    vm.searchOnEnter = function(event) {
        if(event.which === 13) {
            vm.freeTextSearch();
        }
    };

    vm.clearFreetextAndSetFocus = function() {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
        event.preventDefault();
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
}

module.exports = cmsSearchCtrl;

