'use strict';

angular
    .module('portal')
    .controller('occurrenceSnapshotsCtrl', occurrenceSnapshotsCtrl);

/** @ngInject */
function occurrenceSnapshotsCtrl(User, $http, $scope, AUTH_EVENTS, $sessionStorage, $stateParams, $state, env, $uibModal) {
    var vm = this;
    vm.$state = $state;
    vm.snapshots = [];
    vm.donwloads = [];
    vm.localePrefix = gb.locale === 'en' ? '/' : gb.locale + '/';
    vm.downloadsPagination = {
        currentPage: 1,
        pageSize: 10
    };
    vm.snapshotsPagination = {
        currentPage: 1,
        pageSize: 10
    };
    vm.loading = true;
    vm.search = function() {
        // TODO add headers when backend is ready
            $http({
                method: 'get',
                url: '/api/occurrence-snapshots',
                params: {limit: 500, offset: 0}
            }).then(function(res) {
                vm.loading = false;
                vm.snapshots = res.data.results;
                vm.downloads = res.data.results.filter(function(r) {
                    return r.request.format === 'SIMPLE_PARQUET';
                });
                vm.limit = res.data.limit;
                vm.offset = res.data.offset;
                vm.count = res.data.count;
                vm.endOfRecords = res.data.endOfRecords;
            }).catch(function(err) {
                vm.loading = false;
                vm.snapshots = err.data;
            });
    };
   vm.search();

   vm.open = function (download) {
    vm.currentDownload = download;
    vm.openPredicateModal(download);
  };

  vm.openPredicateModal = function (download) {
    var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      resolve: {
        options: function () {
          return {download: download};
        }
      } 
    });

    modalInstance.result.then(function (options) {
    }, function () {
      // user clicked cancel
    });
  };
}

module.exports = occurrenceSnapshotsCtrl;
