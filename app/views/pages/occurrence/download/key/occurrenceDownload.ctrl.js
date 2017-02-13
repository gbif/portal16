'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceDownloadKeyCtrl', occurrenceDownloadKeyCtrl);

/** @ngInject */
function occurrenceDownloadKeyCtrl($state, $rootScope, NAV_EVENTS) {
    var vm = this;
    vm.HUMAN = true;

    vm.openHelpdesk = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: 'QUESTION'});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };
}

module.exports = occurrenceDownloadKeyCtrl;
