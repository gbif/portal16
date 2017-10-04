'use strict';

angular
    .module('portal')
    .controller('dataValidatorAboutCtrl', dataValidatorAboutCtrl);

/** @ngInject */
function dataValidatorAboutCtrl($stateParams) {
    var vm = this;
    vm.test = 'about test';
    if($stateParams.jobid){
        vm.jobid = $stateParams.jobid;
}
}

module.exports = dataValidatorAboutCtrl;
