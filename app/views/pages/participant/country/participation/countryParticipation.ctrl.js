'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryParticipationCtrl', countryParticipationCtrl);

/** @ngInject */
function countryParticipationCtrl($stateParams) {
    var vm = this;
    vm.countryCode = $stateParams.key;
}

module.exports = countryParticipationCtrl;
