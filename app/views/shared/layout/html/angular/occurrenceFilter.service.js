'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('OccurrenceFilter', function ($rootScope, $state, $stateParams, OccurrenceTableSearch) {
        var occurrenceState = {
            data: {},
            failedRequest: false,
            query: $stateParams
        };

        var availableFacets = ['basis_of_record', 'month', 'type_status', 'dataset_key', 'institution_code'];
        var facets = [];
        availableFacets.forEach(function(facet){
            facets.push(facet);
        });

        function getOccurrenceState() {
            return occurrenceState;
        }

        $rootScope.$on('$stateChangeSuccess', 
            function(event, toState, toParams){
                refreshData(toParams);
            }
        );

        function refreshData(query) {
            var apiQuery;
            occurrenceState.query = query || $stateParams;
            apiQuery = angular.copy(occurrenceState.query);

            apiQuery.facet = facets;
            apiQuery['month.facetLimit'] = 12;
            apiQuery['type_status.facetLimit'] = 30;
            if (occurrenceState.data.$cancelRequest) occurrenceState.data.$cancelRequest();
            occurrenceState.data = OccurrenceTableSearch.query(apiQuery, function(){
                occurrenceState.failedRequest = false;
                //occurrenceState.data.facets = facetArrayToMap(occurrenceState.data.facets, occurrenceState.data.count);
            }, function() {
                occurrenceState.failedRequest = true;
            });
        }

        function update(query) {
            $state.go('.', query, {inherit:false, notify: false, reload: false});
            refreshData(query);
        }

        function updateParam(key, values) {
            occurrenceState.query[key] = values;
            occurrenceState.query.offset = undefined;
            $state.go('.', occurrenceState.query, {inherit:false, notify: false, reload: false});
            refreshData(occurrenceState.query);
        }

        refreshData();

        return {
            getOccurrenceData: getOccurrenceState,
            update: update,
            updateParam: updateParam
        };

    });