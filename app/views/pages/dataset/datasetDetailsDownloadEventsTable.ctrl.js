'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('downloadEventsTableCtrl', downloadEventsTableCtrl)
    // A GBIF Registry service that exposes /organization access point.
    .factory('DownloadEventsService', ['$http', function($http) {
        return {
            list: function() {
                return $http.get('http://api.gbif.org/v1/occurrence/download/dataset' + '/' + uuid, {params: {limit: 20}});
            }
        };
    }]);

/** @ngInject */
function downloadEventsTableCtrl($filter, ngTableParams, DownloadEventsService) {
    // vm stands for view model. See http://stackoverflow.com/questions/33740308/what-does-var-vm-this-mean-in-angular-controllers
    var vm = this;
}

module.exports = downloadEventsTableCtrl;