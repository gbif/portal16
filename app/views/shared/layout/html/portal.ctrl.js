'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('portalCtrl', portalCtrl);

/** @ngInject */
function portalCtrl($rootScope, BUILD_VERSION, env, constantKeys, NAV_EVENTS, IS_TOUCH, Page) {
    var vm = this;
    vm.env = env;
    vm.BUILD_VERSION = BUILD_VERSION;
    vm.constantKeys = constantKeys;
    vm.dataApi = env.dataApi;
    vm.dataApiV2 = env.dataApiV2;
    vm.tileApi = env.tileApi;
    vm.imageCache = env.imageCache;
    vm.mapCapabilities = env.mapCapabilities;
    vm.IS_TOUCH = IS_TOUCH;
    vm.getDrawer = Page.drawer;

    vm.openHelpdesk = function (type) {
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: type});
    };
}

module.exports = portalCtrl;
