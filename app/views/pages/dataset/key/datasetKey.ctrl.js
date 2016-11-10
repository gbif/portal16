'use strict';

var angular = require('angular');
require('./text/submenu');
require('./taxonomy/taxBrowser.directive.js');

angular
    .module('portal')
    .controller('datasetKeyCtrl', datasetKeyCtrl);

/** @ngInject */
function datasetKeyCtrl(localStorageService) {
    var vm = this;
    vm.bibExpand = {
        isExpanded: false
    };
    vm.key = gb.datasetKey.key; //TODO what would be a better way to do this? an bootstraped constant possibly?

    vm.displayPreferences = localStorageService.get('displayPreferences');
    console.log(vm.displayPreferences);

    vm.displayPreferences = {
        datasetKey: {
            highlights: ['homepage']
        }
    };

    localStorageService.set('displayPreferences', vm.displayPreferences);
}

module.exports = datasetKeyCtrl;