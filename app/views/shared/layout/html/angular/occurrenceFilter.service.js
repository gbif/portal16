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

        var availableFacets = ['basisOfRecord', 'month', 'typeStatus', 'dataset'];
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
            occurrenceState.query = query || $stateParams;
            occurrenceState.query.facet = facets;
            if (occurrenceState.data.$cancelRequest) occurrenceState.data.$cancelRequest();
            occurrenceState.data = OccurrenceTableSearch.query(occurrenceState.query, function(){
                occurrenceState.failedRequest = false;
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