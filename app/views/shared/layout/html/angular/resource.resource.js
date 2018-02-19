'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        // .factory('Resource', function ($resource, env) { //this should ask a contentful proxy (to allow caching)
        //    return $resource(env.dataApi + 'organization/:id', null, {
        //            'query': {
        //                method: 'GET',
        //                isArray: false
        //            }
        //        }
        //    );
        // })
        .factory('ResourceSearch', function($resource) {
            return $resource('/api/resource/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('ResourceItem', function($resource) {
            return $resource('/api/resource/item', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
    ;
})();

