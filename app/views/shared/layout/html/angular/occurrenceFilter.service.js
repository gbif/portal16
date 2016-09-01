'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('OccurrenceFilter', function ($rootScope, $state, $stateParams, OccurrenceTableSearch) {
        var state = {
            data: {},
            failedRequest: false,
            query: $stateParams
        };

        //when in not advanced mode then prefill parameters with default values
        var advancedDefaults = {
            locality: undefined,
            waterBody: undefined,
            recorded_by: undefined
        };

        var availableFacets = ['basis_of_record', 'month', 'type_status', 'dataset_key', 'institution_code', 'organism_id'];
        var facets = [];
        availableFacets.forEach(function(facet){
            facets.push(facet);
        });

        function getOccurrenceState() {
            return state;
        }

        $rootScope.$on('$stateChangeSuccess', 
            function(event, toState, toParams){
                refreshData(toParams);
            }
        );

        function refreshData(query) {
            var apiQuery;
            state.query = query || $stateParams;
            apiQuery = angular.copy(state.query);
            apiQuery.facet = facets;
            apiQuery['month.facetLimit'] = 12;
            apiQuery['type_status.facetLimit'] = 30;

            //when in not advanced mode then prefill parameters with default values
            if (!state.query.advanced) {
                console.log('prune for simple');
                Object.keys(advancedDefaults).forEach(function(keyDefault){
                    apiQuery[keyDefault] = advancedDefaults[keyDefault];
                });
            }

            if (state.data.$cancelRequest) state.data.$cancelRequest();
            state.data = OccurrenceTableSearch.query(apiQuery, function(){
                state.failedRequest = false;
                //state.data.facets = facetArrayToMap(state.data.facets, state.data.count);
            }, function() {
                state.failedRequest = true;
            });
        }

        function update(query) {
            $state.go('.', query, {inherit:false, notify: false, reload: false});
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
                Object.keys(advancedDefaults).forEach(function(keyDefault){
                    delete state.query[keyDefault];
                });
            }

            $state.go('.', state.query, {inherit:false, notify: false, reload: false});
            refreshData(state.query);
        }

        //when in not advanced mode then remove parameters from URL that are filled with default values
        state.query = $stateParams;
        if (!state.query.advanced) {
            for (var key in advancedDefaults) {
                console.log('set defaults');
                if (advancedDefaults.hasOwnProperty(key) && typeof state.query[key] !== 'undefined') {
                    state.query.advanced = true;
                    $state.go('.', state.query, {inherit:false, notify: false, reload: false});
                }
            }
        }
        refreshData(state.query);

        return {
            getOccurrenceData: getOccurrenceState,
            update: update,
            updateParam: updateParam,
            refresh: refresh
        };

    });