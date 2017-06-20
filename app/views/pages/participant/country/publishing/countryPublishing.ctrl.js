'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryPublishingCtrl', countryPublishingCtrl);

/** @ngInject */
function countryPublishingCtrl($stateParams, DatasetSearch) {
    var vm = this;
    vm.countryCode = $stateParams.key;

    DatasetSearch.query({publishing_country: vm.countryCode}, function (data) {
        vm.datasetsFrom = data;
    }, function () {
        //TODO handle request error
    });
}

module.exports = countryPublishingCtrl;
