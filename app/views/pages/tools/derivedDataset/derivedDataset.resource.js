'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('DerivedDatasetDatasets', function($resource, env) {
            return $resource(env.dataApi + 'derivedDataset/:prefix/:suffix/datasets', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('DerivedDatasetSearch', function($resource, env) {
            return $resource(env.dataApi + 'derivedDataset/user/:username', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        });
})();

