'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('DataPackage', function ($resource, env) {
            return $resource(env.dataApi + 'data_packages/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DataPackageSearch', function ($resource, env) {
            return $resource(env.dataApi + 'data_packages', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        });
})();

