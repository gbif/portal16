'use strict';

angular
    .module('portal')
    .controller('dataValidatorAboutCtrl', dataValidatorAboutCtrl);

/** @ngInject */
function dataValidatorAboutCtrl($stateParams) {
    let dataValidatorAbout = this;
    dataValidatorAbout.test = 'about test';
    if ($stateParams.jobid) {
        dataValidatorAbout.jobid = $stateParams.jobid;
}
}

module.exports = dataValidatorAboutCtrl;
