/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceCtrl', occurrenceCtrl);

/** @ngInject */
function occurrenceCtrl($stateParams, $state) {
    var vm = this;
    vm.query = angular.copy($stateParams);

    vm.goto = function() {
        $state.go($state.current, vm.query);
    };
}

module.exports = occurrenceCtrl;