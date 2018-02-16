'use strict';

let angular = require('angular');

angular
    .module('portal')
    .service('DatasetFilter', function($rootScope, $state, $stateParams, DatasetSearch) {
        let state = {
            data: {},
            facetMultiselect: {},
            failedRequest: false,
            query: $stateParams,
        };


        // for fields where we want faceting and will always ask for all possible. This is the case for most enums
        let exhaustiveFacetsKeys = ['type', 'publishing_org', 'hosting_org', 'publishing_country', 'project_id', 'license'];
        let exhaustiveFacets = [];
        exhaustiveFacetsKeys.forEach(function(facet) {
            exhaustiveFacets.push(facet);
        });

        // for fields with low cardinality and that isn't enums
        let multiSelectFacetsKeys = ['type', 'publishing_org', 'hosting_org', 'publishing_country', 'project_id', 'license'];

        function getState() {
            return state;
        }

        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams) {
                refreshData(toParams);
            }
        );

        function refreshData(query) {
            let apiQuery;
            state.query = query || $stateParams;
            apiQuery = angular.copy(state.query);
            apiQuery.facet = exhaustiveFacets;

            if (state.data.$cancelRequest) state.data.$cancelRequest();
            state.data = DatasetSearch.query(apiQuery, function() {
                state.failedRequest = false;
                // state.data.facets = facetArrayToMap(state.data.facets, state.data.count);
            }, function() {
                state.failedRequest = true;
            });

            // get multiselect facets only for keys that is filtered since we have already asked without multiselect and hence would get the same result twice
            apiQuery.facetMultiselect = true;
            apiQuery.limit = 0; // no need to get the same results again
            apiQuery.facet = [];
            multiSelectFacetsKeys.forEach(function(key) {
                if (angular.isDefined(apiQuery[key]) && [].concat(apiQuery[key]).length > 0) {
                    apiQuery.facet.push(key);
                }
            });
            if (state.facetMultiselect.$cancelRequest) state.facetMultiselect.$cancelRequest();
            state.facetMultiselect = DatasetSearch.query(apiQuery, function() {
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
            refresh: refresh,
        };
    });
