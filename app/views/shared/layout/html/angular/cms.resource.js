'use strict';

let angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('CmsSearch', function($resource) {
            return $resource('/api/cms/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                    },
                }
            );
        })
        // Accepting gbifRegion as param
        // return number of publishers in the region
        .factory('LiteratureCount', function($resource) {
            return $resource('/api/literature/count',
                {gbifRegion: 'GLOBAL'},
                {
                    'get': {
                        method: 'GET',
                        params: {gbifRegion: '@gbifRegion'},
                        isArray: false,
                    },
                })
                ;
        })
        .factory('LiteratureYearly', function($resource) {
            return $resource('/api/literature-yearly/count',
                {gbifRegion: 'GLOBAL'},
                {
                    'get': {
                        method: 'GET',
                        params: {gbifRegion: '@gbifRegion'},
                        isArray: true,
                    },
                })
                ;
        })
        ;
})();

