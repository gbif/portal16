'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('termsCtrl', termsCtrl);

/** @ngInject */
function termsCtrl(localStorageService) {
    var vm = this;
    vm.userAcceptance = localStorageService.get('userAcceptance');
    vm.accept = function() {
        localStorageService.set('userAcceptance', true);
        vm.userAcceptance = true;
    }
}

module.exports = termsCtrl;