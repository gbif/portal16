'use strict';

let angular = require('angular');

angular
    .module('portal')
    .controller('suggestDatasetCtrl', suggestDatasetCtrl);

/** @ngInject */
function suggestDatasetCtrl($http) {
    let vm = this;
    vm.suggestion = {};
    vm.state = 'ENTER';
    vm.referenceId = '';

    vm.createSuggestion = function() {
        $http.post('/api/tools/suggest-dataset', {form: vm.suggestion}, {}).then(function(response) {
            vm.referenceId = response.data.referenceId;
            vm.state = 'SUCCESS';
        }, function() {
            vm.state = 'FAILED';
        });
    };
}

module.exports = suggestDatasetCtrl;
