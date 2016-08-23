'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('OccurrenceFilter', function ($rootScope, $state, $stateParams, OccurrenceTableSearch) {
        var occurrenceResults = {
            data: {}
        };
        var availableFacets = ['basisOfRecord', 'month', 'typeStatus', 'dataset'];
        var facets = [];
        availableFacets.forEach(function(facet){
            facets.push(facet);
        });

        function getOccurrenceData() {
            return occurrenceResults;
        };

        function update(query) {
            $state.go('.', query, {inherit:false, notify: false, reload: false});
            query = query || {};
            query.facet = facets;
            OccurrenceTableSearch.query(query, function(data){
                occurrenceResults.data = data;
            });
        };
        update();

        return {
            getOccurrenceData: getOccurrenceData,
            update: update
        };

    });