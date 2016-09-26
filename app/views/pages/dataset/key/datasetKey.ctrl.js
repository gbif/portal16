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

    vm.latLon = {lat: 45, lon: 10};
    
}

module.exports = datasetKeyCtrl;