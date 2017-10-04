'use strict';

var fixedUtil = require('../../../dataset/key/main/submenu');
angular
    .module('portal')
    .controller('dwcExtensionsCtrl', dwcExtensionsCtrl);

/** @ngInject */
function dwcExtensionsCtrl(DwcExtension, $stateParams) {

    var vm = this;
    vm.extensions = DwcExtension.get();
    vm.test = 'about test';
    if($stateParams.jobid){
    vm.jobid = $stateParams.jobid;
    }

    vm.attachTabListener = function () {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function () {
        fixedUtil.updateMenu();
    };
}

module.exports = dwcExtensionsCtrl;
