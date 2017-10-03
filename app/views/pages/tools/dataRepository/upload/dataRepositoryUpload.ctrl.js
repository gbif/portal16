'use strict';

angular
    .module('portal')
    .controller('dataRepositoryUploadCtrl', dataRepositoryUploadCtrl);

/** @ngInject */
function dataRepositoryUploadCtrl() {
    var vm = this;
    vm.test = 'upload test';
}

module.exports = dataRepositoryUploadCtrl;
