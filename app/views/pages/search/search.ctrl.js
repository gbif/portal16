'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl() {
    var vm = this;
    vm.compactTaxonResult = true;
    vm.selectedTaxonId;
}

module.exports = searchCtrl;