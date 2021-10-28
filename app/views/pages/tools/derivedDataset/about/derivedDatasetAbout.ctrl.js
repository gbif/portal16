'use strict';

angular
    .module('portal')
    .controller('derivedDatasetAboutCtrl', derivedDatasetAboutCtrl);

/** @ngInject */
function derivedDatasetAboutCtrl() {
    var vm = this;
    vm.test = 'about test';
}

module.exports = derivedDatasetAboutCtrl;
