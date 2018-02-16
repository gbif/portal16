'use strict';

angular
    .module('portal')
    .controller('dataRepositoryAboutCtrl', dataRepositoryAboutCtrl);

/** @ngInject */
function dataRepositoryAboutCtrl() {
    let vm = this;
    vm.test = 'about test';
}

module.exports = dataRepositoryAboutCtrl;
