'use strict';

angular
    .module('portal')
    .controller('dataRepoCtrl', dataRepoCtrl);

/** @ngInject */
function dataRepoCtrl() {
    var vm = this;
    vm.greeting = 'Hi senor Mendez from angular';
}

module.exports = dataRepoCtrl;
