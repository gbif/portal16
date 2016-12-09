'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('navCtrl', navCtrl);

/** @ngInject */
function navCtrl($http, $location, $rootScope, NAV_EVENTS) {
    var vm = this;

    vm.toggleNotifications = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: true});
    };

    vm.toggleFeedback = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };

    vm.toggleSearch = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {toggle: true});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };

    vm.getIssues = function () {
        $http.get('/api/feedback/issues?item=' + encodeURIComponent($location.path()), {})
            .then(function (response) {
                vm.issuesCount = response.data.total_count;
            }, function (err) {
                vm.issuesCount = undefined;
                //TODO mark as failure or simply hide
            });
    };
    vm.getIssues();
}

module.exports = navCtrl;