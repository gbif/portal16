'use strict';

var angular = require('angular');
require('./text/submenu');

angular
    .module('portal')
    .controller('datasetKeyCtrl', datasetKeyCtrl);

/** @ngInject */
function datasetKeyCtrl() {
    var vm = this;
    vm.bibExpand = {
        isExpanded: false
    };
    vm.key = gb.datasetKey.key; //TODO what would be a better way to do this? an bootstraped constant possibly?
}

module.exports = datasetKeyCtrl;