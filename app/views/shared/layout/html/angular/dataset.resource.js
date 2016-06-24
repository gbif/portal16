'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Dataset', function($resource, env) {
            return $resource(env.dataApi + 'dataset/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetSearch', function($resource, env) {
            //var facets = {
            //    facet: ['type', 'keyword', 'publishing_org', 'hosting_org', 'publishing_country', 'decade']
            //};
            return $resource('/api/dataset/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
    ;

})();

