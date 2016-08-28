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

        var availableFacets = ['basisOfRecord', 'month', 'typeStatus', 'datasetKey'];
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

        function facetArrayToMap(facets, total) {
            var facetMap = {};
            facets.forEach(function(facetType){
                facetMap[facetType.field] = {
                    sorted: facetType.counts
                };
                var facetCountMap = {};
                var max = 0;
                facetType.counts.forEach(function(e){
                    facetCountMap[e.name] = {
                        count: e.count,
                        fraction: e.count/total
                    }
                    max = e.count > max ? e.count : max;
                });
                facetMap[facetType.field].maxCount = max;
                facetMap[facetType.field].map = facetCountMap;
            });
            return facetMap;
        }

        function refreshData(query) {
            occurrenceState.query = query || $stateParams;
            occurrenceState.query.facet = facets;
            occurrenceState.query['month.facetLimit'] = 12;
            occurrenceState.query['typeStatus.facetLimit'] = 30;
            if (occurrenceState.data.$cancelRequest) occurrenceState.data.$cancelRequest();
            // occurrenceState.data = {};
            occurrenceState.data = OccurrenceTableSearch.query(occurrenceState.query, function(data){
                occurrenceState.failedRequest = false;
                // occurrenceState.data = data;
                occurrenceState.data.facets = facetArrayToMap(occurrenceState.data.facets, occurrenceState.data.count);
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