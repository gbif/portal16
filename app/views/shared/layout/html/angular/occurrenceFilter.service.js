'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('OccurrenceFilter', function ($rootScope, $state, $stateParams, OccurrenceTableSearch) {
        var occurrenceState = {
            data: {},
            failedRequest: false
        };

        var availableFacets = ['basisOfRecord', 'month', 'typeStatus', 'dataset'];
        var facets = [];
        availableFacets.forEach(function(facet){
            facets.push(facet);
        });

        function getOccurrenceState() {
            return occurrenceState;
        }

        $rootScope.$watchCollection(function(){return $state.params }, function(newValue) {
            var query = newValue || {};
            query.facet = facets;
            if (occurrenceState.data.$cancelRequest) occurrenceState.data.$cancelRequest();
            occurrenceState.data = OccurrenceTableSearch.query(query, function(data){
                occurrenceState.failedRequest = false;
            }, function() {
                occurrenceState.failedRequest = true;
            });
        });

        function update(query) {
            $state.go('.', query, {inherit:false, notify: false, reload: false});
            //query = query || {};
            //query.facet = facets;
            //if (occurrenceState.data.$cancelRequest) occurrenceState.data.$cancelRequest();
            //occurrenceState.data = OccurrenceTableSearch.query(query, function(data){
            //    occurrenceState.failedRequest = false;
            //}, function() {
            //    occurrenceState.failedRequest = true;
            //});
        }

        update($stateParams);

        return {
            getOccurrenceData: getOccurrenceState,
            update: update
        };

    });