'use strict';

var angular = require('angular');
require('./dataset/networkDataset.ctrl');
require('./publisher/networkPublisher.ctrl');
require('./metrics/networkMetrics.ctrl');

angular
    .module('portal')
    .controller('networkKeyCtrl', networkKeyCtrl);

/** @ngInject */
function networkKeyCtrl(Page, $state, $stateParams, ResourceItem, Network, OccurrenceSearch, NetworkDatasets, NetworkPublishers, $anchorScroll) {
    var vm = this;
    vm.$state = $state;
    Page.drawer(false);
    vm.key = $stateParams.key;
    vm.networkApiItem = Network.get({id: vm.key});
    vm.network = ResourceItem.get({contentType: 'network', networkKey: vm.key});
    vm.occurrences = OccurrenceSearch.query({network_key: vm.key, limit: 0});

    // delete once we move once we go to the new contentful driven network pages issue #725
    vm.datasets = {};
    vm.maxSize = 5;
    vm.limit = 20;

    vm.getDatasets = function() {
        NetworkDatasets.get({id: vm.key, limit: vm.limit, offset: vm.offset},
            function(response) {
                vm.datasets = response;
                $anchorScroll(['datasets']);
            },
            function() {
                // TODO handle errors
            }
        );
    };

    vm.getPublishers = function() {
        NetworkPublishers.get({id: vm.key, limit: 0},
            function(response) {
                vm.publishers = response;
            },
            function() {
                // TODO handle errors
            }
        );
    };
    vm.getPublishers();

    vm.setPageNumbers = function() {
        vm.offset = $stateParams.offset || 0;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
        vm.getDatasets();
    };
    vm.setPageNumbers();

    vm.pageChanged = function() {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        var offset = vm.offset == 0 ? undefined : vm.offset;
        $state.go($state.current, {'limit': vm.limit, 'offset': offset, '#': 'datasets'}, {inherit: true, notify: false, reload: true});
        vm.getDatasets();
    };

    // delete end
}

module.exports = networkKeyCtrl;
