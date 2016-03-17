'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl($state, $translate) {
    var vm = this;
    vm.compactTaxonResult = true;
    vm.selectedTaxonId;
}

module.exports = searchCtrl;