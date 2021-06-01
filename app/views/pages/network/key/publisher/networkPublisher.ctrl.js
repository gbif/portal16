'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('networkPublisherCtrl', networkPublisherCtrl);

/** @ngInject */
function networkPublisherCtrl($state, $stateParams, NetworkPublishers) {
    var vm = this;
    vm.$state = $state;
    vm.publishers = {};
    vm.maxSize = 5;
    vm.limit = 20;
    vm.key = $stateParams.key;

    vm.getPublishers = function() {
      NetworkPublishers.get({id: vm.key, limit: vm.limit, offset: vm.offset},
          function(response) {
              vm.publishers = response;
          },
          function() {
              // TODO handle errors
          }
      );
  };

    vm.setPageNumbers = function() {
        vm.offset = $stateParams.offset || 0;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
        vm.getPublishers();
    };
    vm.setPageNumbers();

    vm.pageChanged = function() {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        var offset = vm.offset == 0 ? undefined : vm.offset;
        $state.go($state.current, {'limit': vm.limit, 'offset': offset}, {inherit: true, notify: false, reload: true});
        vm.getPublishers();
    };
}


module.exports = networkPublisherCtrl;
