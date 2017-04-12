'use strict';
var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('resourceCtrl', resourceCtrl);

/** @ngInject */
function resourceCtrl($state, ResourceFilter, $rootScope, NAV_EVENTS) {
    var vm = this;
    vm.state = ResourceFilter.getState();

    vm.filters = {};

    vm.filters.countriesOfCoverage = {
        titleTranslation: 'enums.cms.vocabularyTypes.countriesOfCoverage',
        queryKey: 'countriesOfCoverage',
        filter: ResourceFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.TRANSLATE',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            facetKey: 'COUNTRIES_OF_COVERAGE'
        }
    };

    vm.filters.countriesOfResearcher = {
        titleTranslation: 'enums.cms.vocabularyTypes.countriesOfResearcher',
        queryKey: 'countriesOfResearcher',
        filter: ResourceFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.TRANSLATE',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            facetKey: 'COUNTRIES_OF_RESEARCHER'
        }
    };

    vm.filters.literatureType = {
        queryKey: 'literatureType',
        facetKey: 'LITERATURE_TYPE',
        title: 'literatureType',
        translationPrefix: 'enums.cms.vocabularyTypes',
        filter: ResourceFilter
    };

    vm.filters.contentType = {
        queryKey: 'contentType',
        facetKey: 'CONTENT_TYPE',
        title: 'contentType',
        translationPrefix: 'enums.cms.vocabularyTypes',
        filter: ResourceFilter
    };

    vm.filters.year = {
        titleTranslation: 'ocurrenceFieldNames.year',
        intervalTranslation: 'intervals.year.',
        queryKey: 'year',
        filter: ResourceFilter,
        singleSelect: true,
        range: {
            'min': [2000, 1],
            'max': [new Date().getFullYear()]
        }
    };


    var facetedEnumFilters = ['language', 'audiences', 'purposes', 'topics'];
    facetedEnumFilters.forEach(function(e){
        vm.filters[e] = {
            queryKey: e,
            facetKey: e.toUpperCase(),
            title: e,
            valueTranslationPrefix: 'enums.cms.vocabularyTerms.',
            filter: ResourceFilter,
            multiSelect: true
        };
    });

    vm.openHelpdesk = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: 'QUESTION'});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };

    vm.search = function () {
        $state.go('.', vm.state.query, {inherit: false, notify: true, reload: true});
    };

    vm.hasData = function () {
        return typeof vm.state.data.count !== 'undefined'
    };

    vm.isTabShown = function(contentType){
        if (vm.state.query.contentType == contentType) {
            return true;
        }
        if (_.get(vm, 'state.facetMultiselect.facets.CONTENT_TYPE.counts.' + contentType + '.count', 0) > 0) {
            return true;
        }
        return false;
    };

    var secondaryContentTypesInOrder = ['programme', 'literature', 'tool', 'document'];
    vm.getExtraTabContentType = function(){
        var mainContentTypes = ['news', 'dataUse', 'event', 'project'];

        //if there is a selected contenttype that isn't one of the main ones, then give it a tab
        if (vm.state.query.contentType && mainContentTypes.indexOf(vm.state.query.contentType) == -1) {
            return vm.state.query.contentType;
        }

        var availableContentTypes = _.get(vm, 'state.facetMultiselect.facets.CONTENT_TYPE.counts', {});
        var firstSecondaryWithResults = secondaryContentTypesInOrder.find(function(e){
            return availableContentTypes[e];
        });
        if (firstSecondaryWithResults) {
            return firstSecondaryWithResults;
        }
    };

    vm.getMoreOptions = function(){
        var alreadyShownTab = vm.getExtraTabContentType();
        var availableContentTypes = _.get(vm, 'state.facetMultiselect.facets.CONTENT_TYPE.counts', {});
        return secondaryContentTypesInOrder.filter(function(e){
            return e !== alreadyShownTab && availableContentTypes[e];
        });
    };

}

module.exports = resourceCtrl;
