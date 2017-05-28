'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('occurrenceDownloadKeyCtrl', occurrenceDownloadKeyCtrl);

/** @ngInject */
function occurrenceDownloadKeyCtrl($scope, $window, $location, $rootScope, NAV_EVENTS, $uibModal, ResourceSearch) {
    var vm = this;
    vm.HUMAN = true;
    vm.maxSize = 5;
    vm.doi = _.get(gb, 'downloadKey.doi', '').substring(4);
vm.test = 20;
    if (vm.doi) {
        vm.literature = ResourceSearch.query({contentType: 'literature', q: '"' + vm.doi + '"'});
    }

    vm.openHelpdesk = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: 'QUESTION'});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };

    vm.openAboutStorage = function (format) {
        $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'downloadKeyStorageInfo.html',
            controller: 'infoModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
                format: function () {
                    return format;
                }
            }
        });
    };

    vm.pageChanged = function () {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        $location.hash('datasets');
        $scope.$watchCollection($location.search('offset', vm.offset), function () {
            $window.location.reload();
        })
    };

    vm.setInitials = function (offset, limit, key) {
        vm.offset = offset || 0;
        vm.limit = limit;
        vm.key = key;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    };

}

angular.module('portal').controller('infoModalInstanceCtrl', function ($uibModalInstance) {
    var $ctrl = this;

    $ctrl.ok = function () {
        $uibModalInstance.close();
    };
});

module.exports = occurrenceDownloadKeyCtrl;
