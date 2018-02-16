'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('DwcExtension', function ($resource) {
            return $resource('/api/dwc/extensions', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })


})();

