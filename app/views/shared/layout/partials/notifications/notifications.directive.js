'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('notifications', notificationsDirective);

/** @ngInject */
function notificationsDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/api/notifications/template.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: notifications,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function notifications($scope, NAV_EVENTS) {
        var vm = this;
        vm.isActive = false;

        $scope.$on(NAV_EVENTS.toggleNotifications, function (event, data) {
            if (data.toggle) {
                vm.isActive = !vm.isActive;
            } else {
                vm.isActive = data.state;
            }
        });

        vm.close = function () {
            vm.isActive = false;
        };

        //vm.getNotifications = function () {
        //    $http.get('/api/notifications/announcements', {})
        //        .then(function (response) {
        //            vm.announcements = response.data;
        //        }, function (err) {
        //            vm.issues = {};
        //            //TODO mark as failure or simply hide
        //        });
        //};
        //vm.getNotifications();
    }
}

module.exports = notificationsDirective;

