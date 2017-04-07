'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('ResourceFilter', function ($rootScope, $state, $stateParams, ResourceSearch) {
        var state = {
            data: {},
            facetMultiselect: {},
            failedRequest: false,
            query: $stateParams
        };

        function getState() {
            return state;
        }

        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams) {
                refreshData(toParams);
            }
        );

        function refreshData(query) {
            var apiQuery;
            state.query = query || $stateParams;
            apiQuery = angular.copy(state.query);

            if (state.data.$cancelRequest) state.data.$cancelRequest();
            state.data = ResourceSearch.query(apiQuery, function () {
                state.failedRequest = false;
            }, function () {
                state.failedRequest = true;
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

        //when in not advanced mode then remove parameters from URL that are filled with default values
        state.query = $stateParams;
        refreshData(state.query);

        return {
            getState: getState,
            update: update,
            updateParam: updateParam,
            refresh: refresh
        };

    });