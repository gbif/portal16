'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('DatasetFilter', function ($rootScope, $state, $stateParams, DatasetSearch) {
        var state = {
            data: {},
            failedRequest: false,
            query: $stateParams
        };

        var availableFacets = ['type', 'keyword'];
        var facets = [];
        availableFacets.forEach(function(facet){
            facets.push(facet);
        });

        function getState() {
            return state;
        }

        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams){
                refreshData(toParams);
            }
        );

        function refreshData(query) {
            state.query = query || $stateParams;
            state.query.facet = facets;
            if (state.data.$cancelRequest) state.data.$cancelRequest();
            state.data = DatasetSearch.query(state.query, function(){
                state.failedRequest = false;
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
            state.query.offset = undefined;
            $state.go('.', state.query, {inherit:false, notify: false, reload: false});
            refreshData(state.query);
        }

        refreshData();

        return {
            getState: getState,
            update: update,
            updateParam: updateParam
        };

    });