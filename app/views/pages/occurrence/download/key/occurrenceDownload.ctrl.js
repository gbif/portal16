'use strict';

var angular = require('angular'),
moment = require('moment'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('occurrenceDownloadKeyCtrl', occurrenceDownloadKeyCtrl);

/** @ngInject */
function occurrenceDownloadKeyCtrl($timeout, $scope, $window, $location, $rootScope, NAV_EVENTS, endpoints, $http, $sessionStorage) {
    var vm = this;
    vm.HUMAN = true;
    vm.maxSize = 5;
    vm.doi = _.get(gb, 'downloadKey.doi', '').replace(/^.*(10\.)/, '10.');
    vm.key = gb.downloadKey.key;
    vm.downloadState = gb.downloadKey.status;
    vm.profile = $sessionStorage.user;

    // if (vm.doi) {
    // A hardcoded limit and no pagination for now. Currently we never have a download citet more than once. If this change in the future we ought to add pagination and link more to resource search
    //    vm.literature = ResourceSearch.query({contentType: 'literature', q: '"' + vm.doi + '"', limit: 5});
    // }

    vm.openHelpdesk = function() {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: 'QUESTION'});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };

    vm.pageChanged = function() {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        $location.hash('datasets');
        $scope.$watchCollection($location.search('offset', vm.offset), function() {
            $window.location.reload();
        });
    };

    vm.setInitials = function(offset, limit, key) {
        vm.offset = offset || 0;
        vm.limit = limit;
        vm.key = key;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    };

    vm.cancelDownload = function(key) {
        var cancel = $http.get(endpoints.cancelDownload + key);
        cancel.then(function() {
            location.reload();
        }, function(err) {
            // TODO tell user the download failed to be cancelled
        });
    };

    function getDownload() {
        $http.get('/api/occurrence/download/' + vm.key, {params: {nonse: Math.random()}})
            .then(function(response) {
                vm.download = response.data;
                parseDeletionDate(vm.download);
                vm.isUsersDownload = (typeof vm.download.request.creator === 'string' && (vm.download.request.creator == _.get(vm.profile, 'userName')));
                if (vm.isUsersDownload && vm.isCancelable) {
                    if (response.data.status !== 'RUNNING' && response.data.status !== 'PREPARING') {
                        vm.isCancelable = false;
                        $timeout(
                            function() {
                                location.reload();
                            }, 5000);
                    } else {
                        $timeout(getDownload, 3000);
                    }
                }
            });
    }

    if (vm.downloadState === 'RUNNING' || vm.downloadState === 'PREPARING') {
        vm.isCancelable = true;
    }
    getDownload();

    // is erasure date is within the next N moths, then allow user to postpone the deletion
    function parseDeletionDate(download) {
        if (download.eraseAfter) {
            var pointInFuture = moment().add(7, 'months');
            vm.willBeDeletedSoon = moment(download.eraseAfter).isBefore(pointInFuture);
            vm.readyForDeletion = moment(download.eraseAfter).isBefore(moment().add(1, 'day'));
        }
    }

    vm.deleteDownload = function() {
        if (vm.isUsersDownload) {
            $http.post('/api/occurrence/download/' + vm.key + '/delete')
                .then(function(response) {
                    location.reload();
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    };

    vm.postponeDeletion = function() {
        if (vm.isUsersDownload) {
            $http.post('/api/occurrence/download/' + vm.key + '/postpone')
                .then(function(response) {
                    location.reload();
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    };
}

angular.module('portal').controller('infoModalInstanceCtrl', function($uibModalInstance) {
    var $ctrl = this;

    $ctrl.ok = function() {
        $uibModalInstance.close();
    };
});

module.exports = occurrenceDownloadKeyCtrl;
