'use strict';

// The downloadEventsTableCtrl controller needs occurrence download as a service.
require('../../../shared/layout/html/angular/occurrence.resource.js');
require('../../../shared/layout/html/angular/species.resource.js');

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
    var uuid = (typeof datasetKey !== 'undefined') ? datasetKey : ''; // This key is passed through the template.

    var concatenateValues = function (events) {
        // Use the "processedValue" if it's provided by the server side.
        events.forEach(function (event) {
            event.queryTable.forEach(function (query) {
                query.valueProcessed = '';
                if (query.processedValue.length != 0) {
                    query.valueProcessed = query.processedValue;
                }
                else {
                    query.filterValues.forEach(function (v, vi) {
                        if (vi != 0) query.valueProcessed += ', ';
                        query.valueProcessed += v.value;
                    });
                }
            });
        });
    };

    DownloadEventsService.get({id: uuid, limit: limit}).$promise.then(
        function (res) {
            vm.events = res.results;
        }, function () {
        }
    );

    vm.getMoreData = function () {
        offset = offset + limit;
        DownloadEventsService.get({id: uuid, limit: limit, offset: offset}).$promise.then(
            function (res) {
                vm.events = vm.events.concat(res.results);
                concatenateValues(vm.events);
            }, function () {
            }
        );
    };
}

module.exports = downloadEventsTableCtrl;