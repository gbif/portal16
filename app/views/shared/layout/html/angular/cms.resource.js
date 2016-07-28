'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Cms', function($resource, env) {
            return $resource(env.cmsApi + 'node/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('CmsSearch', function($resource) {
            //var facets = {
            //    facet: ['type', 'language', 'category_informatics', 'category_data_use', 'category_capacity_enhancement', 'category_about_gbif', 'category_audience', 'category_purpose', 'category_data_type', 'category_resource_type', 'category_country', 'category_topic', 'category_tags']
            //};
            return $resource('/api/cms/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
    ;

})();

