'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('installationKeyCtrl', installationKeyCtrl);

/** @ngInject */
function installationKeyCtrl($state, $stateParams, $anchorScroll, InstallationDatasets, InstallationExtended, Publisher, BUILD_VERSION) {
    var vm = this;
    vm.BUILD_VERSION = BUILD_VERSION;
    vm.servedDatasets = {};
    vm.maxSize = 5;
    vm.limit = 20;
    vm.key = $stateParams.key;
    vm.installation = InstallationExtended.get({id:vm.key});

    vm.installation.$promise.then(function(installation){
        vm.publisher = Publisher.get({id: installation.organizationKey});
        console.log('installation');
        if (installation.type == 'IPT_INSTALLATION') {
            var iptRssFeed = _.find(installation.endpoints, ['type', 'FEED']);
            if (iptRssFeed) {
                var iptHomePage = iptRssFeed.url.replace(/rss\.do$/, '');
                installation.homepage = [iptHomePage];
            }
        }
    });


    vm.getDatasets = function () {
        InstallationDatasets.get({id: vm.key, limit: vm.limit, offset: vm.offset},
            function (response) {
                vm.servedDatasets = response;
                    $anchorScroll(['servedDatasets']);
            },
            function () {
                //TODO handle errors
            }
        );
    };

    vm.setPageNumbers = function () {
        vm.offset = $stateParams.offset || 0;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
        vm.getDatasets();
    };
    vm.setPageNumbers();

    vm.pageChanged = function () {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        var offset = vm.offset == 0 ? undefined : vm.offset;
        $state.go($state.current, {limit: vm.limit, offset: offset, '#': 'servedDatasets'}, {inherit: true, notify: false, reload: true});
        vm.getDatasets();
    };

}


module.exports = installationKeyCtrl;
