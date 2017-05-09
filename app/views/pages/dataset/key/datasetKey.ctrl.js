'use strict';

var angular = require('angular');
require('./text/submenu');
require('../../species/key/directives/taxBrowser.directive.js');

angular
    .module('portal')
    .controller('datasetKeyCtrl', datasetKeyCtrl);

/** @ngInject */
function datasetKeyCtrl($localStorage) {
    var vm = this;
    vm.bibExpand = {
        isExpanded: false
    };
    vm.key = gb.datasetKey.key; //TODO what would be a better way to do this? an bootstraped constant possibly?

    vm.displayPreferences = $localStorage.displayPreferences;

    vm.displayPreferences = {
        datasetKey: {
            highlights: ['homepage']
        }
    };

    $localStorage.displayPreferences = vm.displayPreferences;
}

module.exports = datasetKeyCtrl;
