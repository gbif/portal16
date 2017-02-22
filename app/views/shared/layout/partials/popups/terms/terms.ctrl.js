'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('termsCtrl', termsCtrl);

/** @ngInject */
function termsCtrl($localStorage) {
    var vm = this;
    vm.userAcceptance = $localStorage.userAcceptance;
    vm.accept = function () {
        $localStorage.userAcceptance = true;
        vm.userAcceptance = true;
    }
}

module.exports = termsCtrl;