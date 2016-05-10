'use strict';

// The downloadEventsTableCtrl controller needs occurrence download as a service.
require('../../shared/layout/html/angular/occurrenceDownload.factory.js');

var angular = require('angular');

angular
    .module('portal')
    .controller('downloadEventsTableCtrl', downloadEventsTableCtrl);

/** @ngInject */
function downloadEventsTableCtrl(DownloadEventsService) {
    // vm stands for view model. See http://stackoverflow.com/questions/33740308/what-does-var-vm-this-mean-in-angular-controllers
    var vm = this;
    vm.events = [];
    var limit = 5;
    var offset = 0;
    var uuid = 'a4555281-5046-424f-9cd1-e7c103234416';
    DownloadEventsService.get({uuid: uuid, limit: limit}).$promise.then(
        function (res) {
            vm.events = res.results;
        }, function (errRes) {
        }
    );

    vm.getMoreData = function () {
        offset = offset + limit;
        DownloadEventsService.get({uuid: uuid, limit: limit, offset: offset}).$promise.then(
            function (res) {
                vm.events = vm.events.concat(res.results);
            }, function (errRes) {
            }

        );
    }

}

module.exports = downloadEventsTableCtrl;