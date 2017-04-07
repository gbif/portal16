'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('resourceCtrl', resourceCtrl);

/** @ngInject */
function resourceCtrl($state, ResourceFilter) {
    var vm = this;
    vm.state = ResourceFilter.getState();

    vm.filters = {};

    vm.search = function () {
        $state.go('.', vm.state.query, {inherit: false, notify: true, reload: true});
    };
}

module.exports = resourceCtrl;

