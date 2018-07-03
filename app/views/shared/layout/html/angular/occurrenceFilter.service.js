'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('OccurrenceFilter', function($rootScope, $state, $stateParams, OccurrenceTableSearch) {
        var state = {
            table: {},
            data: {},
            facetMultiselect: {},
            failedRequest: false,
            failedFacetRequest: false,
            query: $stateParams
        };

        // when in not advanced mode then prefill parameters with default values
        var advancedDefaults = {
            occurrence_id: undefined,
            organism_id: undefined,
            publishing_country: undefined,
            locality: undefined,
            water_body: undefined,
            recorded_by: undefined,
            establishment_means: undefined,
            state_province: undefined,
            protocol: undefined,
            record_number: undefined,
            elevation: undefined,
            depth: undefined,
            last_interpreted: undefined,
            event_date: undefined,
            repatriated: undefined
        };

        // for fields where we want faceting and will always ask for all possible. This is the case for most enums
        var exhaustiveFacetsKeys = [
            'establishment_means',
            'basis_of_record',
            'month',
            'type_status',
            'issue',
            'dataset_key',
            'institution_code',
            'country',
            'media_type',
            'license',
            'protocol',
            'event_id',
            'parent_event_id',
            'publishing_org'];
        var exhaustiveFacets = [];
        exhaustiveFacetsKeys.forEach(function(facet) {
            exhaustiveFacets.push(facet);
        });

        // for fields with low cardinality and that isn't enums
        var multiSelectFacetsKeys = ['establishment_means',
            'dataset_key',
            'institution_code',
            'basis_of_record',
            'country',
            'month',
            'media_type',
            'type_status',
            'issue',
            'license',
            'publishing_org'];

        function getOccurrenceState() {
            return state;
        }

        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams) {
                refreshData(toParams);
            }
        );

        function refreshData(query) {
            var apiQuery, tableQuery;
            state.query = query || $stateParams;
            tableQuery = angular.copy(state.query);
            apiQuery = angular.copy(state.query);
            apiQuery.facet = exhaustiveFacets;
            apiQuery['month.facetLimit'] = 12;
            apiQuery['type_status.facetLimit'] = 1000;
            apiQuery['issue.facetLimit'] = 1000;

            // when in not advanced mode then prefill parameters with default values
            if (!state.query.advanced) {
                Object.keys(advancedDefaults).forEach(function(keyDefault) {
                    apiQuery[keyDefault] = advancedDefaults[keyDefault];
                });
            }

            if (state.data.$cancelRequest) state.data.$cancelRequest();
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            state.data = OccurrenceTableSearch.query(apiQuery, function() {
                state.failedFacetRequest = false;
                // state.data.facets = facetArrayToMap(state.data.facets, state.data.count);
            }, function(err) {
                if (err.status > 399) {
                    state.failedFacetRequest = true;
                    state.facetError = err;
                }
            });

            // test get only table without facets
            if (state.table.$cancelRequest) state.table.$cancelRequest();
            state.table = OccurrenceTableSearch.query(tableQuery, function() {
                state.failedRequest = false;
            }, function(err) {
                if (err.status > 399) {
                    state.failedRequest = true;
                    state.error = err;
                }
            });


            // get multiselect facets only for keys that is filtered since we have already asked without multiselect and hence would get the same result twice
            apiQuery.facetMultiselect = true;
            // apiQuery.limit = 0; //no need to get the same results again
            apiQuery.facet = [];
            multiSelectFacetsKeys.forEach(function(key) {
                if (angular.isDefined(apiQuery[key]) && [].concat(apiQuery[key]).length > 0) {
                    apiQuery.facet.push(key);
                }
            });
            if (state.facetMultiselect.$cancelRequest) state.facetMultiselect.$cancelRequest();
            state.facetMultiselect = OccurrenceTableSearch.query(apiQuery, function() {
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

        function updateParams(params) {
            angular.extend(state.query, state.query, params);
            refresh();
        }

        function refresh() {
            state.query.offset = undefined;

            // when in not advanced mode then remove parameters from URL that are filled with default values
            if (!state.query.advanced) {
                Object.keys(advancedDefaults).forEach(function(keyDefault) {
                    delete state.query[keyDefault];
                });
            }

            $state.go('.', state.query, {inherit: false, notify: false, reload: false});
            refreshData(state.query);
        }

        // when in not advanced mode then remove parameters from URL that are filled with default values
        state.query = $stateParams;
        if (!state.query.advanced) {
            for (var key in advancedDefaults) {
                if (advancedDefaults.hasOwnProperty(key) && typeof state.query[key] !== 'undefined' && state.query[key] != '') {
                    state.query.advanced = true;
                    $state.go('.', state.query, {inherit: false, notify: false, reload: false});
                }
            }
        }
        refreshData(state.query);

        return {
            getOccurrenceData: getOccurrenceState,
            update: update,
            updateParam: updateParam,
            updateParams: updateParams,
            refresh: refresh
        };
    });
