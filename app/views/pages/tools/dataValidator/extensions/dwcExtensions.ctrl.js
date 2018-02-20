'use strict';

var fixedUtil = require('../../../dataset/key/main/submenu');
angular
    .module('portal')
    .controller('dwcExtensionsCtrl', dwcExtensionsCtrl);

/** @ngInject */
function dwcExtensionsCtrl(DwcExtension, $stateParams, $timeout, $anchorScroll) {
    var vm = this;
    vm.extensions = DwcExtension.get();

    vm.extensions.$promise.then(function() {
        $timeout(function() {
            $anchorScroll();
        });
    });
    if ($stateParams.jobid) {
    vm.jobid = $stateParams.jobid;
    }


    vm.attachTabListener = function() {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function() {
        fixedUtil.updateMenu();
    };
}

module.exports = dwcExtensionsCtrl;
