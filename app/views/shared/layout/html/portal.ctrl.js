'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('portalCtrl', portalCtrl);

/** @ngInject */
function portalCtrl(BUILD_VERSION, env, constantKeys, IS_TOUCH, Page) {
    var vm = this;
    vm.BUILD_VERSION = BUILD_VERSION;
    vm.constantKeys = constantKeys;
    vm.dataApi = env.dataApi;
    vm.dataApiV2 = env.dataApiV2;
    vm.tileApi = env.tileApi;
    vm.imageCache = env.imageCache;
    vm.mapCapabilities = env.mapCapabilities;
    vm.IS_TOUCH = IS_TOUCH;
    vm.getDrawer = Page.drawer;
}

module.exports = portalCtrl;
