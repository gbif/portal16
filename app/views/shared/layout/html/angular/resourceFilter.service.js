/* eslint-disable max-len */
'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('ResourceFilter', function($rootScope, $state, $stateParams, ResourceSearch) {
        var state = {
            data: {},
            facetMultiselect: {},
            failedRequest: false,
            query: $stateParams
        };

        // for fields where we want faceting and will always ask for all possible. This is the case for most enums
        var exhaustiveFacetsKeys = ['year', 'contentType', 'literatureType', 'language', 'audiences', 'purposes', 'source', 'publisher', 'topics', 'countriesOfResearcher', 'countriesOfCoverage', 'relevance', 'contractCountry'];
        var exhaustiveFacets = [];
        exhaustiveFacetsKeys.forEach(function(facet) {
            exhaustiveFacets.push(facet);
        });

        // for fields with low cardinality and that isn't enums
        // var multiSelectFacetsKeys = ['year', 'contentType', 'literatureType', 'language', 'audiences', 'purposes', 'topics', 'countriesOfResearcher', 'countriesOfCoverage'];

        function getState() {
            return state;
        }

        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams) {
                refreshData(toParams);
            }
        );

        function refreshData(query) {
            var apiQuery;
            state.query = query || $stateParams;
            apiQuery = angular.copy(state.query);
            apiQuery.searchable = true;
            apiQuery.facet = exhaustiveFacets;

            if (state.data.$cancelRequest) state.data.$cancelRequest();
            state.data = ResourceSearch.query(apiQuery, function() {
                state.failedRequest = false;
                // state.data.facets = facetArrayToMap(state.data.facets, state.data.count);
            }, function() {
                state.failedRequest = true;
            });

            // get multiselect facets only for keys that is filtered since we have already asked without multiselect and hence would get the same result twice
            apiQuery.facetMultiselect = true;
            apiQuery.limit = 0; // no need to get the same results again
            apiQuery.facet = exhaustiveFacetsKeys;// [];
            // multiSelectFacetsKeys.forEach(function (key) {
            //    if (angular.isDefined(apiQuery[key]) && [].concat(apiQuery[key]).length > 0) {
            //        apiQuery.facet.push(key);
            //    }
            // });
            if (state.facetMultiselect.$cancelRequest) state.facetMultiselect.$cancelRequest();
            state.facetMultiselect = ResourceSearch.query(apiQuery, function() {
            }, function() {
                // TODO how to indicate missing facet data
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

        // when in not advanced mode then remove parameters from URL that are filled with default values
        state.query = $stateParams;
        refreshData(state.query);

        return {
            getState: getState,
            update: update,
            updateParam: updateParam,
            refresh: refresh
        };
    });
