'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('LifeStage', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/LifeStage/concepts/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('LifeStageSearch', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/LifeStage/concepts', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
    ;
})();

