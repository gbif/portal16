'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('SpeciesFilter', function ($rootScope, $state, $stateParams, SpeciesSearch, constantKeys) {
        var state = {
            data: {},
            failedRequest: false,
            query: $stateParams
        };

        //when in not advanced mode then prefill parameters with default values
        var advancedDefaults = {
            dataset_key: constantKeys.backboneKey,
            name_type: undefined,
            constituent_key: undefined
        };

        var availableFacets = ['rank', 'dataset_key', 'constituent_key', 'highertaxon_key', 'name_type', 'status', 'issue'];
        var facets = [];
        availableFacets.forEach(function (facet) {
            facets.push(facet);
        });

        function getState() {
            return state;
        }

        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams) {
                refreshData(toParams);
            }
        );

        function refreshData(query) {
            var apiQuery;
            state.query = query || $stateParams;
            state.query.facet = facets;
            state.query['status.facetLimit'] = 100;
            state.query['issue.facetLimit'] = 100;
            state.query['name_type.facetLimit'] = 100;
            state.query['rank.facetLimit'] = 100;
            state.query.facetMultiselect = true;
            apiQuery = state.query;
            //apiQuery.hl = true;

            if (state.data.$cancelRequest) state.data.$cancelRequest();

            //when in not advanced mode then prefill parameters with default values
            if (!state.query.advanced) {
                apiQuery = angular.copy(state.query);
                Object.keys(advancedDefaults).forEach(function (keyDefault) {
                    apiQuery[keyDefault] = advancedDefaults[keyDefault];
                });
            }

            state.data = SpeciesSearch.query(apiQuery, function () {
                state.failedRequest = false;
            }, function () {
                state.failedRequest = true;
            });
        }

        function update(query) {
            $state.go('.', query, {inherit: false, notify: false, reload: false});
            refreshData(query);
        }

        function updateParam(key, values) {
            state.query[key] = values;
            refresh();
        }

        function refresh() {
            state.query.offset = undefined;

            //when in not advanced mode then remove parameters from URL that are filled with default values
            if (!state.query.advanced) {
                Object.keys(advancedDefaults).forEach(function (keyDefault) {
                    delete state.query[keyDefault];
                });
            }

            $state.go('.', state.query, {inherit: false, notify: false, reload: false});
            refreshData(state.query);
        }

        refreshData();

        return {
            getState: getState,
            update: update,
            updateParam: updateParam,
            refresh: refresh
        };

    });