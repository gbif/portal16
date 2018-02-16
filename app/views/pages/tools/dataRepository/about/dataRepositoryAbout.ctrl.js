'use strict';

angular
    .module('portal')
    .controller('dataRepositoryAboutCtrl', dataRepositoryAboutCtrl);

/** @ngInject */
function dataRepositoryAboutCtrl() {
    var vm = this;
    vm.test = 'about test';
}

module.exports = dataRepositoryAboutCtrl;
