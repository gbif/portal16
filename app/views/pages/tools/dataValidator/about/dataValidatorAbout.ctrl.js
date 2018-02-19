'use strict';

angular
    .module('portal')
    .controller('dataValidatorAboutCtrl', dataValidatorAboutCtrl);

/** @ngInject */
function dataValidatorAboutCtrl($stateParams) {
    var dataValidatorAbout = this;
    dataValidatorAbout.test = 'about test';
    if ($stateParams.jobid) {
        dataValidatorAbout.jobid = $stateParams.jobid;
}
}

module.exports = dataValidatorAboutCtrl;
