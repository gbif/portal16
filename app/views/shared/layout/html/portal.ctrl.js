'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('portalCtrl', portalCtrl);

/** @ngInject */
function portalCtrl($rootScope, $sessionStorage, BUILD_VERSION, env, constantKeys, NAV_EVENTS, IS_TOUCH, Page) {
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

    vm.hasRole = function(roles){
        roles = _.isString(roles) ? [roles] : roles;
        return _.intersection(_.get($sessionStorage, 'user.roles', []), roles).length > 0;
    };
}

module.exports = portalCtrl;
