'use strict';

angular
    .module('portal')
    .controller('dataValidatorCtrl', dataValidatorCtrl);

/** @ngInject */
function dataValidatorCtrl() {
    var vm = this;
    vm.greeting = 'Salut Christian!';
}

module.exports = dataValidatorCtrl;