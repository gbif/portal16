'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('derivedDatasetKeyCtrl', derivedDatasetKeyCtrl);

/** @ngInject */
function derivedDatasetKeyCtrl($stateParams, toastService, env) {
    var vm = this;
    vm.env = env;
    vm.prefix = $stateParams.prefix;
    vm.suffix = $stateParams.suffix;
    vm.citationString = gb.derivedDataset.citationString;
    vm.hasClipboard = _.get(navigator, 'clipboard.writeText');
    vm.locale = gb.locale;
    vm.pageChanged = function() {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        window.location.href = window.location.origin + window.location.pathname + '?offset=' + vm.offset + '#datasets';
    };

    vm.setInitials = function(offset, limit) {
        vm.offset = offset || 0;
        vm.limit = limit;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    };

    vm.toClipboard = function() {
      navigator.clipboard.writeText(vm.citationString).then(function() {
        /* clipboard successfully set */
        toastService.info({message: 'Copied'});
      }, function() {
        /* clipboard write failed */
        toastService.error({message: 'Failed - please select the text manually instead'});
      });
    };
}

module.exports = derivedDatasetKeyCtrl;
