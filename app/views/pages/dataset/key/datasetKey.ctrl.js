'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetKeyCtrl', datasetKeyCtrl);

/** @ngInject */
function datasetKeyCtrl() {
    var vm = this;
    vm.bibExpand = {
        isExpanded: false
    };
    
}

module.exports = datasetKeyCtrl;