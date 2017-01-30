'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .service('Remarks', function ($http) {
            var remarks = $http.get('http://api.gbif.org/v1/occurrence/interpretation');
            return remarks;
        });
})();

