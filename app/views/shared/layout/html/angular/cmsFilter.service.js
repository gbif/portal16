'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('CmsFilter', function ($rootScope, $state, $stateParams, CmsSearch) {
        var state = {
            data: {},
            facetMultiselect: {},
            failedRequest: false,
            query: $stateParams
        };

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
            apiQuery = angular.copy(state.query);

            if (state.data.$cancelRequest) state.data.$cancelRequest();
            state.data = CmsSearch.query(apiQuery, function () {
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
            $state.go('.', state.query, {inherit: false, notify: false, reload: false});
            refreshData(state.query);
        }

        //when in not advanced mode then remove parameters from URL that are filled with default values
        state.query = $stateParams;

        // for country iso code should be uppercase to catch translation.
        var countryFacets = ['category_country', 'category_author_from_country'];
        countryFacets.forEach(function(facet){
            if (state.query.hasOwnProperty(facet) && typeof state.query[facet] !== 'undefined') {
                state.query[facet] = state.query[facet].toUpperCase();
            }
        });
        refreshData(state.query);

        return {
            getState: getState,
            update: update,
            updateParam: updateParam,
            refresh: refresh
        };

    });