'use strict';

let angular = require('angular');

angular
    .module('portal')
    .controller('countryParticipationCtrl', countryParticipationCtrl);

/** @ngInject */
function countryParticipationCtrl($stateParams) {
    let vm = this;
    vm.countryCode = $stateParams.key;
}

module.exports = countryParticipationCtrl;
